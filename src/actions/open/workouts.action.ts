"use server";

import { createServerAction, ZSAError } from "zsa";
import { and, count, eq, notExists } from "drizzle-orm";
import { getDB } from "@/db";
import { newOpenId, openScoreTable, openWeekTable, openWorkoutTable } from "@/db/schema";
import { OPEN_AUDIT_ENTITY, OPEN_AUDIT_VERB, OPEN_SCORE_TYPE } from "@/lib/open/constants";
import { createOpenWorkoutSchema, openWorkoutIdSchema, updateOpenWorkoutSchema } from "@/schemas/open.schema";
import { auditStatement } from "@/server/open/audit-write";
import {
  auditedUpdate,
  loadEvent,
  requireOpenAdmin,
  revalidateOpenEvent,
  runOpenBatch,
  type OpenDB,
} from "@/server/open/write";
import { toSlug } from "@/utils/slug";

const SLUG_TAKEN = "A workout with that slug already exists in this event";

/** Fields that define how stored score values are interpreted; frozen once scores exist. */
const SCORE_SHAPE_KEYS = ["scoreType", "repsPerRound", "timeCapSeconds"] as const;

async function assertWeekInEvent({ db, weekId, eventId }: { db: OpenDB; weekId: string | null | undefined; eventId: string }) {
  if (!weekId) return;
  const week = await db.query.openWeekTable.findFirst({
    where: and(eq(openWeekTable.id, weekId), eq(openWeekTable.eventId, eventId)),
    columns: { id: true },
  });
  if (!week) throw new ZSAError("NOT_FOUND", "Week not found in this event");
}

function assertRoundsRepsShape({ scoreType, repsPerRound }: { scoreType: string; repsPerRound: number | null }) {
  if (scoreType === OPEN_SCORE_TYPE.ROUNDS_REPS && !repsPerRound) {
    throw new ZSAError("INPUT_PARSE_ERROR", "Rounds + reps workouts need reps per round");
  }
}

export const createOpenWorkoutAction = createServerAction()
  .input(createOpenWorkoutSchema)
  .handler(async ({ input }) => {
    const session = await requireOpenAdmin();
    const db = getDB();
    const { eventId } = input;

    await loadEvent({ db, eventId });
    await assertWeekInEvent({ db, weekId: input.weekId, eventId });
    const slug = input.slug ?? toSlug(input.name);
    if (!slug) throw new ZSAError("INPUT_PARSE_ERROR", "Name must contain letters or numbers");

    const workout = {
      id: newOpenId.workout(),
      eventId,
      weekId: input.weekId ?? null,
      name: input.name,
      slug,
      description: input.description ?? null,
      scoreType: input.scoreType,
      timeCapSeconds: input.timeCapSeconds ?? null,
      repsPerRound: input.repsPerRound ?? null,
      hasTiebreak: input.hasTiebreak,
      sortOrder: input.sortOrder ?? 0,
    };

    await runOpenBatch({
      db,
      statements: [
        db.insert(openWorkoutTable).values(workout),
        auditStatement({
          db,
          eventId,
          actorUserId: session.userId,
          verb: OPEN_AUDIT_VERB.CREATE,
          entityType: OPEN_AUDIT_ENTITY.WORKOUT,
          entityId: workout.id,
          after: workout,
          summary: `Created workout "${workout.name}" (${workout.scoreType})`,
        }),
      ],
      messages: { unique: SLUG_TAKEN },
    });

    revalidateOpenEvent({ eventId });
    return workout;
  });

/** scoreType / repsPerRound / timeCapSeconds are frozen once the workout has scores. */
export const updateOpenWorkoutAction = createServerAction()
  .input(updateOpenWorkoutSchema)
  .handler(async ({ input }) => {
    const session = await requireOpenAdmin();
    const db = getDB();
    const { workoutId, ...updates } = input;

    const [workouts, [{ scoreCount }]] = await db.batch([
      db.select().from(openWorkoutTable).where(eq(openWorkoutTable.id, workoutId)),
      db.select({ scoreCount: count() }).from(openScoreTable).where(eq(openScoreTable.workoutId, workoutId)),
    ]);
    const workout = workouts[0];
    if (!workout) throw new ZSAError("NOT_FOUND", "Workout not found");

    const frozenMessage = (keys: string[]) =>
      `"${workout.name}" already has scores, so ${keys.join(", ")} can't change; clear its scores first`;
    const frozen = SCORE_SHAPE_KEYS.filter((key) => updates[key] !== undefined && updates[key] !== workout[key]);
    if (frozen.length > 0 && scoreCount > 0) throw new ZSAError("PRECONDITION_FAILED", frozenMessage(frozen));
    if (updates.weekId) await assertWeekInEvent({ db, weekId: updates.weekId, eventId: workout.eventId });
    assertRoundsRepsShape({
      scoreType: updates.scoreType ?? workout.scoreType,
      repsPerRound: updates.repsPerRound === undefined ? workout.repsPerRound : updates.repsPerRound,
    });

    const { row, changed } = await auditedUpdate({
      db,
      table: openWorkoutTable,
      entityType: OPEN_AUDIT_ENTITY.WORKOUT,
      eventId: workout.eventId,
      actorUserId: session.userId,
      row: workout,
      updates,
      describe: ({ after, changedKeys }) => `Updated workout "${after.name}" (${changedKeys.join(", ")})`,
      // Re-checked inside the batch: no score may land between the count and a score-shape change
      guard: ({ changes }) => {
        const keys = SCORE_SHAPE_KEYS.filter((key) => key in changes);
        return keys.length > 0
          ? {
              condition: notExists(
                db.select({ id: openScoreTable.id }).from(openScoreTable).where(eq(openScoreTable.workoutId, workoutId)),
              ),
              message: frozenMessage(keys),
              code: "PRECONDITION_FAILED",
            }
          : undefined;
      },
      messages: { unique: SLUG_TAKEN },
    });

    if (changed) revalidateOpenEvent({ eventId: workout.eventId });
    return row;
  });

/** Only workouts without scores (scores would otherwise cascade away silently). */
export const deleteOpenWorkoutAction = createServerAction()
  .input(openWorkoutIdSchema)
  .handler(async ({ input }) => {
    const session = await requireOpenAdmin();
    const db = getDB();
    const { workoutId } = input;

    const [workouts, [{ scoreCount }]] = await db.batch([
      db.select().from(openWorkoutTable).where(eq(openWorkoutTable.id, workoutId)),
      db.select({ scoreCount: count() }).from(openScoreTable).where(eq(openScoreTable.workoutId, workoutId)),
    ]);
    const workout = workouts[0];
    if (!workout) throw new ZSAError("NOT_FOUND", "Workout not found");
    if (scoreCount > 0) {
      throw new ZSAError("PRECONDITION_FAILED", `"${workout.name}" has ${scoreCount} score(s); clear them before deleting it`);
    }

    await runOpenBatch({
      db,
      statements: [
        db.delete(openWorkoutTable).where(eq(openWorkoutTable.id, workoutId)),
        auditStatement({
          db,
          eventId: workout.eventId,
          actorUserId: session.userId,
          verb: OPEN_AUDIT_VERB.DELETE,
          entityType: OPEN_AUDIT_ENTITY.WORKOUT,
          entityId: workoutId,
          before: workout,
          summary: `Deleted workout "${workout.name}"`,
        }),
      ],
    });

    revalidateOpenEvent({ eventId: workout.eventId });
    return { success: true };
  });
