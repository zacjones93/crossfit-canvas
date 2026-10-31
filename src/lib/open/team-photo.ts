// Plain module (no DB / server-only imports): image upload validation, R2 key layout (team photos,
// event banners), and public URL.
// Keys are never overwritten (each upload gets a fresh random segment), so served objects can be
// cached as immutable.

export const TEAM_PHOTO_MAX_BYTES = 5 * 1024 * 1024;
/** Upload request body cap (Content-Length): the photo plus multipart boundaries and the id fields. */
export const TEAM_PHOTO_MAX_REQUEST_BYTES = TEAM_PHOTO_MAX_BYTES + 64 * 1024;
/** Leading bytes needed by `sniffTeamPhotoType`. */
export const TEAM_PHOTO_SNIFF_BYTES = 12;

/** Accepted content types → file extension. */
export const TEAM_PHOTO_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

export type TeamPhotoContentType = keyof typeof TEAM_PHOTO_TYPES;
export type TeamPhotoExt = (typeof TEAM_PHOTO_TYPES)[TeamPhotoContentType];

/** Every object in OPEN_MEDIA lives under this prefix; the media route serves nothing else. */
export const OPEN_MEDIA_PREFIX = "open/";
export const OPEN_MEDIA_ROUTE = "/open/media";

export type TeamPhotoValidation =
  | { ok: true; contentType: TeamPhotoContentType; ext: TeamPhotoExt }
  | { ok: false; message: string };

function isTeamPhotoContentType(contentType: string): contentType is TeamPhotoContentType {
  return Object.hasOwn(TEAM_PHOTO_TYPES, contentType);
}

export function validateTeamPhoto({ contentType, size }: { contentType: string; size: number }): TeamPhotoValidation {
  const normalized = contentType.split(";")[0].trim().toLowerCase();
  if (!isTeamPhotoContentType(normalized)) return { ok: false, message: "Upload a JPEG, PNG, or WebP image" };
  if (size <= 0) return { ok: false, message: "That file is empty" };
  if (size > TEAM_PHOTO_MAX_BYTES) return { ok: false, message: "Photos must be 5 MB or smaller" };
  return { ok: true, contentType: normalized, ext: TEAM_PHOTO_TYPES[normalized] };
}

/**
 * Content type from the file's magic bytes (null if not jpeg/png/webp). Lets the upload reject
 * files whose declared type doesn't match their contents.
 */
export function sniffTeamPhotoType(bytes: Uint8Array): TeamPhotoContentType | null {
  const startsWith = (signature: number[], offset = 0) =>
    bytes.length >= offset + signature.length && signature.every((byte, i) => bytes[offset + i] === byte);

  if (startsWith([0xff, 0xd8, 0xff])) return "image/jpeg";
  if (startsWith([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "image/png";
  // "RIFF" <size> "WEBP"
  if (startsWith([0x52, 0x49, 0x46, 0x46]) && startsWith([0x57, 0x45, 0x42, 0x50], 8)) return "image/webp";
  return null;
}

/** `open/teams/<teamId>/<random>.<ext>` — `random` must be fresh per upload (keys are immutable). */
export function teamPhotoKey({ teamId, ext, random }: { teamId: string; ext: TeamPhotoExt; random: string }): string {
  return `${OPEN_MEDIA_PREFIX}teams/${teamId}/${random}.${ext}`;
}

/** `open/events/<eventId>/<random>.<ext>` — the event's banner; `random` fresh per upload. */
export function eventBannerKey({ eventId, ext, random }: { eventId: string; ext: TeamPhotoExt; random: string }): string {
  return `${OPEN_MEDIA_PREFIX}events/${eventId}/${random}.${ext}`;
}

const SAFE_SEGMENT = /^[A-Za-z0-9_-][A-Za-z0-9._-]*$/;

/** Only keys under `open/` made of plain segments (no `..`, empty, or odd characters) are servable. */
export function isServableMediaKey(key: string): boolean {
  if (!key.startsWith(OPEN_MEDIA_PREFIX)) return false;
  return key.split("/").every((segment) => SAFE_SEGMENT.test(segment) && !segment.includes(".."));
}

/** Public URL for a stored media key (team photo, event banner), or null when there's none. */
export function teamPhotoUrl(photoKey: string | null | undefined): string | null {
  return photoKey ? `${OPEN_MEDIA_ROUTE}/${photoKey}` : null;
}
