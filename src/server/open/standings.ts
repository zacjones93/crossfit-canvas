import "server-only";
import { unstable_cache } from "next/cache";
import { getDB } from "@/db";
import {
  openAwardTable,
  openEntryTable,
  openParticipantTable,
  openScalingTable,
  openScoreTable,
  openTeamTable,
  openWorkoutTable,
} from "@/db/schema";
import { openEventTag } from "@/lib/open/cache-tags";
import { computePlacements } from "@/lib/open/placement";
import { computeStandings } from "@/lib/open/standings";
import { eq } from "drizzle-orm";

async function loadStandings({ eventId }: { eventId: string }) {
  const db = getDB();
  const [teams, entries, awards, workouts, scalings, scores] = await db.batch([
    db
      .select({
        id: openTeamTable.id,
        name: openTeamTable.name,
        slug: openTeamTable.slug,
        color: openTeamTable.color,
        sortOrder: openTeamTable.sortOrder,
      })
      .from(openTeamTable)
      .where(eq(openTeamTable.eventId, eventId)),
    db
      .select({
        id: openEntryTable.id,
        teamId: openEntryTable.teamId,
        participantName: openParticipantTable.name,
        gender: openParticipantTable.gender,
      })
      .from(openEntryTable)
      .innerJoin(openParticipantTable, eq(openEntryTable.participantId, openParticipantTable.id))
      .where(eq(openEntryTable.eventId, eventId)),
    db
      .select({
        entryId: openAwardTable.entryId,
        ruleId: openAwardTable.ruleId,
        weekId: openAwardTable.weekId,
        points: openAwardTable.points,
      })
      .from(openAwardTable)
      .innerJoin(openEntryTable, eq(openAwardTable.entryId, openEntryTable.id))
      .where(eq(openEntryTable.eventId, eventId)),
    db
      .select({
        id: openWorkoutTable.id,
        weekId: openWorkoutTable.weekId,
        scoreType: openWorkoutTable.scoreType,
        timeCapSeconds: openWorkoutTable.timeCapSeconds,
        repsPerRound: openWorkoutTable.repsPerRound,
      })
      .from(openWorkoutTable)
      .where(eq(openWorkoutTable.eventId, eventId)),
    db
      .select({
        id: openScalingTable.id,
        rank: openScalingTable.rank,
        placementFirst: openScalingTable.placementFirst,
        placementStep: openScalingTable.placementStep,
        placementMin: openScalingTable.placementMin,
        placementPerTeam: openScalingTable.placementPerTeam,
      })
      .from(openScalingTable)
      .where(eq(openScalingTable.eventId, eventId)),
    db
      .select({
        entryId: openScoreTable.entryId,
        workoutId: openScoreTable.workoutId,
        scalingId: openScoreTable.scalingId,
        value: openScoreTable.value,
        capped: openScoreTable.capped,
        tiebreakMs: openScoreTable.tiebreakMs,
      })
      .from(openScoreTable)
      .innerJoin(openEntryTable, eq(openScoreTable.entryId, openEntryTable.id))
      .where(eq(openEntryTable.eventId, eventId)),
  ]);

  const placements = computePlacements({ workouts, scalings, entries, scores });
  return { ...computeStandings({ teams, entries, awards, placements }), placements };
}

/**
 * Derived standings for an event (award ledger + placement points from scores), always including individuals
 * and every placement. Public pages drop individuals when the event
 * hides them (`loadEventBoard`, from the uncached event row). Cached per event (OpenNext KV incremental cache + D1 tag cache);
 * every Open mutation must `revalidateTag(openEventTag({ eventId }))`.
 */
export async function getStandings({ eventId }: { eventId: string }) {
  return unstable_cache(() => loadStandings({ eventId }), ["open-standings", eventId], {
    tags: [openEventTag({ eventId })],
  })();
}
