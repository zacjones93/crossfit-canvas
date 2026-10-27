"use server";

import { createServerAction, ZSAError } from "zsa";
import { and, eq } from "drizzle-orm";
import { getDB } from "@/db";
import { coachTable, newOpenId, openTeamCoachTable, openTeamTable } from "@/db/schema";
import { OPEN_AUDIT_ENTITY, OPEN_AUDIT_VERB } from "@/lib/open/constants";
import {
  createOpenTeamSchema,
  openTeamCoachSchema,
  openTeamIdSchema,
  updateOpenTeamSchema,
} from "@/schemas/open.schema";
import { planCoachRoster } from "@/lib/open/coach-roster";
import { auditStatement } from "@/server/open/audit-write";
import { coachRosterStatements, loadCoachRosterState } from "@/server/open/coach-roster";
import { deleteOpenMediaKeys } from "@/server/open/media";
import {
  affectedRows,
  auditedDelete,
  auditedDeleteStatements,
  auditedUpdate,
  loadEvent,
  orNotFound,
  requireOpenAdmin,
  revalidateOpenEvent,
  runOpenBatch,
  type OpenDB,
} from "@/server/open/write";
import { toSlug } from "@/utils/slug";

const SLUG_TAKEN = "A team with that slug already exists in this event";

function loadTeam({ db, teamId }: { db: OpenDB; teamId: string }) {
  return orNotFound({ row: db.query.openTeamTable.findFirst({ where: eq(openTeamTable.id, teamId) }), label: "Team" });
}

export const createOpenTeamAction = createServerAction()
  .input(createOpenTeamSchema)
  .handler(async ({ input }) => {
    const session = await requireOpenAdmin();
    const db = getDB();
    const { eventId } = input;

    await loadEvent({ db, eventId });
    const slug = input.slug ?? toSlug(input.name);
    if (!slug) throw new ZSAError("INPUT_PARSE_ERROR", "Name must contain letters or numbers");

    const team = {
      id: newOpenId.team(),
      eventId,
      name: input.name,
      slug,
      color: input.color ?? null,
      sortOrder: input.sortOrder ?? 0,
    };

    await runOpenBatch({
      db,
      statements: [
        db.insert(openTeamTable).values(team),
        auditStatement({
          db,
          eventId,
          actorUserId: session.userId,
          verb: OPEN_AUDIT_VERB.CREATE,
          entityType: OPEN_AUDIT_ENTITY.TEAM,
          entityId: team.id,
          after: team,
          summary: `Created team "${team.name}"`,
        }),
      ],
      messages: { unique: SLUG_TAKEN },
    });

    revalidateOpenEvent({ eventId });
    return team;
  });

export const updateOpenTeamAction = createServerAction()
  .input(updateOpenTeamSchema)
  .handler(async ({ input }) => {
    const session = await requireOpenAdmin();
    const db = getDB();
    const { teamId, ...updates } = input;

    const team = await loadTeam({ db, teamId });
    const { row, changed } = await auditedUpdate({
      db,
      table: openTeamTable,
      entityType: OPEN_AUDIT_ENTITY.TEAM,
      eventId: team.eventId,
      actorUserId: session.userId,
      row: team,
      updates,
      describe: ({ after, changedKeys }) => `Updated team "${after.name}" (${changedKeys.join(", ")})`,
      messages: { unique: SLUG_TAKEN },
    });

    if (changed) revalidateOpenEvent({ eventId: team.eventId });
    return row;
  });

/** Fails while athletes are on the team (reassign them first). Coach assignments go with it. */
export const deleteOpenTeamAction = createServerAction()
  .input(openTeamIdSchema)
  .handler(async ({ input }) => {
    const session = await requireOpenAdmin();
    const db = getDB();
    const team = await loadTeam({ db, teamId: input.teamId });
    const teamCoaches = await db.query.openTeamCoachTable.findMany({
      where: eq(openTeamCoachTable.teamId, team.id),
      with: { coach: { columns: { name: true } } },
    });

    // Guarded deletes with conditional audits: a concurrent double-delete audits once
    const actor = { db, eventId: team.eventId, actorUserId: session.userId };
    const results = await runOpenBatch({
      db,
      statements: [
        ...teamCoaches.flatMap(({ coach, ...teamCoach }) =>
          auditedDeleteStatements({
            ...actor,
            table: openTeamCoachTable,
            entityType: OPEN_AUDIT_ENTITY.TEAM_COACH,
            row: teamCoach,
            summary: `Unassigned ${coach.name} from "${team.name}" (team deleted)`,
          }),
        ),
        ...auditedDeleteStatements({
          ...actor,
          table: openTeamTable,
          entityType: OPEN_AUDIT_ENTITY.TEAM,
          row: team,
          summary: `Deleted team "${team.name}"`,
        }),
      ],
      messages: { foreignKey: `"${team.name}" still has athletes; move them to another team first` },
    });
    if (affectedRows(results.at(-1)) === 0) return { success: true };

    await deleteOpenMediaKeys([team.photoKey]);
    revalidateOpenEvent({ eventId: team.eventId });
    return { success: true };
  });

/**
 * Idempotent: assigning an already-assigned coach is a no-op. With the event's `autoRosterCoaches` on, the
 * same batch also puts the coach on this team's roster (`planCoachRoster`, never moving an existing entry);
 * `notes` say why that didn't happen.
 */
export const assignOpenTeamCoachAction = createServerAction()
  .input(openTeamCoachSchema)
  .handler(async ({ input }) => {
    const session = await requireOpenAdmin();
    const db = getDB();
    const { teamId, coachId } = input;

    const [teams, coaches, existing] = await db.batch([
      db.select().from(openTeamTable).where(eq(openTeamTable.id, teamId)),
      db.select({ id: coachTable.id, name: coachTable.name }).from(coachTable).where(eq(coachTable.id, coachId)),
      db
        .select({ id: openTeamCoachTable.id })
        .from(openTeamCoachTable)
        .where(and(eq(openTeamCoachTable.teamId, teamId), eq(openTeamCoachTable.coachId, coachId))),
    ]);
    const team = teams[0];
    const coach = coaches[0];
    if (!team) throw new ZSAError("NOT_FOUND", "Team not found");
    if (!coach) throw new ZSAError("NOT_FOUND", "Coach not found");
    if (existing[0]) return { id: existing[0].id, teamId, coachId, notes: [] };

    const { eventId } = team;
    const event = await loadEvent({ db, eventId });
    const roster = event.autoRosterCoaches ? await loadCoachRosterState({ db, eventId }) : null;
    const plan = roster
      ? planCoachRoster({
          requests: [{ coachId, teamId }],
          state: { ...roster.state, coaches: [...roster.state.coaches, coach] },
          move: false,
        })
      : { steps: [], notes: [] };

    const teamCoach = { id: newOpenId.teamCoach(), teamId, coachId };
    await runOpenBatch({
      db,
      statements: [
        db.insert(openTeamCoachTable).values(teamCoach),
        auditStatement({
          db,
          eventId,
          actorUserId: session.userId,
          verb: OPEN_AUDIT_VERB.CREATE,
          entityType: OPEN_AUDIT_ENTITY.TEAM_COACH,
          entityId: teamCoach.id,
          after: teamCoach,
          summary: `Assigned ${coach.name} to "${team.name}"`,
        }),
        ...(roster
          ? coachRosterStatements({ db, eventId, actorUserId: session.userId, steps: plan.steps, entries: roster.entries, teams: roster.state.teams })
          : []),
      ],
      // Lost a race with an identical assignment (or a roster change): the caller refreshes
      messages: { unique: "That coach was just assigned to this team, or their roster entry just changed; refresh and try again" },
    });

    revalidateOpenEvent({ eventId });
    return { ...teamCoach, notes: plan.notes };
  });

/** Idempotent: unassigning a coach who isn't assigned is a no-op. Their roster entry (and points) stay. */
export const unassignOpenTeamCoachAction = createServerAction()
  .input(openTeamCoachSchema)
  .handler(async ({ input }) => {
    const session = await requireOpenAdmin();
    const db = getDB();
    const { teamId, coachId } = input;

    const teamCoach = await db.query.openTeamCoachTable.findFirst({
      where: and(eq(openTeamCoachTable.teamId, teamId), eq(openTeamCoachTable.coachId, coachId)),
      with: { team: true, coach: { columns: { name: true } } },
    });
    if (!teamCoach) return { success: true };
    const { team, coach, ...row } = teamCoach;

    const { deleted } = await auditedDelete({
      db,
      table: openTeamCoachTable,
      entityType: OPEN_AUDIT_ENTITY.TEAM_COACH,
      eventId: team.eventId,
      actorUserId: session.userId,
      row,
      summary: `Unassigned ${coach.name} from "${team.name}"`,
    });
    if (!deleted) return { success: true };

    revalidateOpenEvent({ eventId: team.eventId });
    return { success: true };
  });
