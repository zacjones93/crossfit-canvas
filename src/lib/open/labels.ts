// Plain module: display labels for Open enum values (admin UI).
import {
  OPEN_EVENT_STATUS,
  OPEN_RULE_CADENCE,
  OPEN_SCORE_TYPE,
  OPEN_WEIGHT_UNIT,
} from "@/lib/open/constants"

export const EVENT_STATUS_LABEL: Record<string, string> = {
  [OPEN_EVENT_STATUS.DRAFT]: "Draft",
  [OPEN_EVENT_STATUS.LIVE]: "Live",
  [OPEN_EVENT_STATUS.CLOSED]: "Closed",
}

export const WEIGHT_UNIT_LABEL: Record<string, string> = {
  [OPEN_WEIGHT_UNIT.LB]: "Pounds (lb)",
  [OPEN_WEIGHT_UNIT.KG]: "Kilograms (kg)",
}

export const RULE_CADENCE_LABEL: Record<string, string> = {
  [OPEN_RULE_CADENCE.PER_WEEK]: "Once per week",
  [OPEN_RULE_CADENCE.ONCE_PER_EVENT]: "Once per event",
  [OPEN_RULE_CADENCE.UNLIMITED]: "Unlimited",
}

export const SCORE_TYPE_LABEL: Record<string, string> = {
  [OPEN_SCORE_TYPE.TIME]: "For time",
  [OPEN_SCORE_TYPE.REPS]: "Reps",
  [OPEN_SCORE_TYPE.ROUNDS_REPS]: "Rounds + reps",
  [OPEN_SCORE_TYPE.LOAD]: "Load",
  [OPEN_SCORE_TYPE.POINTS]: "Points",
}

/** Label for a value from one of the maps above, falling back to the raw value. */
export function labelFor({ labels, value }: { labels: Record<string, string>; value: string }): string {
  return labels[value] ?? value
}
