"use server";

import { createServerAction, ZSAError } from "zsa";
import { and, eq } from "drizzle-orm";
import { getDB } from "@/db";
import { newOpenId, openScoreTable } from "@/db/schema";
import { diffRow } from "@/lib/open/audit";
import { OPEN_AUDIT_ENTITY, OPEN_AUDIT_VERB } from "@/lib/open/constants";
import { MANAGE_KIND } from "@/lib/open/permissions";
import { formatScore, parseScore, parseTime } from "@/lib/open/score-codec";
import { clearScoreSchema, setScoreSchema } from "@/schemas/open.schema";
import { auditStatement } from "@/server/open/audit-write";
import { assertCanManageEntry } from "@/server/open/permissions";
import {
  auditedDelete,
  auditedUpdate,
  CHANGED_BY_SOMEONE_ELSE,
  requireOpenSession,
  revalidateOpenEvent,
  runOpenBatch,
  unchangedSince,
} from "@/server/open/write";

/** Parses `input` with the score codec (event weight unit) and upserts the athlete's score for the workout. */
export const setScoreAction = createServerAction()
  .input(setScoreSchema)
  .handler(async ({ input }) => {
    const session = await requireOpenSession();
    const db = getDB();
    const { eventId, entryId, workoutId, scalingId } = input;

    const context = await assertCanManageEntry({ session, eventId, entryId, kind: MANAGE_KIND.SCORES, workoutId, scalingId });
    const workout = context.workout!;
    const scaling = context.scaling!;
    const weightUnit = context.event.weightUnit;

    const parsed = parseScore({ input: input.input, workout, capped: input.capped, weightUnit });
    if (!parsed.ok) throw new ZSAError("INPUT_PARSE_ERROR", parsed.error);

    let tiebreakMs: number | null = null;
    if (input.tiebreak) {
      if (!workout.hasTiebreak) throw new ZSAError("INPUT_PARSE_ERROR", `"${workout.name}" has no tiebreak`);
      const tiebreak = parseTime(input.tiebreak);
      if (!tiebreak.ok) throw new ZSAError("INPUT_PARSE_ERROR", `Tiebreak: ${tiebreak.error}`);
      tiebreakMs = tiebreak.value;
    }

    // A full replace: omitted tiebreak/note clear the stored ones
    const values = { scalingId, value: parsed.value, capped: parsed.capped, tiebreakMs, note: input.note ?? null };
    const display = `${formatScore({ score: parsed, workout, weightUnit })} (${scaling.name})`;
    const athlete = context.entry.participant.name;

    const existing = await db.query.openScoreTable.findFirst({
      where: and(eq(openScoreTable.entryId, entryId), eq(openScoreTable.workoutId, workoutId)),
    });

    if (existing) {
      // Re-saving the same score (even by someone else) is a no-op, not a change of enteredBy
      if (diffRow({ before: existing, updates: values }).changedKeys.length === 0) return existing;
      const { row, changed } = await auditedUpdate({
        db,
        table: openScoreTable,
        entityType: OPEN_AUDIT_ENTITY.SCORE,
        eventId,
        actorUserId: session.userId,
        row: existing,
        updates: { ...values, enteredByUserId: session.userId },
        describe: () => `Updated ${athlete}'s ${workout.name} score to ${display}`,
        guard: () => unchangedSince({ table: openScoreTable, updateCounter: existing.updateCounter }),
      });
      if (changed) revalidateOpenEvent({ eventId });
      return row;
    }

    const score = { id: newOpenId.score(), entryId, workoutId, ...values, enteredByUserId: session.userId };
    await runOpenBatch({
      db,
      statements: [
        db.insert(openScoreTable).values(score),
        auditStatement({
          db,
          eventId,
          actorUserId: session.userId,
          verb: OPEN_AUDIT_VERB.CREATE,
          entityType: OPEN_AUDIT_ENTITY.SCORE,
          entityId: score.id,
          after: score,
          summary: `Entered ${athlete}'s ${workout.name} score: ${display}`,
        }),
      ],
      messages: { unique: CHANGED_BY_SOMEONE_ELSE },
    });
    revalidateOpenEvent({ eventId });
    return score;
  });

/** Idempotent: clearing a score that doesn't exist (or was just cleared) is a no-op. */
export const clearScoreAction = createServerAction()
  .input(clearScoreSchema)
  .handler(async ({ input }) => {
    const session = await requireOpenSession();
    const db = getDB();
    const { eventId, entryId, workoutId } = input;

    const context = await assertCanManageEntry({ session, eventId, entryId, kind: MANAGE_KIND.SCORES, workoutId });
    const existing = await db.query.openScoreTable.findFirst({
      where: and(eq(openScoreTable.entryId, entryId), eq(openScoreTable.workoutId, workoutId)),
    });
    if (!existing) return { changed: false };

    const { deleted } = await auditedDelete({
      db,
      table: openScoreTable,
      entityType: OPEN_AUDIT_ENTITY.SCORE,
      eventId,
      actorUserId: session.userId,
      row: existing,
      summary: `Cleared ${context.entry.participant.name}'s ${context.workout!.name} score`,
    });

    if (deleted) revalidateOpenEvent({ eventId });
    return { changed: deleted };
  });
