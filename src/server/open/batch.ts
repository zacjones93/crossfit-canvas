import "server-only";
import { getTableColumns, type InferInsertModel } from "drizzle-orm";
import type { BatchItem } from "drizzle-orm/batch";
import type { SQLiteTable } from "drizzle-orm/sqlite-core";
import { getDB } from "@/db";
import { chunk, rowsPerInsert } from "@/lib/open/chunk";

export type OpenDB = ReturnType<typeof getDB>;
export type OpenStatement = BatchItem<"sqlite">;

/** Multi-row inserts split so no statement exceeds D1's bound-parameter cap. */
export function chunkedInsert<T extends SQLiteTable>({
  db,
  table,
  rows,
}: {
  db: OpenDB;
  table: T;
  rows: InferInsertModel<T>[];
}): OpenStatement[] {
  const size = rowsPerInsert(Object.keys(getTableColumns(table)).length);
  return chunk({ items: rows, size }).map((part) => db.insert(table).values(part));
}
