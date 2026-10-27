import "server-only";
import { getDB } from "@/db";
import {
  coachTable,
  openAwardTable,
  openEntryTable,
  openEventTable,
  openParticipantTable,
  openPointRuleTable,
  openScalingTable,
  openScoreTable,
  openTeamCoachTable,
  openTeamTable,
  openWeekTable,
  openWorkoutTable,
} from "@/db/schema";
import { OPEN_EVENT_STATUS } from "@/lib/open/constants";
import { and, asc, desc, eq, exists, inArray, or, sql } from "drizzle-orm";

// Reads for the public Open pages. Each selects only display columns: never emails, user ids, notes, or
// who-entered-what. Uncached (the root layout is force-dynamic); standings come from the tagged
// `getStandings` cache.

/** Live and closed events, most recent first (drafts are never listed publicly). */
export async function getPublicEvents() {
  const db = getDB();
  return db
    .select({ name: openEventTable.name, slug: openEventTable.slug, year: openEventTable.year, status: openEventTable.status })
    .from(openEventTable)
    .where(inArray(openEventTable.status, [OPEN_EVENT_STATUS.LIVE, OPEN_EVENT_STATUS.CLOSED]))
    .orderBy(desc(openEventTable.year), desc(openEventTable.createdAt));
}

/**
 * Everything the public event pages share, in one round trip: team profile fields (merge with standings by
 * id), weeks, rules (active, plus retired ones that still carry awards), workouts, and scalings.
 */
export async function getPublicEventData({ eventId }: { eventId: string }) {
  const db = getDB();
  const [teamProfiles, weeks, rules, workouts, scalings] = await db.batch([
    db
      .select({ id: openTeamTable.id, photoKey: openTeamTable.photoKey, motto: openTeamTable.motto })
      .from(openTeamTable)
      .where(eq(openTeamTable.eventId, eventId)),
    db
      .select({ id: openWeekTable.id, number: openWeekTable.number, label: openWeekTable.label })
      .from(openWeekTable)
      .where(eq(openWeekTable.eventId, eventId))
      .orderBy(asc(openWeekTable.number)),
    db
      .select({
        id: openPointRuleTable.id,
        name: openPointRuleTable.name,
        description: openPointRuleTable.description,
        points: openPointRuleTable.points,
        cadence: openPointRuleTable.cadence,
        isActive: openPointRuleTable.isActive,
      })
      .from(openPointRuleTable)
      .where(
        and(
          eq(openPointRuleTable.eventId, eventId),
          or(
            eq(openPointRuleTable.isActive, true),
            exists(db.select({ one: sql`1` }).from(openAwardTable).where(eq(openAwardTable.ruleId, openPointRuleTable.id))),
          ),
        ),
      )
      .orderBy(asc(openPointRuleTable.sortOrder), asc(openPointRuleTable.name)),
    db
      .select({
        id: openWorkoutTable.id,
        weekId: openWorkoutTable.weekId,
        name: openWorkoutTable.name,
        slug: openWorkoutTable.slug,
        description: openWorkoutTable.description,
        scoreType: openWorkoutTable.scoreType,
        timeCapSeconds: openWorkoutTable.timeCapSeconds,
        repsPerRound: openWorkoutTable.repsPerRound,
        hasTiebreak: openWorkoutTable.hasTiebreak,
      })
      .from(openWorkoutTable)
      .where(eq(openWorkoutTable.eventId, eventId))
      .orderBy(asc(openWorkoutTable.sortOrder), asc(openWorkoutTable.name)),
    db
      .select({ name: openScalingTable.name, slug: openScalingTable.slug, rank: openScalingTable.rank })
      .from(openScalingTable)
      .where(eq(openScalingTable.eventId, eventId))
      .orderBy(asc(openScalingTable.rank)),
  ]);
  return { teamProfiles, weeks, rules, workouts, scalings };
}

export type PublicEventData = Awaited<ReturnType<typeof getPublicEventData>>;
export type PublicWorkout = PublicEventData["workouts"][number];

/** One team's public profile with its coaches (name, slug, credentials, bio only). */
export async function getPublicTeam({ eventId, slug }: { eventId: string; slug: string }) {
  const db = getDB();
  const [teams, coaches] = await db.batch([
    db
      .select({
        id: openTeamTable.id,
        name: openTeamTable.name,
        slug: openTeamTable.slug,
        color: openTeamTable.color,
        photoKey: openTeamTable.photoKey,
        motto: openTeamTable.motto,
        description: openTeamTable.description,
      })
      .from(openTeamTable)
      .where(and(eq(openTeamTable.eventId, eventId), eq(openTeamTable.slug, slug))),
    db
      .select({ name: coachTable.name, slug: coachTable.slug, credentials: coachTable.credentials, bio: coachTable.bio })
      .from(openTeamCoachTable)
      .innerJoin(coachTable, eq(openTeamCoachTable.coachId, coachTable.id))
      .innerJoin(openTeamTable, eq(openTeamCoachTable.teamId, openTeamTable.id))
      .where(and(eq(openTeamTable.eventId, eventId), eq(openTeamTable.slug, slug)))
      .orderBy(asc(coachTable.name)),
  ]);
  const team = teams[0];
  return team ? { ...team, coaches } : null;
}

/**
 * A team's roster (entry id + display name), and, when `withScores` (the event shows individuals), its
 * members' scores across all workouts.
 */
export async function getPublicTeamRoster({
  eventId,
  teamId,
  withScores,
}: {
  eventId: string;
  teamId: string;
  withScores: boolean;
}) {
  const db = getDB();
  const onTeam = and(eq(openEntryTable.eventId, eventId), eq(openEntryTable.teamId, teamId));
  const membersQuery = db
    .select({ entryId: openEntryTable.id, name: openParticipantTable.name })
    .from(openEntryTable)
    .innerJoin(openParticipantTable, eq(openEntryTable.participantId, openParticipantTable.id))
    .where(onTeam)
    .orderBy(asc(openParticipantTable.name));
  if (!withScores) return { members: await membersQuery, scores: [] };

  const [members, scores] = await db.batch([
    membersQuery,
    db
      .select({
        entryId: openScoreTable.entryId,
        workoutId: openScoreTable.workoutId,
        value: openScoreTable.value,
        capped: openScoreTable.capped,
        tiebreakMs: openScoreTable.tiebreakMs,
        scalingName: openScalingTable.name,
      })
      .from(openScoreTable)
      .innerJoin(openEntryTable, eq(openScoreTable.entryId, openEntryTable.id))
      .innerJoin(openScalingTable, eq(openScoreTable.scalingId, openScalingTable.id))
      .where(onTeam),
  ]);
  return { members, scores };
}

/** One workout's scores with display fields, shaped as RankableScore for `rankScores`. */
export async function getPublicWorkoutScores({ eventId, workoutId }: { eventId: string; workoutId: string }) {
  const db = getDB();
  return db
    .select({
      id: openScoreTable.id,
      value: openScoreTable.value,
      capped: openScoreTable.capped,
      tiebreakMs: openScoreTable.tiebreakMs,
      scalingRank: openScalingTable.rank,
      scalingName: openScalingTable.name,
      scalingSlug: openScalingTable.slug,
      participantName: openParticipantTable.name,
      teamName: openTeamTable.name,
      teamSlug: openTeamTable.slug,
      teamColor: openTeamTable.color,
    })
    .from(openScoreTable)
    .innerJoin(openScalingTable, eq(openScoreTable.scalingId, openScalingTable.id))
    .innerJoin(openEntryTable, eq(openScoreTable.entryId, openEntryTable.id))
    .innerJoin(openParticipantTable, eq(openEntryTable.participantId, openParticipantTable.id))
    .leftJoin(openTeamTable, eq(openEntryTable.teamId, openTeamTable.id))
    .where(and(eq(openScoreTable.workoutId, workoutId), eq(openEntryTable.eventId, eventId)));
}
