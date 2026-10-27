import "server-only";
import { createId } from "@paralleldrive/cuid2";
import { eq, isNull } from "drizzle-orm";
import { ZSAError } from "zsa";
import { getDB } from "@/db";
import { openTeamTable } from "@/db/schema";
import { OPEN_AUDIT_ENTITY } from "@/lib/open/constants";
import { sniffTeamPhotoType, TEAM_PHOTO_SNIFF_BYTES, teamPhotoKey, validateTeamPhoto } from "@/lib/open/team-photo";
import { deleteOpenMedia, getOpenMedia, OPEN_MEDIA_CACHE_CONTROL } from "./media";
import { assertCanManageTeam, type OpenActorSession } from "./permissions";
import { auditedUpdate, CHANGED_BY_SOMEONE_ELSE, revalidateOpenEvent, type WriteGuard } from "./write";

type TeamRow = typeof openTeamTable.$inferSelect;

/** The photo hasn't changed since we loaded the team (two uploads racing would orphan an object). */
function photoUnchanged(team: TeamRow): WriteGuard {
  return {
    condition: team.photoKey === null ? isNull(openTeamTable.photoKey) : eq(openTeamTable.photoKey, team.photoKey),
    message: CHANGED_BY_SOMEONE_ELSE,
  };
}

/** Points the team at `photoKey` (audited); fails with CONFLICT if the photo changed meanwhile. */
function setPhotoKey({ team, photoKey, actorUserId, summary }: { team: TeamRow; photoKey: string | null; actorUserId: string; summary: string }) {
  return auditedUpdate({
    db: getDB(),
    table: openTeamTable,
    entityType: OPEN_AUDIT_ENTITY.TEAM,
    eventId: team.eventId,
    actorUserId,
    row: team,
    updates: { photoKey },
    describe: () => summary,
    guard: () => photoUnchanged(team),
  });
}

/**
 * Writes a new immutable R2 object, points the team at it (audited, guarded against a concurrent
 * photo change), then deletes the previous object. If the DB write fails, the new object is removed.
 * Admin or the team's coach (throws ZSAError otherwise).
 */
export async function uploadTeamPhoto({
  session,
  eventId,
  teamId,
  file,
}: {
  session: OpenActorSession;
  eventId: string;
  teamId: string;
  file: File;
}): Promise<TeamRow> {
  const team = await assertCanManageTeam({ session, eventId, teamId });

  const validation = validateTeamPhoto({ contentType: file.type, size: file.size });
  if (!validation.ok) throw new ZSAError("INPUT_PARSE_ERROR", validation.message);
  const head = new Uint8Array(await file.slice(0, TEAM_PHOTO_SNIFF_BYTES).arrayBuffer());
  if (sniffTeamPhotoType(head) !== validation.contentType) {
    throw new ZSAError("INPUT_PARSE_ERROR", "That file doesn't look like a JPEG, PNG, or WebP image");
  }

  const photoKey = teamPhotoKey({ teamId: team.id, ext: validation.ext, random: createId() });
  // A Blob has a known length, so R2 streams it without us buffering the whole file
  await getOpenMedia().put(photoKey, file, {
    httpMetadata: { contentType: validation.contentType, cacheControl: OPEN_MEDIA_CACHE_CONTROL },
  });

  let row: TeamRow;
  try {
    ({ row } = await setPhotoKey({
      team,
      photoKey,
      actorUserId: session.userId,
      summary: `${team.photoKey ? "Replaced" : "Added"} team "${team.name}" photo`,
    }));
  } catch (error) {
    // Only clean up if the write really didn't land (an ambiguous D1 failure may have committed)
    const current = await getDB()
      .query.openTeamTable.findFirst({ where: eq(openTeamTable.id, team.id), columns: { photoKey: true } })
      .catch(() => undefined);
    if (current && current.photoKey !== photoKey) await deleteOpenMedia(photoKey);
    throw error;
  }

  if (team.photoKey) await deleteOpenMedia(team.photoKey);
  revalidateOpenEvent({ eventId });
  return row;
}

/** Clears the team's photo (audited, guarded), then deletes the object. No photo → no-op. */
export async function removeTeamPhoto({
  session,
  eventId,
  teamId,
}: {
  session: OpenActorSession;
  eventId: string;
  teamId: string;
}): Promise<TeamRow> {
  const team = await assertCanManageTeam({ session, eventId, teamId });
  if (!team.photoKey) return team;

  const { row } = await setPhotoKey({
    team,
    photoKey: null,
    actorUserId: session.userId,
    summary: `Removed team "${team.name}" photo`,
  });

  await deleteOpenMedia(team.photoKey);
  revalidateOpenEvent({ eventId });
  return row;
}
