// Plain module: plan putting coaches on their team's roster (coaches compete too).
// One planner for the manual "Add coach to roster" action, auto-roster on coach assignment, and the
// backfill when an event turns `autoRosterCoaches` on.
import { normalizeName } from "./roster";

export interface CoachRosterState {
  teams: readonly { id: string; name: string; sortOrder: number }[];
  /** Coach names by id (at least every requested coach). */
  coaches: readonly { id: string; name: string }[];
  /** Participants linked to a coach (`open_participant.coachId`). */
  linkedParticipants: readonly { id: string; name: string; coachId: string }[];
  /** All entries in the event. */
  entries: readonly { id: string; participantId: string; teamId: string | null; participantName: string; participantCoachId: string | null }[];
}

export interface CoachRosterRequest {
  coachId: string;
  teamId: string;
}

export type CoachRosterStep =
  | {
      kind: "create";
      coachId: string;
      coachName: string;
      teamId: string;
      /** Reuse this linked participant, or null to create one named after the coach (linked via coachId). */
      participantId: string | null;
    }
  | { kind: "move"; coachId: string; coachName: string; entryId: string; fromTeamId: string | null; teamId: string };

export interface CoachRosterPlan {
  steps: CoachRosterStep[];
  /** Why a requested coach was left alone (for a toast); empty when every request was applied or already true. */
  notes: string[];
}

/**
 * For each request (first per coach wins): already on that team → nothing; entered on another team → moved
 * only when `move` (manual action), otherwise left where it is with a note; entered without a team → put on
 * the team; not entered → an entry on the team, reusing the coach's linked participant or creating one. An
 * unlinked athlete in the event with the coach's name is probably the same person, so nothing is created and
 * a note asks the admin to link them instead.
 */
export function planCoachRoster({
  requests,
  state,
  move,
}: {
  requests: readonly CoachRosterRequest[];
  state: CoachRosterState;
  move: boolean;
}): CoachRosterPlan {
  const teamName = new Map(state.teams.map((team) => [team.id, team.name]));
  const coachName = new Map(state.coaches.map((coach) => [coach.id, coach.name]));
  const participantByCoach = new Map(state.linkedParticipants.map((participant) => [participant.coachId, participant]));
  const entryByParticipant = new Map(state.entries.map((entry) => [entry.participantId, entry]));
  const unlinkedNames = new Map(
    state.entries
      .filter((entry) => !entry.participantCoachId)
      .map((entry) => [normalizeName(entry.participantName), entry.participantName]),
  );

  const steps: CoachRosterStep[] = [];
  const notes: string[] = [];
  const seen = new Set<string>();
  for (const { coachId, teamId } of requests) {
    if (seen.has(coachId)) continue;
    seen.add(coachId);
    const name = coachName.get(coachId) ?? "Coach";
    const participant = participantByCoach.get(coachId);
    const entry = participant && entryByParticipant.get(participant.id);

    if (entry) {
      if (entry.teamId === teamId) continue;
      if (move || entry.teamId === null) {
        steps.push({ kind: "move", coachId, coachName: name, entryId: entry.id, fromTeamId: entry.teamId, teamId });
      } else {
        notes.push(`${name} is already on ${teamName.get(entry.teamId) ?? "another team"}'s roster`);
      }
      continue;
    }

    const sameName = participant ? undefined : unlinkedNames.get(normalizeName(name));
    if (sameName) {
      notes.push(`${sameName} is already in this event but not linked to coach ${name}; link them on the Participants page`);
      continue;
    }
    steps.push({ kind: "create", coachId, coachName: name, teamId, participantId: participant?.id ?? null });
  }
  return { steps, notes };
}

/**
 * Backfill requests, one per assigned coach: the assigned team they're already entered on (so the plan is a
 * silent no-op), else their first assigned team (by team sortOrder, then name). Only coaches entered on a team
 * they don't coach end up with a note.
 */
export function backfillCoachRequests({
  assignments,
  state,
}: {
  assignments: readonly { coachId: string; teamId: string }[];
  state: CoachRosterState;
}): CoachRosterRequest[] {
  const teamOrder = new Map(
    [...state.teams].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name)).map((team, index) => [team.id, index]),
  );
  const participantIdByCoach = new Map(state.linkedParticipants.map((participant) => [participant.coachId, participant.id]));
  const teamIdByParticipant = new Map(state.entries.map((entry) => [entry.participantId, entry.teamId]));
  const teamIdsByCoach = new Map<string, string[]>();
  for (const { coachId, teamId } of assignments) {
    if (teamOrder.has(teamId)) teamIdsByCoach.set(coachId, [...(teamIdsByCoach.get(coachId) ?? []), teamId]);
  }

  return [...teamIdsByCoach].map(([coachId, teamIds]) => {
    const participantId = participantIdByCoach.get(coachId);
    const enteredTeamId = participantId ? teamIdByParticipant.get(participantId) : undefined;
    if (enteredTeamId && teamIds.includes(enteredTeamId)) return { coachId, teamId: enteredTeamId };
    const [first] = [...teamIds].sort((a, b) => teamOrder.get(a)! - teamOrder.get(b)!);
    return { coachId, teamId: first! };
  });
}
