import "server-only";
import { getDB } from "@/db";
import { openEntryTable, openParticipantTable, openScalingTable, openScoreTable, openTeamTable, userTable } from "@/db/schema";
import { and, eq, type SQL } from "drizzle-orm";

/** Scores for one workout, shaped as RankableScore (+ display fields) for `rankScores`. */
export async function getWorkoutScores({ workoutId }: { workoutId: string }) {
  const db = getDB();
  return db
    .select({
      id: openScoreTable.id,
      entryId: openScoreTable.entryId,
      value: openScoreTable.value,
      capped: openScoreTable.capped,
      tiebreakMs: openScoreTable.tiebreakMs,
      note: openScoreTable.note,
      scalingId: openScoreTable.scalingId,
      scalingRank: openScalingTable.rank,
      scalingName: openScalingTable.name,
      scalingSlug: openScalingTable.slug,
      participantName: openParticipantTable.name,
      teamId: openTeamTable.id,
      teamName: openTeamTable.name,
      teamSlug: openTeamTable.slug,
      teamColor: openTeamTable.color,
    })
    .from(openScoreTable)
    .innerJoin(openScalingTable, eq(openScoreTable.scalingId, openScalingTable.id))
    .innerJoin(openEntryTable, eq(openScoreTable.entryId, openEntryTable.id))
    .innerJoin(openParticipantTable, eq(openEntryTable.participantId, openParticipantTable.id))
    .leftJoin(openTeamTable, eq(openEntryTable.teamId, openTeamTable.id))
    .where(eq(openScoreTable.workoutId, workoutId));
}

/** One workout's scores for the score grid (optionally one team's entries), with who entered each. */
export async function getGridScores({
  eventId,
  workoutId,
  teamId,
}: {
  eventId: string;
  workoutId: string;
  teamId?: string;
}) {
  const db = getDB();
  const conditions: SQL[] = [eq(openScoreTable.workoutId, workoutId), eq(openEntryTable.eventId, eventId)];
  if (teamId) conditions.push(eq(openEntryTable.teamId, teamId));

  return db
    .select({
      id: openScoreTable.id,
      entryId: openScoreTable.entryId,
      scalingId: openScoreTable.scalingId,
      value: openScoreTable.value,
      capped: openScoreTable.capped,
      tiebreakMs: openScoreTable.tiebreakMs,
      updatedAt: openScoreTable.updatedAt,
      enteredByFirstName: userTable.firstName,
      enteredByLastName: userTable.lastName,
      enteredByEmail: userTable.email,
      enteredByRole: userTable.role,
    })
    .from(openScoreTable)
    .innerJoin(openEntryTable, eq(openScoreTable.entryId, openEntryTable.id))
    .leftJoin(userTable, eq(openScoreTable.enteredByUserId, userTable.id))
    .where(and(...conditions));
}
