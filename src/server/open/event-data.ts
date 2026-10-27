import "server-only";
import { getDB } from "@/db";
import {
  openEntryTable,
  openPointRuleTable,
  openScalingTable,
  openTeamTable,
  openWeekTable,
  openWorkoutTable,
} from "@/db/schema";
import { asc, eq } from "drizzle-orm";

export async function getWeeks({ eventId }: { eventId: string }) {
  const db = getDB();
  return db.query.openWeekTable.findMany({
    where: eq(openWeekTable.eventId, eventId),
    orderBy: [asc(openWeekTable.number)],
  });
}

export async function getTeams({ eventId }: { eventId: string }) {
  const db = getDB();
  return db.query.openTeamTable.findMany({
    where: eq(openTeamTable.eventId, eventId),
    orderBy: [asc(openTeamTable.sortOrder), asc(openTeamTable.name)],
    with: {
      coaches: {
        with: {
          coach: { columns: { id: true, name: true, slug: true, userId: true } },
        },
      },
    },
  });
}

export async function getTeamBySlug({ eventId, slug }: { eventId: string; slug: string }) {
  const db = getDB();
  return db.query.openTeamTable.findFirst({
    where: (team, { and }) => and(eq(team.eventId, eventId), eq(team.slug, slug)),
  });
}

export async function getRules({ eventId }: { eventId: string }) {
  const db = getDB();
  return db.query.openPointRuleTable.findMany({
    where: eq(openPointRuleTable.eventId, eventId),
    orderBy: [asc(openPointRuleTable.sortOrder), asc(openPointRuleTable.name)],
  });
}

export async function getScalings({ eventId }: { eventId: string }) {
  const db = getDB();
  return db.query.openScalingTable.findMany({
    where: eq(openScalingTable.eventId, eventId),
    orderBy: [asc(openScalingTable.rank)],
  });
}

export async function getWorkouts({ eventId }: { eventId: string }) {
  const db = getDB();
  return db.query.openWorkoutTable.findMany({
    where: eq(openWorkoutTable.eventId, eventId),
    orderBy: [asc(openWorkoutTable.sortOrder), asc(openWorkoutTable.name)],
  });
}

export async function getWorkoutBySlug({ eventId, slug }: { eventId: string; slug: string }) {
  const db = getDB();
  return db.query.openWorkoutTable.findFirst({
    where: (workout, { and }) => and(eq(workout.eventId, eventId), eq(workout.slug, slug)),
  });
}

/** Entries with participant + team, sorted by participant name. */
export async function getEntries({ eventId }: { eventId: string }) {
  const db = getDB();
  const entries = await db.query.openEntryTable.findMany({
    where: eq(openEntryTable.eventId, eventId),
    with: {
      participant: true,
      team: { columns: { id: true, name: true, slug: true, color: true } },
    },
  });
  return entries.sort((a, b) => a.participant.name.localeCompare(b.participant.name));
}
