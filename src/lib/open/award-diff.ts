// Plain module: the bulk award delta for one (rule, dedupeKey) column of the award grid.

export interface ExistingAward {
  id: string;
  entryId: string;
}

/**
 * Applies `awarded` to exactly `entryIds` (nothing else is touched): awarding adds the entries
 * that lack the award; un-awarding removes their existing awards. Idempotent; ids are deduped.
 * Callers must permission-check every entry in `entryIds` first.
 */
export function planAwardDelta<T extends ExistingAward>({
  entryIds,
  existingAwards,
  awarded,
}: {
  entryIds: readonly string[];
  existingAwards: readonly T[];
  awarded: boolean;
}): { toAdd: string[]; toRemove: T[] } {
  const targets = new Set(entryIds);
  if (!awarded) return { toAdd: [], toRemove: existingAwards.filter((award) => targets.has(award.entryId)) };

  const has = new Set(existingAwards.map((award) => award.entryId));
  return { toAdd: [...targets].filter((entryId) => !has.has(entryId)), toRemove: [] };
}
