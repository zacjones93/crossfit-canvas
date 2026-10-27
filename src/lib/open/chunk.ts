// Plain module: D1 caps bound parameters per statement (~100), so large `inArray` lists and
// multi-row inserts must be split. Keep every statement at or under MAX_BOUND_PARAMS.

export const MAX_BOUND_PARAMS = 90;

export function chunk<T>({ items, size }: { items: readonly T[]; size: number }): T[][] {
  if (!Number.isInteger(size) || size < 1) throw new Error("chunk size must be a positive integer");
  const chunks: T[][] = [];
  for (let start = 0; start < items.length; start += size) chunks.push(items.slice(start, start + size));
  return chunks;
}

/** Rows per multi-row insert so `rows × columnsPerRow` stays within MAX_BOUND_PARAMS. */
export function rowsPerInsert(columnsPerRow: number): number {
  return Math.max(1, Math.floor(MAX_BOUND_PARAMS / Math.max(1, columnsPerRow)));
}
