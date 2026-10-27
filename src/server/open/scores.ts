import "server-only";
import { getDB } from "@/db";
import { openEntryTable, openParticipantTable, openScalingTable, openScoreTable, openTeamTable } from "@/db/schema";
import { eq } from "drizzle-orm";

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
