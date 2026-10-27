// Plain module: classify SQLite/D1 constraint failures so actions can turn them into friendly
// messages without ever surfacing raw SQL. Drizzle wraps driver errors (`cause` chain).

export const DB_CONSTRAINT = {
  FOREIGN_KEY: "foreign_key",
  UNIQUE: "unique",
  CHECK: "check",
} as const;

export type DbConstraint = (typeof DB_CONSTRAINT)[keyof typeof DB_CONSTRAINT];

const PATTERNS: [RegExp, DbConstraint][] = [
  [/FOREIGN KEY constraint failed/i, DB_CONSTRAINT.FOREIGN_KEY],
  [/UNIQUE constraint failed/i, DB_CONSTRAINT.UNIQUE],
  [/CHECK constraint failed/i, DB_CONSTRAINT.CHECK],
];

const MAX_CAUSE_DEPTH = 5;

export function classifyDbError(error: unknown): DbConstraint | null {
  let current: unknown = error;
  for (let depth = 0; current && depth < MAX_CAUSE_DEPTH; depth++) {
    const message = current instanceof Error ? current.message : String(current);
    for (const [pattern, constraint] of PATTERNS) if (pattern.test(message)) return constraint;
    current = current instanceof Error ? current.cause : undefined;
  }
  return null;
}
