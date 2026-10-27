"use server";

import { createServerAction, ZSAError } from "zsa";
import { and, desc, eq, isNotNull, ne, notExists } from "drizzle-orm";
import { getDB } from "@/db";
import {
  newOpenId,
  openEntryTable,
  openEventTable,
  openPointRuleTable,
  openScalingTable,
  openTeamTable,
  openWeekTable,
} from "@/db/schema";
import { OPEN_AUDIT_ENTITY, OPEN_AUDIT_VERB, OPEN_EVENT_STATUS, OPEN_WEIGHT_UNIT } from "@/lib/open/constants";
import { DEFAULT_OPEN_RULES, DEFAULT_OPEN_SCALINGS } from "@/lib/open/defaults";
import { backfillCoachRequests, planCoachRoster } from "@/lib/open/coach-roster";
import { resolveEventSlug } from "@/lib/open/event-slug";
import { createOpenEventSchema, openEventIdSchema, updateOpenEventSchema } from "@/schemas/open.schema";
import { auditStatements, type OpenAuditInput } from "@/server/open/audit-write";
import { COACH_ROSTER_RACE, coachRosterStatements, loadCoachRosterState } from "@/server/open/coach-roster";
import { deleteOpenMediaKeys } from "@/server/open/media";
import {
  auditedDelete,
  auditedUpdate,
  chunkedInsert,
  loadEvent,
  requireOpenAdmin,
  revalidateOpenEvent,
  runOpenBatch,
  toFriendlyError,
  type OpenDB,
} from "@/server/open/write";

const SLUG_TAKEN = "An event with that slug already exists";

/** Creates an event with scalings (copied from the latest event, else defaults), default rules, and N weeks. */
export const createOpenEventAction = createServerAction()
  .input(createOpenEventSchema)
  .handler(async ({ input }) => {
    const session = await requireOpenAdmin();
    const db = getDB();
    const slugResult = resolveEventSlug({ slug: input.slug, name: input.name });
    if (!slugResult.ok) throw new ZSAError("INPUT_PARSE_ERROR", slugResult.message);
    const { slug } = slugResult;

    const [slugTaken, previousEvent] = await db.batch([
      db.select({ id: openEventTable.id }).from(openEventTable).where(eq(openEventTable.slug, slug)),
      db
        .select({ id: openEventTable.id })
        .from(openEventTable)
        .orderBy(desc(openEventTable.year), desc(openEventTable.createdAt))
        .limit(1),
    ]);
    if (slugTaken.length > 0) throw new ZSAError("CONFLICT", SLUG_TAKEN);

    const previousScalings = previousEvent[0]
      ? await db
          .select({ name: openScalingTable.name, slug: openScalingTable.slug, rank: openScalingTable.rank })
          .from(openScalingTable)
          .where(eq(openScalingTable.eventId, previousEvent[0].id))
      : [];

    const eventId = newOpenId.event();
    const event = {
      id: eventId,
      name: input.name,
      slug,
      year: input.year,
      status: OPEN_EVENT_STATUS.DRAFT,
      weightUnit: input.weightUnit ?? OPEN_WEIGHT_UNIT.LB,
      showIndividuals: true,
      coachPointsEnabled: false,
      coachScoresEnabled: false,
    };
    const weeks = Array.from({ length: input.weekCount }, (_, index) => ({
      id: newOpenId.week(),
      eventId,
      number: index + 1,
      label: `Week ${index + 1}`,
    }));
    const scalings = (previousScalings.length > 0 ? previousScalings : DEFAULT_OPEN_SCALINGS).map((scaling) => ({
      id: newOpenId.scaling(),
      eventId,
      name: scaling.name,
      slug: scaling.slug,
      rank: scaling.rank,
    }));
    const rules = DEFAULT_OPEN_RULES.map((rule, index) => ({
      id: newOpenId.rule(),
      eventId,
      name: rule.name,
      points: rule.points,
      cadence: rule.cadence,
      coachAwardable: rule.coachAwardable,
      sortOrder: index,
      isActive: true,
    }));

    const actor = { eventId, actorUserId: session.userId, verb: OPEN_AUDIT_VERB.CREATE };
    const audits: OpenAuditInput[] = [
      { ...actor, entityType: OPEN_AUDIT_ENTITY.EVENT, entityId: eventId, after: event, summary: `Created event "${event.name}"` },
      ...weeks.map((week) => ({
        ...actor,
        entityType: OPEN_AUDIT_ENTITY.WEEK,
        entityId: week.id,
        after: week,
        summary: `Created ${week.label}`,
      })),
      ...scalings.map((scaling) => ({
        ...actor,
        entityType: OPEN_AUDIT_ENTITY.SCALING,
        entityId: scaling.id,
        after: scaling,
        summary: `Created scaling "${scaling.name}"`,
      })),
      ...rules.map((rule) => ({
        ...actor,
        entityType: OPEN_AUDIT_ENTITY.RULE,
        entityId: rule.id,
        after: rule,
        summary: `Created rule "${rule.name}"`,
      })),
    ];

    await runOpenBatch({
      db,
      statements: [
        db.insert(openEventTable).values(event),
        ...chunkedInsert({ db, table: openWeekTable, rows: weeks }),
        ...chunkedInsert({ db, table: openScalingTable, rows: scalings }),
        ...chunkedInsert({ db, table: openPointRuleTable, rows: rules }),
        ...auditStatements({ db, entries: audits }),
      ],
      messages: { unique: SLUG_TAKEN },
    });

    revalidateOpenEvent({ eventId });
    return { id: eventId, slug };
  });

export const updateOpenEventAction = createServerAction()
  .input(updateOpenEventSchema)
  .handler(async ({ input }) => {
    const session = await requireOpenAdmin();
    const db = getDB();
    const { eventId, ...updates } = input;

    const event = await loadEvent({ db, eventId });
    if (updates.slug && updates.slug !== event.slug) {
      const taken = await db.query.openEventTable.findFirst({
        where: and(eq(openEventTable.slug, updates.slug), ne(openEventTable.id, eventId)),
        columns: { id: true },
      });
      if (taken) throw new ZSAError("CONFLICT", SLUG_TAKEN);
    }

    const { row, changed } = await auditedUpdate({
      db,
      table: openEventTable,
      entityType: OPEN_AUDIT_ENTITY.EVENT,
      eventId,
      actorUserId: session.userId,
      row: event,
      updates,
      describe: ({ after, changedKeys }) => `Updated event "${after.name}" (${changedKeys.join(", ")})`,
      messages: { unique: SLUG_TAKEN },
    });

    if (changed) revalidateOpenEvent({ eventId });
    if (event.autoRosterCoaches || !row.autoRosterCoaches) return { ...row, roster: { added: 0, notes: [] } };

    // The settings are saved; a failed backfill is reported, not thrown (re-saving off → on retries it)
    const roster = await backfillCoachRoster({ db, eventId, actorUserId: session.userId }).catch((error: unknown) => {
      const message = toFriendlyError({ error, messages: { unique: COACH_ROSTER_RACE } }).message;
      return { added: 0, notes: [`Settings saved; adding coaches failed: ${message}`] };
    });
    if (roster.added > 0) revalidateOpenEvent({ eventId });
    return { ...row, roster };
  });

/**
 * Turning `autoRosterCoaches` on: every assigned coach without an entry gets one on their first assigned team
 * (by team sortOrder). Its own batch after the settings write.
 */
async function backfillCoachRoster({ db, eventId, actorUserId }: { db: OpenDB; eventId: string; actorUserId: string }) {
  const { state, assignments, entries } = await loadCoachRosterState({ db, eventId });
  const plan = planCoachRoster({ requests: backfillCoachRequests({ assignments, state }), state, move: false });
  await runOpenBatch({
    db,
    statements: coachRosterStatements({ db, eventId, actorUserId, steps: plan.steps, entries, teams: state.teams }),
    messages: { unique: COACH_ROSTER_RACE },
  });
  return { added: plan.steps.length, notes: plan.notes };
}

const NOT_EMPTY = "Only empty draft events can be deleted; remove its athletes first, or close the event instead";

/** Empty draft events only (no entries); weeks/teams/rules/scalings/workouts go with it. One audit row. */
export const deleteOpenEventAction = createServerAction()
  .input(openEventIdSchema)
  .handler(async ({ input }) => {
    const session = await requireOpenAdmin();
    const db = getDB();
    const { eventId } = input;

    const [events, entries, teamPhotos] = await db.batch([
      db.select().from(openEventTable).where(eq(openEventTable.id, eventId)),
      db.select({ id: openEntryTable.id }).from(openEntryTable).where(eq(openEntryTable.eventId, eventId)).limit(1),
      // Team photos go with the cascade; their R2 objects are removed after the delete succeeds
      db
        .select({ photoKey: openTeamTable.photoKey })
        .from(openTeamTable)
        .where(and(eq(openTeamTable.eventId, eventId), isNotNull(openTeamTable.photoKey))),
    ]);
    const event = events[0];
    if (!event) throw new ZSAError("NOT_FOUND", "Event not found");
    if (event.status !== OPEN_EVENT_STATUS.DRAFT || entries.length > 0) throw new ZSAError("PRECONDITION_FAILED", NOT_EMPTY);

    const { deleted } = await auditedDelete({
      db,
      table: openEventTable,
      entityType: OPEN_AUDIT_ENTITY.EVENT,
      eventId,
      actorUserId: session.userId,
      row: event,
      summary: `Deleted draft event "${event.name}"`,
      // Re-checked inside the batch: no status change or athlete added since we looked
      guard: {
        condition: and(
          eq(openEventTable.status, OPEN_EVENT_STATUS.DRAFT),
          notExists(db.select({ id: openEntryTable.id }).from(openEntryTable).where(eq(openEntryTable.eventId, eventId))),
        )!,
        message: NOT_EMPTY,
        code: "PRECONDITION_FAILED",
      },
    });

    if (deleted) await deleteOpenMediaKeys(teamPhotos.map((team) => team.photoKey));
    revalidateOpenEvent({ eventId });
    return { success: true };
  });
