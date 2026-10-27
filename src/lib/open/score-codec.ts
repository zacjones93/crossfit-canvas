// Plain module (no DB / server-only imports): converts between human score input,
// canonical integer storage (see open_score.value), display strings, and ranking order.
import { OPEN_SCORE_TYPE, OPEN_WEIGHT_UNIT } from "./constants";

export interface ScoreWorkout {
  scoreType: string;
  timeCapSeconds: number | null;
  repsPerRound: number | null;
}

export interface StoredScore {
  value: number;
  capped: boolean;
}

export interface RankableScore extends StoredScore {
  tiebreakMs: number | null;
  scalingRank: number;
}

export type ParseScoreResult =
  | { ok: true; value: number; capped: boolean }
  | { ok: false; error: string };

export type ParseTimeResult =
  | { ok: true; value: number }
  | { ok: false; error: string };

export const GRAMS_PER_UNIT: Record<string, number> = {
  [OPEN_WEIGHT_UNIT.LB]: 453.59237,
  [OPEN_WEIGHT_UNIT.KG]: 1000,
};

/** Sanity maxima for canonical values; anything above is almost certainly a typo. */
export const SCORE_MAX = {
  TIME_MS: 24 * 60 * 60 * 1000,
  REPS: 1_000_000,
  POINTS: 1_000_000,
  LOAD_GRAMS: 1_000_000,
} as const;

const TIME_RE = /^(?:(\d+):)?(\d+):(\d{2})(?:\.(\d{1,3}))?$/;
const CAP_RE = /^cap\s*\+?\s*(\d+)(?:\s*reps?)?$/i;
const INT_RE = /^\d+$/;
const ROUNDS_REPS_RE = /^(\d+)\s*\+\s*(\d+)$/;
const LOAD_RE = /^(\d+(?:\.\d+)?)\s*(lbs?|kgs?)?$/i;

function fail(error: string): { ok: false; error: string } {
  return { ok: false, error };
}

/** Final gate for every parsed value: safe non-negative integer within `max`. */
function bounded({ value, max, capped = false }: { value: number; max: number; capped?: boolean }): ParseScoreResult {
  if (!Number.isSafeInteger(value) || value < 0) return fail("Score is not a valid number");
  if (value > max) return fail("Score is unrealistically large");
  return { ok: true, value, capped };
}

/** Parses "m:ss", "h:mm:ss", optional ".f" fraction → milliseconds. */
export function parseTime(input: string): ParseTimeResult {
  const match = TIME_RE.exec(input.trim());
  if (!match) return fail("Enter a time like 12:34 or 1:02:03");

  const [, hoursRaw, minutesRaw, secondsRaw, fractionRaw] = match;
  const hours = hoursRaw ? Number(hoursRaw) : 0;
  const minutes = Number(minutesRaw);
  const seconds = Number(secondsRaw);

  if (seconds >= 60) return fail("Seconds must be under 60");
  if (hoursRaw && minutes >= 60) return fail("Minutes must be under 60");

  const fractionMs = fractionRaw ? Math.round(Number(`0.${fractionRaw}`) * 1000) : 0;
  const value = ((hours * 60 + minutes) * 60 + seconds) * 1000 + fractionMs;
  if (!Number.isSafeInteger(value)) return fail("Time is not a valid number");
  if (value <= 0) return fail("Time must be greater than zero");
  if (value > SCORE_MAX.TIME_MS) return fail("Time must be under 24 hours");

  return { ok: true, value };
}

/**
 * Milliseconds → "12:34", "1:02:03", "12:34.5", "12:34.91". The fraction shows only when
 * non-zero, with trailing zeros trimmed, so distinct stored values never display the same.
 */
export function formatTime(ms: number): string {
  const fraction = ms % 1000;
  const totalSeconds = Math.floor(ms / 1000);
  const seconds = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const minutes = totalMinutes % 60;
  const hours = Math.floor(totalMinutes / 60);

  const ss = String(seconds).padStart(2, "0");
  const base = hours > 0 ? `${hours}:${String(minutes).padStart(2, "0")}:${ss}` : `${totalMinutes}:${ss}`;
  return fraction ? `${base}.${String(fraction).padStart(3, "0").replace(/0+$/, "")}` : base;
}

export const parseTiebreak = parseTime;
export const formatTiebreak = formatTime;

function parseTimeScore({
  input,
  workout,
  capped,
}: {
  input: string;
  workout: ScoreWorkout;
  capped?: boolean;
}): ParseScoreResult {
  const capMatch = CAP_RE.exec(input);
  if (capMatch || capped) {
    if (!workout.timeCapSeconds) return fail("This workout has no time cap");
    const repsRaw = capMatch ? capMatch[1] : input.replace(/\s*reps?$/i, "");
    if (!INT_RE.test(repsRaw)) return fail("Enter capped reps like CAP+187");
    return bounded({ value: Number(repsRaw), max: SCORE_MAX.REPS, capped: true });
  }

  const time = parseTime(input);
  if (!time.ok) return time;
  if (workout.timeCapSeconds && time.value > workout.timeCapSeconds * 1000) {
    return fail(`Time is over the ${formatTime(workout.timeCapSeconds * 1000)} cap; enter capped reps instead`);
  }
  return { ok: true, value: time.value, capped: false };
}

function parseRoundsReps({ input, workout }: { input: string; workout: ScoreWorkout }): ParseScoreResult {
  const match = ROUNDS_REPS_RE.exec(input);
  if (match) {
    if (!workout.repsPerRound) return fail("This workout has no reps-per-round; enter total reps");
    const rounds = Number(match[1]);
    const reps = Number(match[2]);
    if (reps >= workout.repsPerRound) return fail(`Reps must be under ${workout.repsPerRound} (one round)`);
    return bounded({ value: rounds * workout.repsPerRound + reps, max: SCORE_MAX.REPS });
  }

  const total = input.replace(/\s*reps?$/i, "");
  if (!INT_RE.test(total)) return fail("Enter rounds+reps like 8+12 or total reps");
  return bounded({ value: Number(total), max: SCORE_MAX.REPS });
}

function parseLoad({ input, weightUnit }: { input: string; weightUnit: string }): ParseScoreResult {
  const match = LOAD_RE.exec(input);
  if (!match) return fail("Enter a load like 135");

  const amount = Number(match[1]);
  const suffix = match[2]?.toLowerCase();
  const unit = suffix ? (suffix.startsWith("kg") ? OPEN_WEIGHT_UNIT.KG : OPEN_WEIGHT_UNIT.LB) : weightUnit;
  const gramsPerUnit = GRAMS_PER_UNIT[unit];
  if (!gramsPerUnit) return fail(`Unknown weight unit "${unit}"`);
  if (amount <= 0) return fail("Load must be greater than zero");

  return bounded({ value: Math.round(amount * gramsPerUnit), max: SCORE_MAX.LOAD_GRAMS });
}

/**
 * Parses human input into the canonical integer value for the workout's score type.
 * Capped time scores can be given as "CAP+187" / "cap 187", or as plain reps with `capped: true`.
 * Load input is interpreted in `weightUnit` unless it carries an explicit lb/kg suffix.
 */
export function parseScore({
  input,
  workout,
  capped,
  weightUnit = OPEN_WEIGHT_UNIT.LB,
}: {
  input: string;
  workout: ScoreWorkout;
  capped?: boolean;
  weightUnit?: string;
}): ParseScoreResult {
  const trimmed = input.trim();
  if (!trimmed) return fail("Enter a score");
  if (trimmed.startsWith("-")) return fail("Score can't be negative");
  if (capped && workout.scoreType !== OPEN_SCORE_TYPE.TIME) return fail("Only time workouts can be capped");

  switch (workout.scoreType) {
    case OPEN_SCORE_TYPE.TIME:
      return parseTimeScore({ input: trimmed, workout, capped });
    case OPEN_SCORE_TYPE.REPS: {
      const reps = trimmed.replace(/\s*reps?$/i, "");
      return INT_RE.test(reps) ? bounded({ value: Number(reps), max: SCORE_MAX.REPS }) : fail("Enter whole reps like 245");
    }
    case OPEN_SCORE_TYPE.ROUNDS_REPS:
      return parseRoundsReps({ input: trimmed, workout });
    case OPEN_SCORE_TYPE.LOAD:
      return parseLoad({ input: trimmed, weightUnit });
    case OPEN_SCORE_TYPE.POINTS: {
      const points = trimmed.replace(/\s*(pts?|points?)$/i, "");
      return INT_RE.test(points) ? bounded({ value: Number(points), max: SCORE_MAX.POINTS }) : fail("Enter whole points like 42");
    }
    default:
      return fail(`Unknown score type "${workout.scoreType}"`);
  }
}

function formatLoad({ grams, weightUnit }: { grams: number; weightUnit: string }): string {
  const gramsPerUnit = GRAMS_PER_UNIT[weightUnit] ?? GRAMS_PER_UNIT[OPEN_WEIGHT_UNIT.LB];
  const unit = GRAMS_PER_UNIT[weightUnit] ? weightUnit : OPEN_WEIGHT_UNIT.LB;
  // Up to 2 decimals, trailing zeros trimmed (Number() drops them)
  return `${Number((grams / gramsPerUnit).toFixed(2))} ${unit}`;
}

/** Canonical score → display string ("12:34", "CAP+187", "245 reps", "8+12", "135 lb", "42 pts"). */
export function formatScore({
  score,
  workout,
  weightUnit = OPEN_WEIGHT_UNIT.LB,
}: {
  score: StoredScore;
  workout: ScoreWorkout;
  weightUnit?: string;
}): string {
  switch (workout.scoreType) {
    case OPEN_SCORE_TYPE.TIME:
      return score.capped ? `CAP+${score.value}` : formatTime(score.value);
    case OPEN_SCORE_TYPE.ROUNDS_REPS:
      return workout.repsPerRound
        ? `${Math.floor(score.value / workout.repsPerRound)}+${score.value % workout.repsPerRound}`
        : `${score.value} reps`;
    case OPEN_SCORE_TYPE.LOAD:
      return formatLoad({ grams: score.value, weightUnit });
    case OPEN_SCORE_TYPE.POINTS:
      return `${score.value} pts`;
    case OPEN_SCORE_TYPE.REPS:
    default:
      return `${score.value} reps`;
  }
}

/**
 * Negative when `a` ranks better than `b`.
 * scaling rank asc → (time) finished before capped → finished time asc / capped reps desc /
 * other types value desc → tiebreak asc (missing tiebreak last).
 */
export function compareScores({
  a,
  b,
  workout,
}: {
  a: RankableScore;
  b: RankableScore;
  workout: ScoreWorkout;
}): number {
  if (a.scalingRank !== b.scalingRank) return a.scalingRank - b.scalingRank;

  if (workout.scoreType === OPEN_SCORE_TYPE.TIME) {
    if (a.capped !== b.capped) return a.capped ? 1 : -1;
    const byValue = a.capped ? b.value - a.value : a.value - b.value;
    if (byValue !== 0) return byValue;
  } else if (a.value !== b.value) {
    return b.value - a.value;
  }

  if (a.tiebreakMs === b.tiebreakMs) return 0;
  if (a.tiebreakMs === null) return 1;
  if (b.tiebreakMs === null) return -1;
  return a.tiebreakMs - b.tiebreakMs;
}

/** Sorts best-first and assigns competition ranks (ties share a rank: 1, 2, 2, 4). */
export function rankScores<T extends RankableScore>({
  scores,
  workout,
}: {
  scores: readonly T[];
  workout: ScoreWorkout;
}): (T & { rank: number })[] {
  const sorted = [...scores].sort((a, b) => compareScores({ a, b, workout }));
  const ranked: (T & { rank: number })[] = [];
  sorted.forEach((score, index) => {
    const previous = ranked[index - 1];
    const isTie = previous && compareScores({ a: previous, b: score, workout }) === 0;
    ranked.push({ ...score, rank: isTie ? previous.rank : index + 1 });
  });
  return ranked;
}
