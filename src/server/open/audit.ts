import "server-only";
import { getDB } from "@/db";
import { openAuditLogTable, userTable } from "@/db/schema";
import { and, desc, eq, lt, or, type SQL } from "drizzle-orm";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

/** Opaque keyset cursor: "<createdAtMs>_<id>" of the last row on the previous page. */
function encodeCursor({ createdAt, id }: { createdAt: Date; id: string }): string {
  return `${createdAt.getTime()}_${id}`;
}

function decodeCursor(cursor: string): { createdAt: Date; id: string } | null {
  const separator = cursor.indexOf("_");
  if (separator <= 0) return null;
  const ms = Number(cursor.slice(0, separator));
  const id = cursor.slice(separator + 1);
  return Number.isFinite(ms) && id ? { createdAt: new Date(ms), id } : null;
}

/** Audit rows newest first, keyset-paginated by (createdAt, id) desc. */
export async function getAuditLog({
  eventId,
  entityType,
  entityId,
  actorUserId,
  limit = DEFAULT_LIMIT,
  cursor,
}: {
  eventId: string;
  entityType?: string;
  entityId?: string;
  actorUserId?: string;
  limit?: number;
  cursor?: string | null;
}) {
  const db = getDB();
  const pageSize = Math.min(Math.max(1, Math.floor(limit)), MAX_LIMIT);

  const conditions: (SQL | undefined)[] = [eq(openAuditLogTable.eventId, eventId)];
  if (entityType) conditions.push(eq(openAuditLogTable.entityType, entityType));
  if (entityId) conditions.push(eq(openAuditLogTable.entityId, entityId));
  if (actorUserId) conditions.push(eq(openAuditLogTable.actorUserId, actorUserId));
  const after = cursor ? decodeCursor(cursor) : null;
  if (after) {
    conditions.push(
      or(
        lt(openAuditLogTable.createdAt, after.createdAt),
        and(eq(openAuditLogTable.createdAt, after.createdAt), lt(openAuditLogTable.id, after.id)),
      ),
    );
  }

  const rows = await db
    .select({
      id: openAuditLogTable.id,
      createdAt: openAuditLogTable.createdAt,
      eventId: openAuditLogTable.eventId,
      action: openAuditLogTable.action,
      entityType: openAuditLogTable.entityType,
      entityId: openAuditLogTable.entityId,
      before: openAuditLogTable.before,
      after: openAuditLogTable.after,
      summary: openAuditLogTable.summary,
      actorUserId: openAuditLogTable.actorUserId,
      actorFirstName: userTable.firstName,
      actorLastName: userTable.lastName,
      actorEmail: userTable.email,
    })
    .from(openAuditLogTable)
    .leftJoin(userTable, eq(openAuditLogTable.actorUserId, userTable.id))
    .where(and(...conditions))
    .orderBy(desc(openAuditLogTable.createdAt), desc(openAuditLogTable.id))
    .limit(pageSize + 1);

  const hasMore = rows.length > pageSize;
  const page = hasMore ? rows.slice(0, pageSize) : rows;
  const last = page.at(-1);

  return {
    rows: page.map(({ actorFirstName, actorLastName, actorEmail, ...row }) => ({
      ...row,
      actorName: [actorFirstName, actorLastName].filter(Boolean).join(" ") || actorEmail || null,
    })),
    nextCursor: hasMore && last ? encodeCursor(last) : null,
  };
}
