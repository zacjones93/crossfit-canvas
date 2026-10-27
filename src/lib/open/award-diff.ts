// Plain module: desired-state sync for one (rule, dedupeKey) column of the award grid.

export interface ExistingAward {
  id: string;
  entryId: string;
}

/**
 * `desiredEntryIds` should hold the award after the sync; everything else in scope should not.
 * Removals are limited to `scopeEntryIds` (entries the actor may manage) so a coach syncing their
 * team never strips other teams' awards. Callers must permission-check every desired entry first.
 */
export function diffAwards<T extends ExistingAward>({
  desiredEntryIds,
  existingAwards,
  scopeEntryIds,
}: {
  desiredEntryIds: readonly string[];
  existingAwards: readonly T[];
  scopeEntryIds: ReadonlySet<string>;
}): { toAdd: string[]; toRemove: T[] } {
  const desired = new Set(desiredEntryIds);
  const awarded = new Set(existingAwards.map((award) => award.entryId));

  return {
    toAdd: [...desired].filter((entryId) => !awarded.has(entryId)),
    toRemove: existingAwards.filter((award) => scopeEntryIds.has(award.entryId) && !desired.has(award.entryId)),
  };
}
