"use server";

import { createServerAction, ZSAError } from "zsa";
import { and, count, eq, inArray, notExists } from "drizzle-orm";
import { getDB } from "@/db";
import {
  coachTable,
  newOpenId,
  openAwardTable,
  openEntryTable,
  openEventTable,
  openParticipantTable,
  openScoreTable,
  openTeamTable,
} from "@/db/schema";
import { AWARD_VERB, describeAward, diffRow } from "@/lib/open/audit";
import { chunk, MAX_BOUND_PARAMS } from "@/lib/open/chunk";
import { OPEN_AUDIT_ENTITY, OPEN_AUDIT_VERB } from "@/lib/open/constants";
import { planCoachRoster } from "@/lib/open/coach-roster";
import { parseRosterText, planRosterImport } from "@/lib/open/roster";
import {
  addCoachToRosterSchema,
  bulkAssignTeamsSchema,
  importRosterSchema,
  removeOpenEntrySchema,
  updateOpenEntrySchema,
} from "@/schemas/open.schema";
import { auditStatements, type OpenAuditInput } from "@/server/open/audit-write";
import { COACH_ROSTER_RACE, coachRosterStatements, loadCoachRosterState } from "@/server/open/coach-roster";
import {
  affectedRows,
  auditedDeleteStatements,
  chunkedInsert,
  loadEvent,
  orNotFound,
  requireOpenAdmin,
  revalidateOpenEvent,
  runOpenBatch,
  type OpenDB,
  type OpenStatement,
} from "@/server/open/write";

const MAX_IMPORT_ROWS = 1000;
const MAX_REPORTED_ERRORS = 5;

/** Team must exist in the event; null/undefined means "no team". */
async function loadTeamInEvent({ db, teamId, eventId }: { db: OpenDB; teamId: string | null | undefined; eventId: string }) {
  if (!teamId) return null;
  const team = await db.query.openTeamTable.findFirst({
    where: and(eq(openTeamTable.id, teamId), eq(openTeamTable.eventId, eventId)),
    columns: { id: true, name: true },
  });
  if (!team) throw new ZSAError("NOT_FOUND", "Team not found in this event");
  return team;
}

/** A coach that exists and isn't linked to another participant yet (friendly errors otherwise). */
async function loadLinkableCoach({ db, coachId }: { db: OpenDB; coachId: string }) {
  const [coaches, linked] = await db.batch([
    db.select({ id: coachTable.id, name: coachTable.name }).from(coachTable).where(eq(coachTable.id, coachId)),
    db.select({ name: openParticipantTable.name }).from(openParticipantTable).where(eq(openParticipantTable.coachId, coachId)),
  ]);
  if (!coaches[0]) throw new ZSAError("NOT_FOUND", "Coach not found");
  if (linked[0]) throw new ZSAError("CONFLICT", `That coach is already linked to ${linked[0].name}; unlink them first`);
  return coaches[0];
}

/**
 * One name per line (`Name` or `Name, email`). Names already in the event are skipped; earlier
 * events' participants are reused (by email, else unique name) so history links across years.
 */
export const importRosterAction = createServerAction()
  .input(importRosterSchema)
  .handler(async ({ input }) => {
    const session = await requireOpenAdmin();
    const db = getDB();
    const { eventId } = input;

    await loadEvent({ db, eventId });
    const team = await loadTeamInEvent({ db, teamId: input.teamId, eventId });

    const { rows, errors, duplicates } = parseRosterText(input.text);
    if (errors.length > 0) {
      const shown = errors.slice(0, MAX_REPORTED_ERRORS).map((error) => `Line ${error.line}: ${error.message}`);
      const more = errors.length > MAX_REPORTED_ERRORS ? ` (+${errors.length - MAX_REPORTED_ERRORS} more)` : "";
      throw new ZSAError("INPUT_PARSE_ERROR", `${shown.join("; ")}${more}`);
    }
    if (rows.length === 0) throw new ZSAError("INPUT_PARSE_ERROR", "Paste at least one name");
    if (rows.length > MAX_IMPORT_ROWS) throw new ZSAError("INPUT_PARSE_ERROR", `Import at most ${MAX_IMPORT_ROWS} athletes at a time`);

    const [participants, eventCounts, entered] = await db.batch([
      db
        .select({ id: openParticipantTable.id, name: openParticipantTable.name, email: openParticipantTable.email })
        .from(openParticipantTable),
      db
        .select({ participantId: openEntryTable.participantId, events: count() })
        .from(openEntryTable)
        .groupBy(openEntryTable.participantId),
      db.select({ participantId: openEntryTable.participantId }).from(openEntryTable).where(eq(openEntryTable.eventId, eventId)),
    ]);
    const plan = planRosterImport({
      rows,
      participants,
      enteredParticipantIds: new Set(entered.map((row) => row.participantId)),
      eventCountByParticipant: new Map(eventCounts.map((row) => [row.participantId, row.events])),
    });

    const planned = plan.create.map((item) => ({
      ...item,
      isNewParticipant: !item.participantId,
      participantId: item.participantId ?? newOpenId.participant(),
      entryId: newOpenId.entry(),
    }));
    const newParticipants = planned
      .filter((item) => item.isNewParticipant)
      .map((item) => ({ id: item.participantId, name: item.name, email: item.email }));
    const entries = planned.map((item) => ({
      id: item.entryId,
      eventId,
      participantId: item.participantId,
      teamId: team?.id ?? null,
      division: null,
    }));
    const nameByParticipantId = new Map(planned.map((item) => [item.participantId, item.name]));

    const actor = { eventId, actorUserId: session.userId, verb: OPEN_AUDIT_VERB.CREATE };
    const audits: OpenAuditInput[] = [
      ...newParticipants.map((participant) => ({
        ...actor,
        entityType: OPEN_AUDIT_ENTITY.PARTICIPANT,
        entityId: participant.id,
        after: participant,
        summary: `Created participant ${participant.name}`,
      })),
      ...entries.map((entry) => ({
        ...actor,
        entityType: OPEN_AUDIT_ENTITY.ENTRY,
        entityId: entry.id,
        after: entry,
        summary: `Added ${nameByParticipantId.get(entry.participantId)} to the event${team ? ` on "${team.name}"` : ""}`,
      })),
    ];

    await runOpenBatch({
      db,
      statements: [
        ...chunkedInsert({ db, table: openParticipantTable, rows: newParticipants }),
        ...chunkedInsert({ db, table: openEntryTable, rows: entries }),
        ...auditStatements({ db, entries: audits }),
      ],
      messages: { unique: "Someone else just imported some of these athletes; refresh and try again" },
    });

    if (entries.length > 0) revalidateOpenEvent({ eventId });
    return {
      created: entries.length,
      reused: plan.reused,
      skipped: [...duplicates, ...plan.skipped],
    };
  });

/**
 * Name/email/coach link/gender edit the participant (shared across events); division/team edit the entry. One batch,
 * one audit per changed entity. A coach links to at most one participant.
 */
export const updateOpenEntryAction = createServerAction()
  .input(updateOpenEntrySchema)
  .handler(async ({ input }) => {
    const session = await requireOpenAdmin();
    const db = getDB();
    const { entryId, name, email, coachId, gender, division, teamId } = input;

    const found = await orNotFound({
      row: db.query.openEntryTable.findFirst({ where: eq(openEntryTable.id, entryId), with: { participant: true } }),
      label: "Athlete",
    });
    const { participant, ...entry } = found;
    if (teamId) await loadTeamInEvent({ db, teamId, eventId: entry.eventId });
    const coach = coachId && coachId !== participant.coachId ? await loadLinkableCoach({ db, coachId }) : null;

    const participantDiff = diffRow({ before: participant, updates: { name, email, coachId, gender } });
    const entryDiff = diffRow({ before: entry, updates: { division, teamId } });

    const actor = { eventId: entry.eventId, actorUserId: session.userId, verb: OPEN_AUDIT_VERB.UPDATE };
    const statements: OpenStatement[] = [];
    const audits: OpenAuditInput[] = [];
    if (participantDiff.changedKeys.length > 0) {
      statements.push(db.update(openParticipantTable).set(participantDiff.changes).where(eq(openParticipantTable.id, participant.id)));
      audits.push({
        ...actor,
        entityType: OPEN_AUDIT_ENTITY.PARTICIPANT,
        entityId: participant.id,
        before: participant,
        after: participantDiff.after,
        summary: `Updated ${participantDiff.after.name} (${participantDiff.changedKeys.join(", ")})${
          coach ? `; linked to coach ${coach.name}` : participantDiff.changedKeys.includes("coachId") ? "; unlinked from coach" : ""
        }`,
      });
    }
    if (entryDiff.changedKeys.length > 0) {
      statements.push(db.update(openEntryTable).set(entryDiff.changes).where(eq(openEntryTable.id, entry.id)));
      audits.push({
        ...actor,
        entityType: OPEN_AUDIT_ENTITY.ENTRY,
        entityId: entry.id,
        before: entry,
        after: entryDiff.after,
        summary: `Updated ${participantDiff.after.name}'s entry (${entryDiff.changedKeys.join(", ")})`,
      });
    }
    if (statements.length === 0) return found;

    await runOpenBatch({
      db,
      statements: [...statements, ...auditStatements({ db, entries: audits })],
      messages: { unique: "That coach is already linked to another athlete" },
    });

    // The participant (name, gender, …) is shared: every event they're entered in derives standings from it
    const eventIds = participantDiff.changedKeys.length > 0
      ? (await db
          .select({ eventId: openEntryTable.eventId })
          .from(openEntryTable)
          .where(eq(openEntryTable.participantId, participant.id))).map((row) => row.eventId)
      : [];
    for (const eventId of new Set([entry.eventId, ...eventIds])) revalidateOpenEvent({ eventId });
    return { ...entryDiff.after, participant: participantDiff.after };
  });

/** Moves many athletes at once (null = no team). Points follow the athlete's current team. */
export const bulkAssignTeamsAction = createServerAction()
  .input(bulkAssignTeamsSchema)
  .handler(async ({ input }) => {
    const session = await requireOpenAdmin();
    const db = getDB();
    const { eventId, assignments } = input;

    const [events, entries, teams] = await db.batch([
      db.select({ id: openEventTable.id }).from(openEventTable).where(eq(openEventTable.id, eventId)),
      db
        .select({
          id: openEntryTable.id,
          eventId: openEntryTable.eventId,
          participantId: openEntryTable.participantId,
          teamId: openEntryTable.teamId,
          division: openEntryTable.division,
          participantName: openParticipantTable.name,
        })
        .from(openEntryTable)
        .innerJoin(openParticipantTable, eq(openEntryTable.participantId, openParticipantTable.id))
        .where(eq(openEntryTable.eventId, eventId)),
      db.select({ id: openTeamTable.id, name: openTeamTable.name }).from(openTeamTable).where(eq(openTeamTable.eventId, eventId)),
    ]);
    if (events.length === 0) throw new ZSAError("NOT_FOUND", "Event not found");

    const entryById = new Map(entries.map((entry) => [entry.id, entry]));
    const teamById = new Map(teams.map((team) => [team.id, team]));
    const desiredTeamByEntry = new Map<string, string | null>();
    for (const { entryId, teamId } of assignments) {
      if (!entryById.has(entryId)) throw new ZSAError("NOT_FOUND", "An athlete in the list isn't in this event");
      if (teamId && !teamById.has(teamId)) throw new ZSAError("NOT_FOUND", "A team in the list isn't in this event");
      desiredTeamByEntry.set(entryId, teamId);
    }

    const moves = [...desiredTeamByEntry]
      .map(([entryId, teamId]) => ({ entry: entryById.get(entryId)!, teamId }))
      .filter(({ entry, teamId }) => entry.teamId !== teamId);
    if (moves.length === 0) return { moved: 0 };

    // One UPDATE per (target team, ≤ MAX_BOUND_PARAMS ids)
    const idsByTeam = new Map<string | null, string[]>();
    for (const { entry, teamId } of moves) idsByTeam.set(teamId, [...(idsByTeam.get(teamId) ?? []), entry.id]);
    const updates = [...idsByTeam].flatMap(([teamId, ids]) =>
      chunk({ items: ids, size: MAX_BOUND_PARAMS }).map((part) =>
        db.update(openEntryTable).set({ teamId }).where(and(eq(openEntryTable.eventId, eventId), inArray(openEntryTable.id, part))),
      ),
    );

    const audits = moves.map(({ entry: { participantName, ...entry }, teamId }) => ({
      eventId,
      actorUserId: session.userId,
      verb: OPEN_AUDIT_VERB.UPDATE,
      entityType: OPEN_AUDIT_ENTITY.ENTRY,
      entityId: entry.id,
      before: entry,
      after: { ...entry, teamId },
      summary: `Moved ${participantName} to ${teamId ? `"${teamById.get(teamId)!.name}"` : "no team"}`,
    }));

    await runOpenBatch({ db, statements: [...updates, ...auditStatements({ db, entries: audits })] });

    revalidateOpenEvent({ eventId });
    return { moved: moves.length };
  });

/**
 * Removes an athlete from the event (the participant record is kept: removing an entry isn't
 * deleting a person). Refuses when they have awards/scores unless `force`, which deletes and
 * audits exactly the loaded awards/scores; the entry delete is guarded so it doesn't happen if
 * new awards/scores appeared meanwhile (they would otherwise cascade away unaudited).
 */
export const removeOpenEntryAction = createServerAction()
  .input(removeOpenEntrySchema)
  .handler(async ({ input }) => {
    const session = await requireOpenAdmin();
    const db = getDB();
    const { entryId, force } = input;

    const found = await orNotFound({
      row: db.query.openEntryTable.findFirst({
        where: eq(openEntryTable.id, entryId),
        with: {
          participant: { columns: { name: true } },
          awards: { with: { rule: { columns: { name: true } }, week: { columns: { label: true } } } },
          scores: { with: { workout: { columns: { name: true } } } },
        },
      }),
      label: "Athlete",
    });
    const { participant, awards, scores, ...entry } = found;
    const name = participant.name;

    if (!force && (awards.length > 0 || scores.length > 0)) {
      throw new ZSAError(
        "PRECONDITION_FAILED",
        `${name} has ${awards.length} award(s) and ${scores.length} score(s); remove anyway to delete them too`,
      );
    }

    const actor = { db, eventId: entry.eventId, actorUserId: session.userId };
    const reason = "athlete removed";
    const results = await runOpenBatch({
      db,
      statements: [
        ...awards.flatMap(({ rule, week, ...award }) =>
          auditedDeleteStatements({
            ...actor,
            table: openAwardTable,
            entityType: OPEN_AUDIT_ENTITY.AWARD,
            row: award,
            summary: describeAward({ verb: AWARD_VERB.REMOVED, ruleName: rule.name, weekLabel: week?.label, athlete: name, points: award.points, reason }),
          }),
        ),
        ...scores.flatMap(({ workout, ...score }) =>
          auditedDeleteStatements({
            ...actor,
            table: openScoreTable,
            entityType: OPEN_AUDIT_ENTITY.SCORE,
            row: score,
            summary: `Deleted ${name}'s ${workout.name} score (${reason})`,
          }),
        ),
        ...auditedDeleteStatements({
          ...actor,
          table: openEntryTable,
          entityType: OPEN_AUDIT_ENTITY.ENTRY,
          row: entry,
          summary: `Removed ${name} from the event`,
          condition: and(
            notExists(db.select({ id: openAwardTable.id }).from(openAwardTable).where(eq(openAwardTable.entryId, entryId))),
            notExists(db.select({ id: openScoreTable.id }).from(openScoreTable).where(eq(openScoreTable.entryId, entryId))),
          ),
        }),
      ],
    });

    if (awards.length > 0 || scores.length > 0 || affectedRows(results.at(-1)) > 0) revalidateOpenEvent({ eventId: entry.eventId });
    if (affectedRows(results.at(-1)) === 0) {
      const stillExists = await db.query.openEntryTable.findFirst({ where: eq(openEntryTable.id, entryId), columns: { id: true } });
      if (stillExists) {
        throw new ZSAError("CONFLICT", `New awards or scores were just recorded for ${name}; review them and try again`);
      }
    }
    return { success: true, deletedAwards: awards.length, deletedScores: scores.length };
  });

/**
 * Puts one of a team's assigned coaches on that team's roster: reuses the participant linked to the coach
 * (or creates one named after the coach, linked via `coachId`), then creates their entry or moves it to the
 * team (points follow the entry's team). Idempotent when they're already on the team.
 */
export const addCoachToRosterAction = createServerAction()
  .input(addCoachToRosterSchema)
  .handler(async ({ input }) => {
    const session = await requireOpenAdmin();
    const db = getDB();
    const { eventId, teamId, coachId } = input;

    const { state, assignments, entries } = await loadCoachRosterState({ db, eventId });
    if (!state.teams.some((team) => team.id === teamId)) throw new ZSAError("NOT_FOUND", "Team not found in this event");
    if (!assignments.some((assignment) => assignment.teamId === teamId && assignment.coachId === coachId)) {
      throw new ZSAError("PRECONDITION_FAILED", "Assign the coach to this team first");
    }

    const plan = planCoachRoster({ requests: [{ coachId, teamId }], state, move: true });
    if (plan.notes.length > 0) throw new ZSAError("PRECONDITION_FAILED", plan.notes.join("; "));
    if (plan.steps.length === 0) return { changed: false };

    await runOpenBatch({
      db,
      statements: coachRosterStatements({ db, eventId, actorUserId: session.userId, steps: plan.steps, entries, teams: state.teams }),
      messages: { unique: COACH_ROSTER_RACE },
    });

    revalidateOpenEvent({ eventId });
    return { changed: true };
  });
