import "server-only";
import { unstable_cache } from "next/cache";
import { getDB } from "@/db";
import { openAwardTable, openEntryTable, openEventTable, openParticipantTable, openTeamTable } from "@/db/schema";
import { openEventTag } from "@/lib/open/cache-tags";
import { computeStandings } from "@/lib/open/standings";
import { eq } from "drizzle-orm";

async function loadStandings({ eventId }: { eventId: string }) {
  const db = getDB();
  const [events, teams, entries, awards] = await db.batch([
    db
      .select({ showIndividuals: openEventTable.showIndividuals })
      .from(openEventTable)
      .where(eq(openEventTable.id, eventId)),
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

  return {
    ...computeStandings({ teams, entries, awards }),
    showIndividuals: events[0]?.showIndividuals ?? false,
  };
}

/**
 * Derived standings for an event, always including individuals (admin/coach views). Cached per event (OpenNext KV incremental cache + D1 tag cache);
 * every Open mutation must `revalidateTag(openEventTag({ eventId }))`.
 */
export async function getStandings({ eventId }: { eventId: string }) {
  return unstable_cache(() => loadStandings({ eventId }), ["open-standings", eventId], {
    tags: [openEventTag({ eventId })],
  })();
}

/** Standings for public pages: individuals are omitted when the event hides them. */
export async function getPublicStandings({ eventId }: { eventId: string }) {
  const standings = await getStandings({ eventId });
  return standings.showIndividuals ? standings : { ...standings, individuals: [] };
}
