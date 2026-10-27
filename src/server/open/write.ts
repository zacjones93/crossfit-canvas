import "server-only";
import { revalidatePath, revalidateTag } from "next/cache";
import { and, eq, exists, sql, type SQL } from "drizzle-orm";
import type { SQLiteColumn, SQLiteTable } from "drizzle-orm/sqlite-core";
import { ZSAError } from "zsa";
import { openEventTable } from "@/db/schema";
import { diffRow } from "@/lib/open/audit";
import { openEventTag } from "@/lib/open/cache-tags";
import { OPEN_AUDIT_VERB } from "@/lib/open/constants";
import { classifyDbError, DB_CONSTRAINT } from "@/lib/open/db-errors";
import { getSessionFromCookie, requireAdmin } from "@/utils/auth";
import { auditStatement, type OpenAuditEntity } from "./audit-write";
import type { OpenDB, OpenStatement } from "./batch";

export { chunkedInsert, type OpenDB, type OpenStatement } from "./batch";

/** Session for shared (admin + coach) Open actions. */
export async function requireOpenSession() {
  const session = await getSessionFromCookie();
  if (!session) throw new ZSAError("NOT_AUTHORIZED", "Please sign in");
  return session;
}

/** Admin-only Open config actions. `requireAdmin()` throws unless the session is an admin. */
export async function requireOpenAdmin() {
  return (await requireAdmin())!;
}

/** Awaits a single-row read and throws a friendly NOT_FOUND when it's missing. */
export async function orNotFound<T>({ row, label }: { row: Promise<T | undefined>; label: string }): Promise<T> {
  const found = await row;
  if (!found) throw new ZSAError("NOT_FOUND", `${label} not found`);
  return found;
}

export function loadEvent({ db, eventId }: { db: OpenDB; eventId: string }) {
  return orNotFound({ row: db.query.openEventTable.findFirst({ where: eq(openEventTable.id, eventId) }), label: "Event" });
}

/** Each batched statement counts toward D1's 1000 queries per invocation (Workers Paid); keep headroom for reads. */
export const MAX_BATCH_STATEMENTS = 900;

interface ConstraintMessages {
  foreignKey?: string;
  unique?: string;
  check?: string;
}

/**
 * Runs mutation + audit statements atomically (D1 batch = one implicit transaction) and maps
 * constraint failures to friendly ZSAErrors. Never surfaces SQL; unknown failures are logged.
 * Returns each statement's result (row arrays for `.returning()` statements).
 */
export async function runOpenBatch({
  db,
  statements,
  messages = {},
}: {
  db: OpenDB;
  statements: OpenStatement[];
  messages?: ConstraintMessages;
}): Promise<unknown[]> {
  if (statements.length === 0) return [];
  if (statements.length > MAX_BATCH_STATEMENTS) {
    throw new ZSAError("PRECONDITION_FAILED", "That's too many changes at once; split it into smaller batches");
  }
  try {
    return await db.batch(statements as [OpenStatement, ...OpenStatement[]]);
  } catch (error) {
    throw toFriendlyError({ error, messages });
  }
}

export function toFriendlyError({ error, messages = {} }: { error: unknown; messages?: ConstraintMessages }): ZSAError {
  if (error instanceof ZSAError) return error;
  switch (classifyDbError(error)) {
    case DB_CONSTRAINT.FOREIGN_KEY:
      return new ZSAError("PRECONDITION_FAILED", messages.foreignKey ?? "Other records depend on this; remove them first");
    case DB_CONSTRAINT.UNIQUE:
      return new ZSAError("CONFLICT", messages.unique ?? "That already exists");
    case DB_CONSTRAINT.CHECK:
      return new ZSAError("PRECONDITION_FAILED", messages.check ?? "That change isn't allowed");
    default:
      console.error("[open] write failed", error);
      return new ZSAError("INTERNAL_SERVER_ERROR", "Something went wrong saving your changes. Please try again.");
  }
}

/** Rows touched by a `.returning()` statement in a batch result. */
export function affectedRows(result: unknown): number {
  return Array.isArray(result) ? result.length : 0;
}

/** Extra WHERE condition for a guarded write, and the error when it no longer holds. */
export interface WriteGuard {
  condition: SQL;
  message: string;
  code?: "CONFLICT" | "PRECONDITION_FAILED";
}

export const CHANGED_BY_SOMEONE_ELSE = "This was just changed by someone else; refresh and try again";

/** Optimistic lock: the row still has the `updateCounter` we loaded. */
export function unchangedSince({
  table,
  updateCounter,
}: {
  table: SQLiteTable & { updateCounter: SQLiteColumn };
  updateCounter: number | null;
}): WriteGuard {
  return {
    condition: updateCounter === null ? sql`${table.updateCounter} is null` : eq(table.updateCounter, updateCounter),
    message: CHANGED_BY_SOMEONE_ELSE,
  };
}

type OpenTable = SQLiteTable & { id: SQLiteColumn };

interface AuditedWriteBase<TRow extends { id: string }> {
  db: OpenDB;
  table: OpenTable;
  entityType: OpenAuditEntity;
  eventId: string | null;
  actorUserId: string;
  row: TRow;
}

function rowExists({ db, table, where }: { db: OpenDB; table: OpenTable; where: SQL }) {
  return exists(db.select({ one: sql`1` }).from(table).where(where));
}

/**
 * Updates one row with exactly the fields that change (no-op → no write, no audit) plus its audit
 * row in one batch. With a `guard` (decided from the actual changes) the UPDATE and the audit
 * both carry the guard condition; if it no longer holds nothing is written and the guard's
 * error is thrown.
 */
export async function auditedUpdate<TRow extends { id: string }>({
  db,
  table,
  entityType,
  eventId,
  actorUserId,
  row,
  updates,
  describe,
  guard,
  messages,
}: AuditedWriteBase<TRow> & {
  updates: { [K in keyof TRow]?: TRow[K] | undefined };
  describe: (args: { after: TRow; changedKeys: string[] }) => string;
  guard?: (args: { changes: Partial<TRow> }) => WriteGuard | undefined;
  messages?: ConstraintMessages;
}): Promise<{ row: TRow; changed: boolean }> {
  const { changes, changedKeys, after } = diffRow({ before: row, updates });
  if (changedKeys.length === 0) return { row, changed: false };

  const activeGuard = guard?.({ changes });
  const where = activeGuard ? and(eq(table.id, row.id), activeGuard.condition)! : eq(table.id, row.id);
  const results = await runOpenBatch({
    db,
    statements: [
      auditStatement({
        db,
        eventId,
        actorUserId,
        verb: OPEN_AUDIT_VERB.UPDATE,
        entityType,
        entityId: row.id,
        before: row,
        after,
        summary: describe({ after, changedKeys }),
        when: activeGuard ? rowExists({ db, table, where }) : undefined,
      }),
      // Generic table: drizzle can't relate Partial<TRow> to the table's set-source type
      db.update(table).set(changes as never).where(where).returning({ id: table.id }),
    ],
    messages,
  });
  if (activeGuard && affectedRows(results[1]) === 0) {
    throw new ZSAError(activeGuard.code ?? "CONFLICT", activeGuard.message);
  }
  return { row: after, changed: true };
}

/**
 * [conditional audit, guarded DELETE … RETURNING id] for one row, for composing into a larger
 * batch. The audit is written only if the row (still) matches, so repeated deletes audit once.
 */
export function auditedDeleteStatements<TRow extends { id: string }>({
  db,
  table,
  entityType,
  eventId,
  actorUserId,
  row,
  summary,
  condition,
}: AuditedWriteBase<TRow> & { summary: string; condition?: SQL }): [OpenStatement, OpenStatement] {
  const where = condition ? and(eq(table.id, row.id), condition)! : eq(table.id, row.id);
  return [
    auditStatement({
      db,
      eventId,
      actorUserId,
      verb: OPEN_AUDIT_VERB.DELETE,
      entityType,
      entityId: row.id,
      before: row,
      summary,
      when: rowExists({ db, table, where }),
    }),
    db.delete(table).where(where).returning({ id: table.id }),
  ];
}

/**
 * Deletes one row + its audit. Without a guard, an already-deleted row is a no-op
 * (`deleted: false`); with one, a failed guard throws its error.
 */
export async function auditedDelete<TRow extends { id: string }>({
  guard,
  messages,
  ...input
}: AuditedWriteBase<TRow> & { summary: string; guard?: WriteGuard; messages?: ConstraintMessages }): Promise<{ deleted: boolean }> {
  const results = await runOpenBatch({
    db: input.db,
    statements: auditedDeleteStatements({ ...input, condition: guard?.condition }),
    messages,
  });
  const deleted = affectedRows(results[1]) > 0;
  if (!deleted && guard) throw new ZSAError(guard.code ?? "CONFLICT", guard.message);
  return { deleted };
}

/** Invalidate cached standings and the Open admin/public pages after an event mutation. */
export function revalidateOpenEvent({ eventId }: { eventId: string }) {
  revalidateTag(openEventTag({ eventId }));
  revalidatePath("/admin/open", "layout");
  revalidatePath("/open", "layout");
}
