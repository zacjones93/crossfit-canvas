// Plain module (no DB / server-only imports): view selection and per-viewer editability for the
// shared award / score grids. Editability always goes through the one permission decision
// (`decideManageEntry`), so the grid never shows a control the server would refuse.
import { OPEN_RULE_CADENCE } from "./constants";
import {
  decideManageEntry,
  MANAGE_KIND,
  type ManageDecision,
  type ManageEvent,
  type ManageRule,
  type ManageWeek,
  type ManageWorkout,
} from "./permissions";

/** `?week=` value for the event-level view (once-per-event rules, unweeked repeatable awards). */
export const AWARD_EVENT_VIEW = "event";

export interface GridWeek {
  id: string;
  number: number;
  startsAt: Date | null;
}

/** Selected award view: a week, or the event-level view (`week` null). */
export type AwardView<W extends GridWeek = GridWeek> = { week: W } | { week: null };

/**
 * Resolves `?week=` (a week number or "event"). Default: the latest week that has started,
 * else the first week; the event view when there are no weeks.
 */
export function resolveAwardView<W extends GridWeek>({
  weeks,
  requested,
  now,
}: {
  weeks: readonly W[];
  requested: string | null | undefined;
  now: Date;
}): AwardView<W> {
  if (requested === AWARD_EVENT_VIEW) return { week: null };
  const byNumber = weeks.find((week) => String(week.number) === requested);
  if (byNumber) return { week: byNumber };

  const started = weeks.filter((week) => week.startsAt && week.startsAt.getTime() <= now.getTime());
  const fallback = started.at(-1) ?? weeks[0];
  return fallback ? { week: fallback } : { week: null };
}

/** Resolves `?workout=` (a workout slug); default: the first workout. */
export function resolveWorkout<W extends { slug: string }>({
  workouts,
  requested,
}: {
  workouts: readonly W[];
  requested: string | null | undefined;
}): W | null {
  return workouts.find((workout) => workout.slug === requested) ?? workouts[0] ?? null;
}

export interface GridRule {
  id: string;
  cadence: string;
  isActive: boolean;
}

/**
 * Columns for a view: a week shows weekly + repeatable rules; the event view shows once-per-event +
 * repeatable rules. Retired rules only appear while they still hold awards in the view.
 */
export function rulesForView<R extends GridRule>({
  rules,
  isEventView,
  awardedRuleIds,
}: {
  rules: readonly R[];
  isEventView: boolean;
  awardedRuleIds: ReadonlySet<string>;
}): R[] {
  const keyedCadence = isEventView ? OPEN_RULE_CADENCE.ONCE_PER_EVENT : OPEN_RULE_CADENCE.PER_WEEK;
  return rules.filter(
    (rule) =>
      (rule.cadence === keyedCadence || rule.cadence === OPEN_RULE_CADENCE.UNLIMITED) &&
      (rule.isActive || awardedRuleIds.has(rule.id)),
  );
}

export interface ViewerScope {
  isAdmin: boolean;
  manageableTeamIds: ReadonlySet<string>;
  event: ManageEvent;
  /** The team whose entries the grid shows; null = all teams (admins). */
  teamId: string | null;
}

/**
 * View-level decision for points (team, flag, week lock; no rule): a denial is the read-only
 * notice to show. Admins are always allowed.
 */
export function decidePointsView({
  scope,
  week,
}: {
  scope: ViewerScope;
  week: ManageWeek | null;
}): ManageDecision {
  return decideManageEntry({
    context: {
      kind: MANAGE_KIND.POINTS,
      isAdmin: scope.isAdmin,
      manageableTeamIds: scope.manageableTeamIds,
      event: scope.event,
      week,
    },
    entry: { eventId: scope.event.id, teamId: scope.teamId },
  });
}

/** Rule ids the viewer may toggle in this view (same decision the award actions make). */
export function editableRuleIds({
  scope,
  rules,
  week,
}: {
  scope: ViewerScope;
  rules: readonly (ManageRule & { id: string })[];
  week: ManageWeek | null;
}): string[] {
  return rules
    .filter(
      (rule) =>
        decideManageEntry({
          context: {
            kind: MANAGE_KIND.POINTS,
            isAdmin: scope.isAdmin,
            manageableTeamIds: scope.manageableTeamIds,
            event: scope.event,
            rule,
            week,
          },
          entry: { eventId: scope.event.id, teamId: scope.teamId },
        }).ok,
    )
    .map((rule) => rule.id);
}

/** Whether the viewer may enter scores for a workout (the lock week is the workout's week). */
export function decideScoresView({
  scope,
  workout,
  week,
}: {
  scope: ViewerScope;
  workout: ManageWorkout;
  week: ManageWeek | null;
}): ManageDecision {
  return decideManageEntry({
    context: {
      kind: MANAGE_KIND.SCORES,
      isAdmin: scope.isAdmin,
      manageableTeamIds: scope.manageableTeamIds,
      event: scope.event,
      workout,
      week,
    },
    entry: { eventId: scope.event.id, teamId: scope.teamId },
  });
}
