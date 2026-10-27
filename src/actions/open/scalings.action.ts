"use server";

import { createServerAction, ZSAError } from "zsa";
import { eq } from "drizzle-orm";
import { getDB } from "@/db";
import { newOpenId, openScalingTable } from "@/db/schema";
import { OPEN_AUDIT_ENTITY, OPEN_AUDIT_VERB } from "@/lib/open/constants";
import { createOpenScalingSchema, openScalingIdSchema, updateOpenScalingSchema } from "@/schemas/open.schema";
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
import { toSlug } from "@/utils/slug";

const SLUG_TAKEN = "A scaling with that slug already exists in this event";

function loadScaling({ db, scalingId }: { db: OpenDB; scalingId: string }) {
  return orNotFound({
    row: db.query.openScalingTable.findFirst({ where: eq(openScalingTable.id, scalingId) }),
    label: "Scaling",
  });
}

export const createOpenScalingAction = createServerAction()
  .input(createOpenScalingSchema)
  .handler(async ({ input }) => {
    const session = await requireOpenAdmin();
    const db = getDB();
    const { eventId } = input;

    await loadEvent({ db, eventId });
    const slug = input.slug ?? toSlug(input.name);
    if (!slug) throw new ZSAError("INPUT_PARSE_ERROR", "Name must contain letters or numbers");

    const scaling = { id: newOpenId.scaling(), eventId, name: input.name, slug, rank: input.rank };

    await runOpenBatch({
      db,
      statements: [
        db.insert(openScalingTable).values(scaling),
        auditStatement({
          db,
          eventId,
          actorUserId: session.userId,
          verb: OPEN_AUDIT_VERB.CREATE,
          entityType: OPEN_AUDIT_ENTITY.SCALING,
          entityId: scaling.id,
          after: scaling,
          summary: `Created scaling "${scaling.name}"`,
        }),
      ],
      messages: { unique: SLUG_TAKEN },
    });

    revalidateOpenEvent({ eventId });
    return scaling;
  });

export const updateOpenScalingAction = createServerAction()
  .input(updateOpenScalingSchema)
  .handler(async ({ input }) => {
    const session = await requireOpenAdmin();
    const db = getDB();
    const { scalingId, ...updates } = input;

    const scaling = await loadScaling({ db, scalingId });
    const { row, changed } = await auditedUpdate({
      db,
      table: openScalingTable,
      entityType: OPEN_AUDIT_ENTITY.SCALING,
      eventId: scaling.eventId,
      actorUserId: session.userId,
      row: scaling,
      updates,
      describe: ({ after, changedKeys }) => `Updated scaling "${after.name}" (${changedKeys.join(", ")})`,
      messages: { unique: SLUG_TAKEN },
    });

    if (changed) revalidateOpenEvent({ eventId: scaling.eventId });
    return row;
  });

/** Fails while scores use the scaling. */
export const deleteOpenScalingAction = createServerAction()
  .input(openScalingIdSchema)
  .handler(async ({ input }) => {
    const session = await requireOpenAdmin();
    const db = getDB();
    const scaling = await loadScaling({ db, scalingId: input.scalingId });

    await auditedDelete({
      db,
      table: openScalingTable,
      entityType: OPEN_AUDIT_ENTITY.SCALING,
      eventId: scaling.eventId,
      actorUserId: session.userId,
      row: scaling,
      summary: `Deleted scaling "${scaling.name}"`,
      messages: { foreignKey: `Scores are recorded as "${scaling.name}"; change or clear them before deleting it` },
    });

    revalidateOpenEvent({ eventId: scaling.eventId });
    return { success: true };
  });
