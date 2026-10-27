import "server-only";
import { unstable_cache } from "next/cache";
import { getDB } from "@/db";
import { openAwardTable, openEntryTable, openParticipantTable, openTeamTable } from "@/db/schema";
import { openEventTag } from "@/lib/open/cache-tags";
import { computeStandings } from "@/lib/open/standings";
import { eq } from "drizzle-orm";

async function loadStandings({ eventId }: { eventId: string }) {
  const db = getDB();
  const [teams, entries, awards] = await db.batch([
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
  ]);

  return computeStandings({ teams, entries, awards });
}

/**
 * Derived standings for an event, always including individuals. Public pages drop individuals when the event
 * hides them (`loadEventBoard`, from the uncached event row). Cached per event (OpenNext KV incremental cache + D1 tag cache);
 * every Open mutation must `revalidateTag(openEventTag({ eventId }))`.
 */
export async function getStandings({ eventId }: { eventId: string }) {
  return unstable_cache(() => loadStandings({ eventId }), ["open-standings", eventId], {
    tags: [openEventTag({ eventId })],
  })();
}
