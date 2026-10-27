import "server-only";
import { ROLES_ENUM } from "@/db/schema";
import {
  decidePointsView,
  decideScoresView,
  editableRuleIds,
  resolveAwardView,
  resolveWorkout,
  rulesForView,
  type ViewerScope,
} from "@/lib/open/grid";
import { getGridAwards } from "./awards";
import { getEntries, getRules, getScalings, getWeeks, getWorkouts } from "./event-data";
import { getGridScores } from "./scores";

// Props for the shared AwardGrid / ScoreGrid (admin: all teams; coach workspace: one team).
// Editability comes from the pure permission decision, the same one the actions enforce.

/** Who is looking (and at which team); the event row carries the coach flags and weight unit. */
export interface GridScope extends ViewerScope {
  event: ViewerScope["event"] & { weightUnit: string };
}

async function getGridEntries({ eventId, teamId }: { eventId: string; teamId: string | null }) {
  const entries = await getEntries({ eventId, teamId: teamId ?? undefined });
  return entries.map((entry) => ({ id: entry.id, name: entry.participant.name, team: entry.team }));
}

/** `week`: the `?week=` param (week number or "event"). `notice` explains a read-only view. */
export async function loadAwardGridData({ scope, week }: { scope: GridScope; week?: string | null }) {
  const eventId = scope.event.id;
  const teamId = scope.teamId ?? undefined;
  const [weeks, rules, entries] = await Promise.all([
    getWeeks({ eventId }),
    getRules({ eventId }),
    getGridEntries({ eventId, teamId: scope.teamId }),
  ]);
  const view = resolveAwardView({ weeks, requested: week, now: new Date() });
  const awards = await getGridAwards({ eventId, weekId: view.week?.id ?? null, teamId });
  const viewRules = rulesForView({
    rules,
    isEventView: !view.week,
    awardedRuleIds: new Set(awards.map((award) => award.ruleId)),
  });
  // Week-independent notice (team, flag); the lock gets its own banner in the grid
  const decision = decidePointsView({ scope, week: null });
  const isLocked = !!view.week?.lockedAt;

  return {
    notice: decision.ok ? null : decision.message,
    props: {
      eventId,
      weeks: weeks.map(({ id, number, label, lockedAt }) => ({ id, number, label, lockedAt })),
      selectedWeekId: view.week?.id ?? null,
      rules: viewRules.map(({ id, name, points, cadence, coachAwardable, isActive }) => ({
        id,
        name,
        points,
        cadence,
        coachAwardable,
        isActive,
      })),
      entries,
      awards,
      editableRuleIds: editableRuleIds({ scope, rules: viewRules, week: view.week }),
      lock: { isLocked, appliesToViewer: isLocked && !decidePointsView({ scope, week: view.week }).ok },
    },
  };
}

/** Who entered a score: their name; else (no name) email for admins, a role label for coaches. */
function enteredByName({
  enteredBy,
  isAdminViewer,
}: {
  enteredBy: { firstName: string | null; lastName: string | null; email: string | null; role: string | null };
  isAdminViewer: boolean;
}): string | null {
  const name = [enteredBy.firstName, enteredBy.lastName].filter(Boolean).join(" ");
  if (name) return name;
  if (!enteredBy.role) return null; // user deleted
  if (isAdminViewer && enteredBy.email) return enteredBy.email;
  return enteredBy.role === ROLES_ENUM.ADMIN ? "Admin" : "Coach";
}

/** `workout`: the `?workout=` param (workout slug). `notice` explains a read-only view. */
export async function loadScoreGridData({ scope, workout }: { scope: GridScope; workout?: string | null }) {
  const eventId = scope.event.id;
  const [weeks, workouts, scalings, entries] = await Promise.all([
    getWeeks({ eventId }),
    getWorkouts({ eventId }),
    getScalings({ eventId }),
    getGridEntries({ eventId, teamId: scope.teamId }),
  ]);
  const selected = resolveWorkout({ workouts, requested: workout });
  const scores = selected
    ? await getGridScores({ eventId, workoutId: selected.id, teamId: scope.teamId ?? undefined })
    : [];
  const decision = selected
    ? decideScoresView({ scope, workout: selected, week: weeks.find((week) => week.id === selected.weekId) ?? null })
    : null;

  return {
    notice: decision && !decision.ok ? decision.message : null,
    props: {
      eventId,
      workouts: workouts.map(({ id, name, slug, scoreType, timeCapSeconds, repsPerRound, hasTiebreak }) => ({
        id,
        name,
        slug,
        scoreType,
        timeCapSeconds,
        repsPerRound,
        hasTiebreak,
      })),
      selectedWorkoutId: selected?.id ?? null,
      scalings: scalings.map(({ id, name }) => ({ id, name })),
      entries,
      scores: scores.map((score) => ({
        entryId: score.entryId,
        scalingId: score.scalingId,
        value: score.value,
        capped: score.capped,
        tiebreakMs: score.tiebreakMs,
        enteredBy: enteredByName({
          enteredBy: {
            firstName: score.enteredByFirstName,
            lastName: score.enteredByLastName,
            email: score.enteredByEmail,
            role: score.enteredByRole,
          },
          isAdminViewer: scope.isAdmin,
        }),
        updatedAt: score.updatedAt,
      })),
      weightUnit: scope.event.weightUnit,
      canEdit: !!decision?.ok,
    },
  };
}
