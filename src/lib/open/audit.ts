// Plain module: shaping audit log payloads (src/server/open/audit-write.ts writes them).

const OMITTED_AUDIT_KEYS = new Set(["createdAt", "updatedAt", "updateCounter"]);

/** JSON snapshot of a row for `open_audit_log.before/after` (timestamps + updateCounter omitted). */
export function toAuditJson(row: object | null | undefined): string | null {
  if (!row) return null;
  const snapshot = Object.fromEntries(Object.entries(row).filter(([key]) => !OMITTED_AUDIT_KEYS.has(key)));
  return JSON.stringify(snapshot);
}

export function formatPoints(points: number): string {
  return `${points} ${Math.abs(points) === 1 ? "pt" : "pts"}`;
}

/** "Costume (Week 2)" / "Judges Course" — the award's rule plus week when it has one. */
export function awardLabel({ ruleName, weekLabel }: { ruleName: string; weekLabel?: string | null }): string {
  return weekLabel ? `${ruleName} (${weekLabel})` : ruleName;
}

export const AWARD_VERB = {
  AWARDED: "Awarded",
  REMOVED: "Removed",
} as const;

/** "Awarded Costume (Week 2) to Jane Doe — 1 pt" / "Removed … from …". */
export function describeAward({
  verb,
  ruleName,
  weekLabel,
  athlete,
  points,
  reason,
}: {
  verb: (typeof AWARD_VERB)[keyof typeof AWARD_VERB];
  ruleName: string;
  weekLabel?: string | null;
  athlete: string;
  points: number;
  reason?: string;
}): string {
  const preposition = verb === AWARD_VERB.AWARDED ? "to" : "from";
  const suffix = reason ? ` (${reason})` : "";
  return `${verb} ${awardLabel({ ruleName, weekLabel })} ${preposition} ${athlete} — ${formatPoints(points)}${suffix}`;
}

function isSameValue(a: unknown, b: unknown): boolean {
  if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
  return a === b;
}

/**
 * Applies `updates` (undefined = leave as is) to `before`. Returns only the fields that actually
 * change, so actions can skip no-op writes and audit exactly what moved.
 */
export function diffRow<T extends object>({
  before,
  updates,
}: {
  before: T;
  updates: { [K in keyof T]?: T[K] | undefined };
}): { changes: Partial<T>; changedKeys: (keyof T & string)[]; after: T } {
  const changes: Partial<T> = {};
  const changedKeys: (keyof T & string)[] = [];
  for (const key of Object.keys(updates) as (keyof T & string)[]) {
    const value = updates[key];
    if (value === undefined || isSameValue(before[key], value)) continue;
    changes[key] = value as T[typeof key];
    changedKeys.push(key);
  }
  return { changes, changedKeys, after: { ...before, ...changes } };
}
