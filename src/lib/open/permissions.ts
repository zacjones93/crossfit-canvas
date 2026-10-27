// Plain module (no DB / server-only imports): the one decision of who may mutate an entry's
// awards or scores. Split in two so bulk writes load once and check many entries:
//   decideManageContext — validates the referenced rows (once per request)
//   decideManageEntry   — checks one entry against that context (once per entry)
// The server loader (src/server/open/permissions.ts) feeds both with loaded rows.
import { OPEN_RULE_CADENCE } from "./constants";

export const MANAGE_KIND = {
  POINTS: "points",
  SCORES: "scores",
} as const;

export type ManageKind = (typeof MANAGE_KIND)[keyof typeof MANAGE_KIND];

export const MANAGE_DENIAL = {
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  PRECONDITION_FAILED: "PRECONDITION_FAILED",
} as const;

export type ManageDenialCode = (typeof MANAGE_DENIAL)[keyof typeof MANAGE_DENIAL];

export interface ManageEvent {
  id: string;
  coachPointsEnabled: boolean;
  coachScoresEnabled: boolean;
}

export interface ManageRule {
  eventId: string;
  cadence: string;
  coachAwardable: boolean;
  isActive: boolean;
}

export interface ManageWeek {
  id: string;
  eventId: string;
  lockedAt: Date | null;
}

export interface ManageWorkout {
  eventId: string;
  weekId: string | null;
}

export interface ManageScaling {
  eventId: string;
}

export interface ManageEntry {
  eventId: string;
  teamId: string | null;
}

/**
 * For each optional reference: `undefined` = not requested, `null` = requested but not found.
 * `week` is the requested week for points, or the workout's week (if any) for scores.
 * `manageableTeamIds` is only consulted for non-admins.
 */
export interface ManageContext {
  kind: ManageKind;
  isAdmin: boolean;
  manageableTeamIds: ReadonlySet<string>;
  event: ManageEvent;
  rule?: ManageRule | null;
  week?: ManageWeek | null;
  workout?: ManageWorkout | null;
  scaling?: ManageScaling | null;
}

export type ManageDecision =
  | { ok: true }
  | { ok: false; code: ManageDenialCode; message: string };

const OK: ManageDecision = { ok: true };

function deny({ code, message }: { code: ManageDenialCode; message: string }): ManageDecision {
  return { ok: false, code, message };
}

/** Request-level validation: refs exist, share the event, and fit the kind/cadence. Applies to admins too. */
export function decideManageContext({ kind, event, rule, week, workout, scaling }: ManageContext): ManageDecision {
  const refs = { rule, week, workout, scaling };
  for (const [name, ref] of Object.entries(refs)) {
    if (ref === null) return deny({ code: MANAGE_DENIAL.NOT_FOUND, message: `${name} not found` });
    if (ref && ref.eventId !== event.id) {
      return deny({ code: MANAGE_DENIAL.PRECONDITION_FAILED, message: `${name} belongs to a different event` });
    }
  }

  if (kind === MANAGE_KIND.POINTS) {
    if (!rule) return deny({ code: MANAGE_DENIAL.PRECONDITION_FAILED, message: "rule is required to manage points" });
    if (rule.cadence === OPEN_RULE_CADENCE.PER_WEEK && !week) {
      return deny({ code: MANAGE_DENIAL.PRECONDITION_FAILED, message: "a week is required for a weekly rule" });
    }
    if (rule.cadence === OPEN_RULE_CADENCE.ONCE_PER_EVENT && week) {
      return deny({ code: MANAGE_DENIAL.PRECONDITION_FAILED, message: "a once-per-event rule takes no week" });
    }
  }

  if (kind === MANAGE_KIND.SCORES && !workout) {
    return deny({ code: MANAGE_DENIAL.PRECONDITION_FAILED, message: "workout is required to manage scores" });
  }

  return OK;
}

/** Per-entry check against an already-validated context. Admins bypass coach-only checks, not the event match. */
export function decideManageEntry({ context, entry }: { context: ManageContext; entry: ManageEntry }): ManageDecision {
  const { kind, isAdmin, manageableTeamIds, event, rule, week } = context;

  if (entry.eventId !== event.id) {
    return deny({ code: MANAGE_DENIAL.PRECONDITION_FAILED, message: "entry belongs to a different event" });
  }
  if (isAdmin) return OK;

  if (!entry.teamId || !manageableTeamIds.has(entry.teamId)) {
    return deny({ code: MANAGE_DENIAL.FORBIDDEN, message: "Not a coach of this athlete's team" });
  }

  const isKindEnabled = kind === MANAGE_KIND.POINTS ? event.coachPointsEnabled : event.coachScoresEnabled;
  if (!isKindEnabled) return deny({ code: MANAGE_DENIAL.FORBIDDEN, message: `Coach ${kind} entry is disabled for this event` });

  if (week?.lockedAt) return deny({ code: MANAGE_DENIAL.PRECONDITION_FAILED, message: "This week is locked" });

  if (kind === MANAGE_KIND.POINTS && rule) {
    if (!rule.coachAwardable) return deny({ code: MANAGE_DENIAL.FORBIDDEN, message: "Only admins can award this rule" });
    if (!rule.isActive) return deny({ code: MANAGE_DENIAL.PRECONDITION_FAILED, message: "This rule is retired" });
  }

  return OK;
}
