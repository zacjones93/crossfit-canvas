import "server-only";
import { getDB } from "@/db";
import { openAwardTable, openEntryTable, openParticipantTable, openPointRuleTable } from "@/db/schema";
import { and, asc, desc, eq, isNull, type SQL } from "drizzle-orm";

/** Awards in an event (optionally one week / one team), joined through the entry. */
export async function getAwards({
  eventId,
  weekId,
  teamId,
}: {
  eventId: string;
  weekId?: string;
  teamId?: string;
}) {
  const db = getDB();
  const conditions: SQL[] = [eq(openEntryTable.eventId, eventId)];
  if (weekId) conditions.push(eq(openAwardTable.weekId, weekId));
  if (teamId) conditions.push(eq(openEntryTable.teamId, teamId));

  return db
    .select({
      id: openAwardTable.id,
      entryId: openAwardTable.entryId,
      ruleId: openAwardTable.ruleId,
      weekId: openAwardTable.weekId,
      points: openAwardTable.points,
      dedupeKey: openAwardTable.dedupeKey,
      note: openAwardTable.note,
      awardedByUserId: openAwardTable.awardedByUserId,
      createdAt: openAwardTable.createdAt,
      teamId: openEntryTable.teamId,
      participantName: openParticipantTable.name,
      ruleName: openPointRuleTable.name,
    })
    .from(openAwardTable)
    .innerJoin(openEntryTable, eq(openAwardTable.entryId, openEntryTable.id))
    .innerJoin(openParticipantTable, eq(openEntryTable.participantId, openParticipantTable.id))
    .innerJoin(openPointRuleTable, eq(openAwardTable.ruleId, openPointRuleTable.id))
    .where(and(...conditions))
    .orderBy(desc(openAwardTable.createdAt));
}

/**
 * Slim award rows for one grid view: a week's awards (`weekId`) or the event-level ones
 * (`weekId` null: once-per-event + unweeked repeatable awards), optionally one team's entries.
 * Filters by eventId/teamId through the entry join — never an `inArray` over entry ids.
 */
export async function getGridAwards({
  eventId,
  weekId,
  teamId,
}: {
  eventId: string;
  weekId: string | null;
  teamId?: string;
}) {
  const db = getDB();
  const conditions: SQL[] = [
    eq(openEntryTable.eventId, eventId),
    weekId ? eq(openAwardTable.weekId, weekId) : isNull(openAwardTable.weekId),
  ];
  if (teamId) conditions.push(eq(openEntryTable.teamId, teamId));

  return db
    .select({
      id: openAwardTable.id,
      entryId: openAwardTable.entryId,
      ruleId: openAwardTable.ruleId,
      points: openAwardTable.points,
    })
    .from(openAwardTable)
    .innerJoin(openEntryTable, eq(openAwardTable.entryId, openEntryTable.id))
    .where(and(...conditions))
    .orderBy(asc(openAwardTable.createdAt));
}
