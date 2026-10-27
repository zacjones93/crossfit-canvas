import "server-only";
import { and, eq, inArray, isNotNull } from "drizzle-orm";
import { coachTable, newOpenId, openEntryTable, openParticipantTable, openTeamCoachTable, openTeamTable } from "@/db/schema";
import { chunk, MAX_BOUND_PARAMS } from "@/lib/open/chunk";
import type { CoachRosterState, CoachRosterStep } from "@/lib/open/coach-roster";
import { OPEN_AUDIT_ENTITY, OPEN_AUDIT_VERB } from "@/lib/open/constants";
import { auditStatements, type OpenAuditInput } from "./audit-write";
import { chunkedInsert, type OpenDB, type OpenStatement } from "./batch";

// The one place coach roster entries are written (manual "Add coach to roster", auto-roster on coach
// assignment, backfill when `autoRosterCoaches` is turned on). Planning is pure: `planCoachRoster`.

/** Everything `planCoachRoster` needs for an event, plus its coach assignments, in one round trip. */
export async function loadCoachRosterState({ db, eventId }: { db: OpenDB; eventId: string }) {
  const [teams, assignments, linkedParticipants, entries] = await db.batch([
    db
      .select({ id: openTeamTable.id, name: openTeamTable.name, sortOrder: openTeamTable.sortOrder })
      .from(openTeamTable)
      .where(eq(openTeamTable.eventId, eventId)),
    db
      .select({ teamId: openTeamCoachTable.teamId, coachId: coachTable.id, coachName: coachTable.name })
      .from(openTeamCoachTable)
      .innerJoin(coachTable, eq(openTeamCoachTable.coachId, coachTable.id))
      .innerJoin(openTeamTable, eq(openTeamCoachTable.teamId, openTeamTable.id))
      .where(eq(openTeamTable.eventId, eventId)),
    db
      .select({ id: openParticipantTable.id, name: openParticipantTable.name, coachId: openParticipantTable.coachId })
      .from(openParticipantTable)
      .where(isNotNull(openParticipantTable.coachId)),
    db
      .select({
        id: openEntryTable.id,
        participantId: openEntryTable.participantId,
        teamId: openEntryTable.teamId,
        division: openEntryTable.division,
        participantName: openParticipantTable.name,
        participantCoachId: openParticipantTable.coachId,
      })
      .from(openEntryTable)
      .innerJoin(openParticipantTable, eq(openEntryTable.participantId, openParticipantTable.id))
      .where(eq(openEntryTable.eventId, eventId)),
  ]);
  const state: CoachRosterState = {
    teams,
    coaches: assignments.map((assignment) => ({ id: assignment.coachId, name: assignment.coachName })),
    linkedParticipants: linkedParticipants.flatMap((participant) =>
      participant.coachId ? [{ ...participant, coachId: participant.coachId }] : [],
    ),
    entries,
  };
  return { state, assignments, entries };
}

/**
 * Statements (+ audits, for the same `db.batch`) applying planned steps: new linked participants, new entries,
 * and team moves. Inserts are chunked; moves are one UPDATE per (team, ≤ MAX_BOUND_PARAMS ids).
 */
export function coachRosterStatements({
  db,
  eventId,
  actorUserId,
  steps,
  entries,
  teams,
}: {
  db: OpenDB;
  eventId: string;
  actorUserId: string;
  steps: readonly CoachRosterStep[];
  entries: readonly { id: string; participantId: string; teamId: string | null; division: string | null }[];
  teams: CoachRosterState["teams"];
}): OpenStatement[] {
  const teamName = new Map(teams.map((team) => [team.id, team.name]));
  const actor = { eventId, actorUserId };
  const newParticipants: { id: string; name: string; email: null; coachId: string }[] = [];
  const newEntries: { id: string; eventId: string; participantId: string; teamId: string; division: null }[] = [];
  const movesByTeam = new Map<string, string[]>();
  const audits: OpenAuditInput[] = [];
  const entryById = new Map(entries.map((entry) => [entry.id, entry]));

  for (const step of steps) {
    const team = `"${teamName.get(step.teamId) ?? "team"}"`;
    if (step.kind === "move") {
      movesByTeam.set(step.teamId, [...(movesByTeam.get(step.teamId) ?? []), step.entryId]);
      const before = entryById.get(step.entryId);
      audits.push({
        ...actor,
        verb: OPEN_AUDIT_VERB.UPDATE,
        entityType: OPEN_AUDIT_ENTITY.ENTRY,
        entityId: step.entryId,
        before: before ? { ...before, eventId } : null,
        after: before ? { ...before, eventId, teamId: step.teamId } : { teamId: step.teamId },
        summary: `Moved coach ${step.coachName} to ${team}`,
      });
      continue;
    }
    let participantId = step.participantId;
    if (!participantId) {
      const participant = { id: newOpenId.participant(), name: step.coachName, email: null, coachId: step.coachId };
      participantId = participant.id;
      newParticipants.push(participant);
      audits.push({
        ...actor,
        verb: OPEN_AUDIT_VERB.CREATE,
        entityType: OPEN_AUDIT_ENTITY.PARTICIPANT,
        entityId: participant.id,
        after: participant,
        summary: `Created participant ${step.coachName} for coach ${step.coachName}`,
      });
    }
    const entry = { id: newOpenId.entry(), eventId, participantId, teamId: step.teamId, division: null };
    newEntries.push(entry);
    audits.push({
      ...actor,
      verb: OPEN_AUDIT_VERB.CREATE,
      entityType: OPEN_AUDIT_ENTITY.ENTRY,
      entityId: entry.id,
      after: entry,
      summary: `Added coach ${step.coachName} to the event on ${team}`,
    });
  }

  const moves = [...movesByTeam].flatMap(([teamId, ids]) =>
    chunk({ items: ids, size: MAX_BOUND_PARAMS }).map((part) =>
      db.update(openEntryTable).set({ teamId }).where(and(eq(openEntryTable.eventId, eventId), inArray(openEntryTable.id, part))),
    ),
  );
  return [
    ...chunkedInsert({ db, table: openParticipantTable, rows: newParticipants }),
    ...chunkedInsert({ db, table: openEntryTable, rows: newEntries }),
    ...moves,
    ...auditStatements({ db, entries: audits }),
  ];
}

/** Friendly message when a coach roster write loses a race (unique participant.coachId / entry per event). */
export const COACH_ROSTER_RACE = "A coach's roster entry was just changed by someone else; refresh and try again";
