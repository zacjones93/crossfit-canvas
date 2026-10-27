import { z } from "zod";
import { resolveEventSlug } from "@/lib/open/event-slug";
import {
  OPEN_SCORE_TYPE,
  openEventStatusTuple,
  openRuleCadenceTuple,
  openScoreTypeTuple,
  openWeightUnitTuple,
} from "@/lib/open/constants";

// Shared by Open server actions (src/actions/open) and, later, their forms.

const id = z.string().min(1);
const name = z.string().trim().min(1, "Name is required").max(255);
const optionalText = z.string().trim().max(5000).nullish();
const slug = z
  .string()
  .trim()
  .min(1)
  .max(255)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and dashes");
/** Event slugs also become `/open/<slug>`; some segments are taken by static routes. */
const eventSlug = slug.superRefine((value, ctx) => {
  const result = resolveEventSlug({ slug: value });
  if (!result.ok) ctx.addIssue({ code: z.ZodIssueCode.custom, message: result.message });
});
const sortOrder = z.number().int().min(-10_000).max(10_000);
const MAX_WEEKS = 52;
/**
 * Max list size for bulk inputs (roster lines, grid entryIds, team assignments). Assumes the
 * Workers Paid plan: 1000 D1 queries per invocation, where each statement in a `db.batch` counts
 * (Free allows 50). Statement math, worst case: a 1000-name roster import ≈ 90 participant + 100
 * entry + 290 audit inserts (multi-row, ≤ 90 bound params each) ≈ 480; a bulk award toggle
 * costs 2 statements per removed award (conditional audit + guarded delete) + ~2 per 7 added awards.
 * `runOpenBatch` refuses batches over MAX_BATCH_STATEMENTS as a backstop.
 */
const MAX_BULK = 1000;

// --- events -----------------------------------------------------------------

export const createOpenEventSchema = z.object({
  name,
  slug: eventSlug.optional(),
  year: z.number().int().min(2000).max(2100),
  weightUnit: z.enum(openWeightUnitTuple).optional(),
  weekCount: z.number().int().min(0).max(MAX_WEEKS).default(0),
});

export const updateOpenEventSchema = z.object({
  eventId: id,
  name: name.optional(),
  slug: eventSlug.optional(),
  year: z.number().int().min(2000).max(2100).optional(),
  status: z.enum(openEventStatusTuple).optional(),
  weightUnit: z.enum(openWeightUnitTuple).optional(),
  showIndividuals: z.boolean().optional(),
  coachPointsEnabled: z.boolean().optional(),
  coachScoresEnabled: z.boolean().optional(),
});

export const openEventIdSchema = z.object({ eventId: id });

// --- weeks ------------------------------------------------------------------

export const createOpenWeekSchema = z.object({
  eventId: id,
  number: z.number().int().min(1).max(MAX_WEEKS).optional(),
  label: z.string().trim().min(1).max(255).optional(),
  startsAt: z.coerce.date().nullish(),
});

export const updateOpenWeekSchema = z.object({
  weekId: id,
  number: z.number().int().min(1).max(MAX_WEEKS).optional(),
  label: z.string().trim().min(1).max(255).optional(),
  startsAt: z.coerce.date().nullish(),
});

export const openWeekIdSchema = z.object({ weekId: id });

// --- teams ------------------------------------------------------------------

const color = z.string().trim().max(50).nullish();

export const createOpenTeamSchema = z.object({
  eventId: id,
  name,
  slug: slug.optional(),
  color,
  sortOrder: sortOrder.optional(),
});

export const updateOpenTeamSchema = z.object({
  teamId: id,
  name: name.optional(),
  slug: slug.optional(),
  color,
  sortOrder: sortOrder.optional(),
});

export const openTeamIdSchema = z.object({ teamId: id });

export const openTeamCoachSchema = z.object({ teamId: id, coachId: id });

// --- team profiles (admin or the team's coach) -------------------------------

export const OPEN_TEAM_MOTTO_MAX = 140;
/** Blank clears the field. */
const blankToNull = (value: string | null | undefined) => (value === "" ? null : value);

export const updateTeamProfileSchema = z.object({
  eventId: id,
  teamId: id,
  motto: z.string().trim().max(OPEN_TEAM_MOTTO_MAX, `Keep the motto to ${OPEN_TEAM_MOTTO_MAX} characters`).nullish().transform(blankToNull),
  description: optionalText.transform(blankToNull),
});

export const openTeamProfileRefSchema = z.object({ eventId: id, teamId: id });

/** Multipart fields of POST /api/open/team-photo; file type/size/contents are checked by `uploadTeamPhoto`. */
export const uploadTeamPhotoSchema = openTeamProfileRefSchema.extend({
  file: z.instanceof(File, { message: "Choose a photo to upload" }),
});

// --- rules ------------------------------------------------------------------

const points = z.number().int().min(-1000).max(1000);

export const createOpenRuleSchema = z.object({
  eventId: id,
  name,
  description: optionalText,
  points,
  cadence: z.enum(openRuleCadenceTuple),
  coachAwardable: z.boolean().default(true),
  sortOrder: sortOrder.optional(),
  isActive: z.boolean().default(true),
});

export const updateOpenRuleSchema = z.object({
  ruleId: id,
  name: name.optional(),
  description: optionalText,
  points: points.optional(),
  cadence: z.enum(openRuleCadenceTuple).optional(),
  coachAwardable: z.boolean().optional(),
  sortOrder: sortOrder.optional(),
  isActive: z.boolean().optional(),
});

export const openRuleIdSchema = z.object({ ruleId: id });

// --- scalings ---------------------------------------------------------------

const rank = z.number().int().min(0).max(1000);

export const createOpenScalingSchema = z.object({
  eventId: id,
  name,
  slug: slug.optional(),
  rank,
});

export const updateOpenScalingSchema = z.object({
  scalingId: id,
  name: name.optional(),
  slug: slug.optional(),
  rank: rank.optional(),
});

export const openScalingIdSchema = z.object({ scalingId: id });

// --- workouts ---------------------------------------------------------------

const timeCapSeconds = z.number().int().min(1).max(24 * 60 * 60).nullish();
const repsPerRound = z.number().int().min(1).max(10_000).nullish();

const workoutFields = {
  weekId: id.nullish(),
  name,
  slug: slug.optional(),
  description: optionalText,
  scoreType: z.enum(openScoreTypeTuple),
  timeCapSeconds,
  repsPerRound,
  hasTiebreak: z.boolean().default(false),
  sortOrder: sortOrder.optional(),
};

export const createOpenWorkoutSchema = z.object({ eventId: id, ...workoutFields }).superRefine((value, ctx) => {
  if (value.scoreType === OPEN_SCORE_TYPE.ROUNDS_REPS && !value.repsPerRound) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["repsPerRound"], message: "Rounds + reps workouts need reps per round" });
  }
});

export const updateOpenWorkoutSchema = z.object({
  workoutId: id,
  weekId: id.nullish(),
  name: name.optional(),
  slug: slug.optional(),
  description: optionalText,
  scoreType: z.enum(openScoreTypeTuple).optional(),
  timeCapSeconds,
  repsPerRound,
  hasTiebreak: z.boolean().optional(),
  sortOrder: sortOrder.optional(),
});

export const openWorkoutIdSchema = z.object({ workoutId: id });

// --- roster -----------------------------------------------------------------

export const importRosterSchema = z.object({
  eventId: id,
  text: z.string().max(200_000),
  teamId: id.nullish(),
});

export const updateOpenEntrySchema = z.object({
  entryId: id,
  name: name.optional(),
  email: z.string().trim().toLowerCase().email().max(255).nullish().or(z.literal("").transform(() => null)),
  division: z.string().trim().max(100).nullish(),
  teamId: id.nullish(),
});

export const bulkAssignTeamsSchema = z.object({
  eventId: id,
  assignments: z.array(z.object({ entryId: id, teamId: id.nullable() })).min(1).max(MAX_BULK),
});

export const removeOpenEntrySchema = z.object({
  entryId: id,
  force: z.boolean().default(false),
});

// --- coach link -------------------------------------------------------------

export const linkCoachUserSchema = z.object({ coachId: id, userId: id.nullable() });

export const searchUsersSchema = z.object({ query: z.string().trim().min(1).max(100) });

// --- awards -----------------------------------------------------------------

const note = z.string().trim().max(1000).nullish();

export const setAwardSchema = z.object({
  eventId: id,
  entryId: id,
  ruleId: id,
  weekId: id.nullish(),
  awarded: z.boolean(),
  note,
});

/** Bulk toggle: applies `awarded` to exactly `entryIds` (the grid's visible athletes). */
export const setAwardsForEntriesSchema = z.object({
  eventId: id,
  ruleId: id,
  weekId: id.nullish(),
  entryIds: z.array(id).min(1).max(MAX_BULK),
  awarded: z.boolean(),
});

export const addUnlimitedAwardSchema = z.object({
  eventId: id,
  entryId: id,
  ruleId: id,
  weekId: id.nullish(),
  note,
});

export const removeAwardSchema = z.object({ eventId: id, awardId: id });

// --- scores -----------------------------------------------------------------

export const setScoreSchema = z.object({
  eventId: id,
  entryId: id,
  workoutId: id,
  scalingId: id,
  input: z.string().trim().min(1, "Enter a score").max(50),
  capped: z.boolean().optional(),
  /** Tiebreak time as "m:ss" (parsed with the score codec). */
  tiebreak: z.string().trim().max(20).nullish(),
  note,
});

export const clearScoreSchema = z.object({ eventId: id, entryId: id, workoutId: id });
