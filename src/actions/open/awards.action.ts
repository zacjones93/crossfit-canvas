"use server";

import { createServerAction, ZSAError } from "zsa";
import { and, eq } from "drizzle-orm";
import { getDB } from "@/db";
import { newOpenId, openAwardTable, openEntryTable, openParticipantTable } from "@/db/schema";
import { AWARD_VERB, describeAward } from "@/lib/open/audit";
import { diffAwards } from "@/lib/open/award-diff";
import { awardDedupeKey } from "@/lib/open/awards";
import { OPEN_AUDIT_ENTITY, OPEN_AUDIT_VERB, OPEN_RULE_CADENCE } from "@/lib/open/constants";
import { MANAGE_KIND } from "@/lib/open/permissions";
import {
  addUnlimitedAwardSchema,
  removeAwardSchema,
  setAwardSchema,
  setAwardsForRuleWeekSchema,
} from "@/schemas/open.schema";
import { auditStatement, auditStatements, type OpenAuditInput } from "@/server/open/audit-write";
import { assertCanManageEntry, assertEntryInContext, loadManageContext } from "@/server/open/permissions";
import {
  auditedDelete,
  auditedDeleteStatements,
  chunkedInsert,
  requireOpenSession,
  revalidateOpenEvent,
  runOpenBatch,
  type OpenDB,
} from "@/server/open/write";

type OpenSession = Awaited<ReturnType<typeof requireOpenSession>>;
type EntryManageContext = Awaited<ReturnType<typeof assertCanManageEntry>>;
type AwardRow = typeof openAwardTable.$inferSelect;

const CONCURRENT_EDIT = "Someone else just changed these awards; refresh and try again";
const USE_ADD_REMOVE = "This rule can be awarded repeatedly; use add/remove for repeatable rules";

function summarize({
  verb,
  context,
  points,
}: {
  verb: (typeof AWARD_VERB)[keyof typeof AWARD_VERB];
  context: EntryManageContext;
  points: number;
}) {
  return describeAward({
    verb,
    ruleName: context.rule!.name,
    weekLabel: context.week?.label,
    athlete: context.entry.participant.name,
    points,
  });
}

/** Inserts one award (+ audit). For keyed rules, a unique-index race means it already exists: success. */
async function insertAward({
  db,
  session,
  context,
  dedupeKey,
  note,
}: {
  db: OpenDB;
  session: OpenSession;
  context: EntryManageContext;
  dedupeKey: string | null;
  note?: string | null;
}) {
  const rule = context.rule!;
  const award = {
    id: newOpenId.award(),
    entryId: context.entry.id,
    ruleId: rule.id,
    weekId: context.week?.id ?? null,
    points: rule.points,
    dedupeKey,
    note: note ?? null,
    awardedByUserId: session.userId,
  };

  try {
    await runOpenBatch({
      db,
      statements: [
        db.insert(openAwardTable).values(award),
        auditStatement({
          db,
          eventId: context.event.id,
          actorUserId: session.userId,
          verb: OPEN_AUDIT_VERB.CREATE,
          entityType: OPEN_AUDIT_ENTITY.AWARD,
          entityId: award.id,
          after: award,
          summary: summarize({ verb: AWARD_VERB.AWARDED, context, points: award.points }),
        }),
      ],
    });
  } catch (error) {
    if (error instanceof ZSAError && error.code === "CONFLICT") return { changed: false, awardId: null };
    throw error;
  }
  return { changed: true, awardId: award.id };
}

/** Deletes one award + audit; already gone (e.g. double click) = no-op without a second audit row. */
async function deleteAward({
  db,
  session,
  context,
  award,
}: {
  db: OpenDB;
  session: OpenSession;
  context: EntryManageContext;
  award: AwardRow;
}) {
  const { deleted } = await auditedDelete({
    db,
    table: openAwardTable,
    entityType: OPEN_AUDIT_ENTITY.AWARD,
    eventId: context.event.id,
    actorUserId: session.userId,
    row: award,
    summary: summarize({ verb: AWARD_VERB.REMOVED, context, points: award.points }),
  });
  return { changed: deleted, awardId: award.id };
}

/**
 * Idempotent toggle of one athlete's award for a `per_week` / `once_per_event` rule, keyed by
 * `awardDedupeKey`. Repeatable (`unlimited`) rules use addUnlimitedAward / removeAward.
 */
export const setAwardAction = createServerAction()
  .input(setAwardSchema)
  .handler(async ({ input }) => {
    const session = await requireOpenSession();
    const db = getDB();
    const { eventId, entryId, ruleId, weekId, awarded, note } = input;

    const context = await assertCanManageEntry({
      session,
      eventId,
      entryId,
      kind: MANAGE_KIND.POINTS,
      ruleId,
      weekId: weekId ?? undefined,
    });
    const rule = context.rule!;
    const dedupeKey = awardDedupeKey({ cadence: rule.cadence, weekId: context.week?.id ?? null });
    if (dedupeKey === null) throw new ZSAError("PRECONDITION_FAILED", USE_ADD_REMOVE);

    const existing = await db.query.openAwardTable.findFirst({
      where: and(eq(openAwardTable.entryId, entryId), eq(openAwardTable.ruleId, ruleId), eq(openAwardTable.dedupeKey, dedupeKey)),
    });

    let result: { changed: boolean; awardId: string | null };
    if (awarded) {
      result = existing ? { changed: false, awardId: existing.id } : await insertAward({ db, session, context, dedupeKey, note });
    } else {
      result = existing ? await deleteAward({ db, session, context, award: existing }) : { changed: false, awardId: null };
    }

    if (result.changed) revalidateOpenEvent({ eventId });
    return result;
  });

/**
 * Desired-state sync for one grid column (rule × week): `entryIds` should hold the award, every
 * other entry the actor may manage should not. Coaches never touch other teams' awards.
 * Not for `unlimited` rules.
 */
export const setAwardsForRuleWeekAction = createServerAction()
  .input(setAwardsForRuleWeekSchema)
  .handler(async ({ input }) => {
    const session = await requireOpenSession();
    const db = getDB();
    const { eventId, ruleId, weekId, entryIds } = input;

    const context = await loadManageContext({
      session,
      eventId,
      kind: MANAGE_KIND.POINTS,
      ruleId,
      weekId: weekId ?? undefined,
    });
    const rule = context.rule!;
    const dedupeKey = awardDedupeKey({ cadence: rule.cadence, weekId: context.week?.id ?? null });
    if (dedupeKey === null) throw new ZSAError("PRECONDITION_FAILED", USE_ADD_REMOVE);

    // Entries by eventId and awards by (rule, dedupeKey): never inArray over caller-sized lists
    const [entries, existingAwards] = await db.batch([
      db
        .select({
          id: openEntryTable.id,
          eventId: openEntryTable.eventId,
          teamId: openEntryTable.teamId,
          participantName: openParticipantTable.name,
        })
        .from(openEntryTable)
        .innerJoin(openParticipantTable, eq(openEntryTable.participantId, openParticipantTable.id))
        .where(eq(openEntryTable.eventId, eventId)),
      db
        .select()
        .from(openAwardTable)
        .where(and(eq(openAwardTable.ruleId, ruleId), eq(openAwardTable.dedupeKey, dedupeKey))),
    ]);

    const entryById = new Map(entries.map((entry) => [entry.id, entry]));
    for (const entryId of entryIds) {
      if (!entryById.has(entryId)) throw new ZSAError("NOT_FOUND", "An athlete in the list isn't in this event");
    }

    const scopeEntryIds = new Set(
      entries
        .filter((entry) => context.isAdmin || (entry.teamId !== null && context.manageableTeamIds.has(entry.teamId)))
        .map((entry) => entry.id),
    );
    const { toAdd, toRemove } = diffAwards({ desiredEntryIds: entryIds, existingAwards, scopeEntryIds });
    if (toAdd.length === 0 && toRemove.length === 0) return { added: 0, removed: 0 };

    // Every changed entry passes the full per-entry check (team, flags, lock, rule awardability)
    for (const entryId of [...toAdd, ...toRemove.map((award) => award.entryId)]) {
      assertEntryInContext({ context, entry: entryById.get(entryId)! });
    }

    const describe = ({ verb, entryId, points }: { verb: (typeof AWARD_VERB)[keyof typeof AWARD_VERB]; entryId: string; points: number }) =>
      describeAward({
        verb,
        ruleName: rule.name,
        weekLabel: context.week?.label,
        athlete: entryById.get(entryId)?.participantName ?? "athlete",
        points,
      });
    const newAwards = toAdd.map((entryId) => ({
      id: newOpenId.award(),
      entryId,
      ruleId,
      weekId: context.week?.id ?? null,
      points: rule.points,
      dedupeKey,
      note: null,
      awardedByUserId: session.userId,
    }));
    const createAudits: OpenAuditInput[] = newAwards.map((award) => ({
      eventId,
      actorUserId: session.userId,
      verb: OPEN_AUDIT_VERB.CREATE,
      entityType: OPEN_AUDIT_ENTITY.AWARD,
      entityId: award.id,
      after: award,
      summary: describe({ verb: AWARD_VERB.AWARDED, entryId: award.entryId, points: award.points }),
    }));

    await runOpenBatch({
      db,
      statements: [
        ...chunkedInsert({ db, table: openAwardTable, rows: newAwards }),
        ...auditStatements({ db, entries: createAudits }),
        ...toRemove.flatMap((award) =>
          auditedDeleteStatements({
            db,
            table: openAwardTable,
            entityType: OPEN_AUDIT_ENTITY.AWARD,
            eventId,
            actorUserId: session.userId,
            row: award,
            summary: describe({ verb: AWARD_VERB.REMOVED, entryId: award.entryId, points: award.points }),
          }),
        ),
      ],
      messages: { unique: CONCURRENT_EDIT },
    });

    revalidateOpenEvent({ eventId });
    return { added: toAdd.length, removed: toRemove.length };
  });

/** Adds one more award of an `unlimited` rule (weekId optional, for reporting). */
export const addUnlimitedAwardAction = createServerAction()
  .input(addUnlimitedAwardSchema)
  .handler(async ({ input }) => {
    const session = await requireOpenSession();
    const db = getDB();
    const { eventId, entryId, ruleId, weekId, note } = input;

    const context = await assertCanManageEntry({
      session,
      eventId,
      entryId,
      kind: MANAGE_KIND.POINTS,
      ruleId,
      weekId: weekId ?? undefined,
    });
    if (context.rule!.cadence !== OPEN_RULE_CADENCE.UNLIMITED) {
      throw new ZSAError("PRECONDITION_FAILED", `"${context.rule!.name}" isn't a repeatable rule; toggle it instead`);
    }

    const result = await insertAward({ db, session, context, dedupeKey: null, note });
    revalidateOpenEvent({ eventId });
    return result;
  });

/** Removes one award by id (any cadence), with the same permission checks as awarding it. */
export const removeAwardAction = createServerAction()
  .input(removeAwardSchema)
  .handler(async ({ input }) => {
    const session = await requireOpenSession();
    const db = getDB();
    const { eventId, awardId } = input;

    const award = await db.query.openAwardTable.findFirst({ where: eq(openAwardTable.id, awardId) });
    if (!award) return { changed: false, awardId };

    const context = await assertCanManageEntry({
      session,
      eventId,
      entryId: award.entryId,
      kind: MANAGE_KIND.POINTS,
      ruleId: award.ruleId,
      weekId: award.weekId ?? undefined,
    });

    const result = await deleteAward({ db, session, context, award });
    if (result.changed) revalidateOpenEvent({ eventId });
    return result;
  });
