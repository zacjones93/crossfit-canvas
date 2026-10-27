"use server";

import { createServerAction, ZSAError } from "zsa";
import { count, eq, max, notExists } from "drizzle-orm";
import { getDB } from "@/db";
import { newOpenId, openWeekTable, openWorkoutTable } from "@/db/schema";
import { OPEN_AUDIT_ENTITY, OPEN_AUDIT_VERB } from "@/lib/open/constants";
import { createOpenWeekSchema, openWeekIdSchema, updateOpenWeekSchema } from "@/schemas/open.schema";
import { auditStatement } from "@/server/open/audit-write";
import {
  auditedDelete,
  auditedUpdate,
  loadEvent,
  orNotFound,
  requireOpenAdmin,
  revalidateOpenEvent,
  runOpenBatch,
  type OpenDB,
} from "@/server/open/write";

type WeekRow = typeof openWeekTable.$inferSelect;

function weekNumberTaken(number: number) {
  return `Week ${number} already exists in this event`;
}

function loadWeek({ db, weekId }: { db: OpenDB; weekId: string }) {
  return orNotFound({ row: db.query.openWeekTable.findFirst({ where: eq(openWeekTable.id, weekId) }), label: "Week" });
}

export const createOpenWeekAction = createServerAction()
  .input(createOpenWeekSchema)
  .handler(async ({ input }) => {
    const session = await requireOpenAdmin();
    const db = getDB();
    const { eventId } = input;

    await loadEvent({ db, eventId });
    const [{ maxNumber }] = await db
      .select({ maxNumber: max(openWeekTable.number) })
      .from(openWeekTable)
      .where(eq(openWeekTable.eventId, eventId));

    const number = input.number ?? (maxNumber ?? 0) + 1;
    const week = {
      id: newOpenId.week(),
      eventId,
      number,
      label: input.label ?? `Week ${number}`,
      startsAt: input.startsAt ?? null,
    };

    await runOpenBatch({
      db,
      statements: [
        db.insert(openWeekTable).values(week),
        auditStatement({
          db,
          eventId,
          actorUserId: session.userId,
          verb: OPEN_AUDIT_VERB.CREATE,
          entityType: OPEN_AUDIT_ENTITY.WEEK,
          entityId: week.id,
          after: week,
          summary: `Created ${week.label}`,
        }),
      ],
      messages: { unique: weekNumberTaken(number) },
    });

    revalidateOpenEvent({ eventId });
    return week;
  });

async function updateWeek({
  weekId,
  actorUserId,
  buildUpdates,
  describe,
}: {
  weekId: string;
  actorUserId: string;
  buildUpdates: (week: WeekRow) => Partial<WeekRow>;
  describe: (args: { label: string; changedKeys: string[] }) => string;
}) {
  const db = getDB();
  const week = await loadWeek({ db, weekId });
  const updates = buildUpdates(week);
  const { row, changed } = await auditedUpdate({
    db,
    table: openWeekTable,
    entityType: OPEN_AUDIT_ENTITY.WEEK,
    eventId: week.eventId,
    actorUserId,
    row: week,
    updates,
    describe: ({ after, changedKeys }) => describe({ label: after.label, changedKeys }),
    messages: { unique: weekNumberTaken(updates.number ?? week.number) },
  });
  if (changed) revalidateOpenEvent({ eventId: week.eventId });
  return row;
}

export const updateOpenWeekAction = createServerAction()
  .input(updateOpenWeekSchema)
  .handler(async ({ input }) => {
    const session = await requireOpenAdmin();
    const { weekId, ...updates } = input;
    return updateWeek({
      weekId,
      actorUserId: session.userId,
      buildUpdates: () => updates,
      describe: ({ label, changedKeys }) => `Updated ${label} (${changedKeys.join(", ")})`,
    });
  });

/** Locks coach edits for the week (admins are unaffected). Idempotent. */
export const lockOpenWeekAction = createServerAction()
  .input(openWeekIdSchema)
  .handler(async ({ input }) => {
    const session = await requireOpenAdmin();
    return updateWeek({
      weekId: input.weekId,
      actorUserId: session.userId,
      buildUpdates: (week) => ({ lockedAt: week.lockedAt ?? new Date() }),
      describe: ({ label }) => `Locked ${label}`,
    });
  });

export const unlockOpenWeekAction = createServerAction()
  .input(openWeekIdSchema)
  .handler(async ({ input }) => {
    const session = await requireOpenAdmin();
    return updateWeek({
      weekId: input.weekId,
      actorUserId: session.userId,
      buildUpdates: () => ({ lockedAt: null }),
      describe: ({ label }) => `Unlocked ${label}`,
    });
  });

/** Refused while the week has workouts (would silently lose their week) or awards (FK). */
export const deleteOpenWeekAction = createServerAction()
  .input(openWeekIdSchema)
  .handler(async ({ input }) => {
    const session = await requireOpenAdmin();
    const db = getDB();
    const week = await loadWeek({ db, weekId: input.weekId });
    const hasWorkouts = `${week.label} has workouts; move or delete this week's workouts first`;

    const [{ workoutCount }] = await db
      .select({ workoutCount: count() })
      .from(openWorkoutTable)
      .where(eq(openWorkoutTable.weekId, week.id));
    if (workoutCount > 0) throw new ZSAError("PRECONDITION_FAILED", hasWorkouts);

    await auditedDelete({
      db,
      table: openWeekTable,
      entityType: OPEN_AUDIT_ENTITY.WEEK,
      eventId: week.eventId,
      actorUserId: session.userId,
      row: week,
      summary: `Deleted ${week.label}`,
      // Re-checked inside the batch so a workout added meanwhile isn't silently un-weeked
      guard: {
        condition: notExists(db.select({ id: openWorkoutTable.id }).from(openWorkoutTable).where(eq(openWorkoutTable.weekId, week.id))),
        message: hasWorkouts,
        code: "PRECONDITION_FAILED",
      },
      messages: { foreignKey: `${week.label} has awards; remove them before deleting the week` },
    });

    revalidateOpenEvent({ eventId: week.eventId });
    return { success: true };
  });
