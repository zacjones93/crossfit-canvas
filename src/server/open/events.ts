import "server-only";
import { getDB } from "@/db";
import { openEventTable } from "@/db/schema";
import { OPEN_EVENT_STATUS } from "@/lib/open/constants";
import { desc, eq } from "drizzle-orm";

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
