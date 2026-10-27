import "server-only";
import { getDB } from "@/db";
import { openEntryTable, openEventTable, openTeamTable } from "@/db/schema";
import { OPEN_EVENT_STATUS } from "@/lib/open/constants";
import { count, desc, eq } from "drizzle-orm";

export async function getEvents() {
  const db = getDB();
  return db.query.openEventTable.findMany({
    orderBy: [desc(openEventTable.year), desc(openEventTable.createdAt)],
  });
}

export async function getEventBySlug({ slug }: { slug: string }) {
  const db = getDB();
  return db.query.openEventTable.findFirst({
    where: eq(openEventTable.slug, slug),
  });
}

export async function getEventById({ eventId }: { eventId: string }) {
  const db = getDB();
  return db.query.openEventTable.findFirst({
    where: eq(openEventTable.id, eventId),
  });
}

/** Most recent live event (there should normally be at most one). */
export async function getLiveEvent() {
  const db = getDB();
  return db.query.openEventTable.findFirst({
    where: eq(openEventTable.status, OPEN_EVENT_STATUS.LIVE),
    orderBy: [desc(openEventTable.year), desc(openEventTable.createdAt)],
  });
}

export interface OpenEventCounts {
  teams: number;
  entries: number;
}

/** Team and athlete counts per event id (events with none are absent → treat as 0); `eventId` narrows to one event. */
export async function getEventCounts({ eventId }: { eventId?: string } = {}): Promise<Map<string, OpenEventCounts>> {
  const db = getDB();
  const [teams, entries] = await db.batch([
    db
      .select({ eventId: openTeamTable.eventId, total: count() })
      .from(openTeamTable)
      .where(eventId ? eq(openTeamTable.eventId, eventId) : undefined)
      .groupBy(openTeamTable.eventId),
    db
      .select({ eventId: openEntryTable.eventId, total: count() })
      .from(openEntryTable)
      .where(eventId ? eq(openEntryTable.eventId, eventId) : undefined)
      .groupBy(openEntryTable.eventId),
  ]);
  const counts = new Map<string, OpenEventCounts>();
  const at = (id: string) => counts.get(id) ?? counts.set(id, { teams: 0, entries: 0 }).get(id)!;
  for (const row of teams) at(row.eventId).teams = row.total;
  for (const row of entries) at(row.eventId).entries = row.total;
  return counts;
}
