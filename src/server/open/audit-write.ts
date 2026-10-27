import "server-only";
import { getTableColumns, sql, type SQL } from "drizzle-orm";
import { newOpenId, openAuditLogTable } from "@/db/schema";
import { toAuditJson } from "@/lib/open/audit";
import { OPEN_AUDIT_ENTITY, OPEN_AUDIT_VERB } from "@/lib/open/constants";
import { chunkedInsert, type OpenDB, type OpenStatement } from "./batch";

export type OpenAuditVerb = (typeof OPEN_AUDIT_VERB)[keyof typeof OPEN_AUDIT_VERB];
export type OpenAuditEntity = (typeof OPEN_AUDIT_ENTITY)[keyof typeof OPEN_AUDIT_ENTITY];

export interface OpenAuditInput {
  eventId: string | null;
  actorUserId: string | null;
  verb: OpenAuditVerb;
  entityType: OpenAuditEntity;
  entityId: string;
  /** Row before the change (null/omitted for create); timestamps are stripped. */
  before?: object | null;
  /** Row after the change (null/omitted for delete); timestamps are stripped. */
  after?: object | null;
  summary: string;
}

function toAuditRow({ eventId, actorUserId, verb, entityType, entityId, before, after, summary }: OpenAuditInput) {
  return {
    eventId,
    actorUserId,
    action: verb,
    entityType,
    entityId,
    before: toAuditJson(before),
    after: toAuditJson(after),
    summary,
  };
}

/**
 * One `open_audit_log` insert, NOT awaited: put it in the same `db.batch([...])` as the change
 * it describes so both commit or neither does.
 *
 * `when` makes it conditional (`INSERT … SELECT … WHERE <when>`): place it BEFORE a guarded
 * delete/update in the batch, with the same condition, so a no-op mutation (row already gone,
 * guard failed) writes no audit row — e.g. a double-clicked delete is audited once.
 */
export function auditStatement({ db, when, ...input }: OpenAuditInput & { db: OpenDB; when?: SQL }): OpenStatement {
  if (!when) return db.insert(openAuditLogTable).values(toAuditRow(input));

  const now = new Date();
  const row: Record<string, unknown> = {
    id: newOpenId.auditLog(),
    createdAt: now,
    updatedAt: now,
    updateCounter: 0,
    ...toAuditRow(input),
  };
  // Drizzle's insert…select lists every table column in definition order; mirror it here
  const values = sql.join(
    Object.entries(getTableColumns(openAuditLogTable)).map(([key, column]) => sql.param(row[key] ?? null, column)),
    sql`, `,
  );
  return db.insert(openAuditLogTable).select(sql`select ${values} where ${when}`);
}

/** Many unconditional audit rows (one per changed entity), chunked under D1's bound-parameter cap. */
export function auditStatements({ db, entries }: { db: OpenDB; entries: OpenAuditInput[] }): OpenStatement[] {
  return chunkedInsert({ db, table: openAuditLogTable, rows: entries.map(toAuditRow) });
}
