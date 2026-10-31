import "server-only";
import { createId } from "@paralleldrive/cuid2";
import { eq, isNull } from "drizzle-orm";
import { getDB } from "@/db";
import { openEventTable } from "@/db/schema";
import { OPEN_AUDIT_ENTITY } from "@/lib/open/constants";
import { eventBannerKey } from "@/lib/open/team-photo";
import { deleteOpenMedia, putOpenImage } from "./media";
import { auditedUpdate, CHANGED_BY_SOMEONE_ELSE, loadEvent, revalidateOpenEvent } from "./write";

type EventRow = typeof openEventTable.$inferSelect;

/** Points the event at `bannerKey` (audited); fails with CONFLICT if the banner changed since `event` was loaded. */
function setBannerKey({ event, bannerKey, actorUserId, summary }: { event: EventRow; bannerKey: string | null; actorUserId: string; summary: string }) {
  return auditedUpdate({
    db: getDB(),
    table: openEventTable,
    entityType: OPEN_AUDIT_ENTITY.EVENT,
    eventId: event.id,
    actorUserId,
    row: event,
    updates: { bannerKey },
    describe: () => summary,
    guard: () => ({
      condition: event.bannerKey === null ? isNull(openEventTable.bannerKey) : eq(openEventTable.bannerKey, event.bannerKey),
      message: CHANGED_BY_SOMEONE_ELSE,
    }),
  });
}

/**
 * Admin only (the caller checks). Same lifecycle as team photos: write a fresh immutable object, point the
 * event at it, then delete the previous object; if the DB write didn't land, the new object is removed.
 */
export async function uploadEventBanner({ actorUserId, eventId, file }: { actorUserId: string; eventId: string; file: File }): Promise<EventRow> {
  const db = getDB();
  const event = await loadEvent({ db, eventId });
  const bannerKey = await putOpenImage({ file, keyFor: (ext) => eventBannerKey({ eventId, ext, random: createId() }) });

  let row: EventRow;
  try {
    ({ row } = await setBannerKey({ event, bannerKey, actorUserId, summary: `${event.bannerKey ? "Replaced" : "Added"} the event banner` }));
  } catch (error) {
    const current = await db.query.openEventTable
      .findFirst({ where: eq(openEventTable.id, eventId), columns: { bannerKey: true } })
      .catch(() => undefined);
    if (current && current.bannerKey !== bannerKey) await deleteOpenMedia(bannerKey);
    throw error;
  }

  if (event.bannerKey) await deleteOpenMedia(event.bannerKey);
  revalidateOpenEvent({ eventId });
  return row;
}

/** Clears the banner (audited, guarded), then deletes the object. No banner → no-op. */
export async function removeEventBanner({ actorUserId, eventId }: { actorUserId: string; eventId: string }): Promise<EventRow> {
  const event = await loadEvent({ db: getDB(), eventId });
  if (!event.bannerKey) return event;
  const { row } = await setBannerKey({ event, bannerKey: null, actorUserId, summary: "Removed the event banner" });
  await deleteOpenMedia(event.bannerKey);
  revalidateOpenEvent({ eventId });
  return row;
}
