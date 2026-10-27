// Plain module: the one mapping from a rule's cadence to `open_award.dedupeKey`.
// The unique index (entryId, ruleId, dedupeKey) then enforces the cadence; NULLs are distinct in
// SQLite, so `unlimited` awards may repeat. Every award writer must use this.
import { OPEN_RULE_CADENCE } from "./constants";

export const ONCE_PER_EVENT_DEDUPE_KEY = "event";

export function awardDedupeKey({ cadence, weekId }: { cadence: string; weekId: string | null }): string | null {
  switch (cadence) {
    case OPEN_RULE_CADENCE.PER_WEEK:
      if (!weekId) throw new Error("A weekly rule award requires a weekId");
      return weekId;
    case OPEN_RULE_CADENCE.ONCE_PER_EVENT:
      return ONCE_PER_EVENT_DEDUPE_KEY;
    case OPEN_RULE_CADENCE.UNLIMITED:
      return null;
    default:
      throw new Error(`Unknown rule cadence "${cadence}"`);
  }
}
