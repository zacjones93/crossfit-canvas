import "server-only";
import { getDB } from "@/db";
import { openAwardTable, openEntryTable, openParticipantTable, openPointRuleTable } from "@/db/schema";
import { and, desc, eq, type SQL } from "drizzle-orm";

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
