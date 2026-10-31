import "server-only";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { ZSAError } from "zsa";
import { sniffTeamPhotoType, TEAM_PHOTO_SNIFF_BYTES, validateTeamPhoto, type TeamPhotoExt } from "@/lib/open/team-photo";

/** Objects are written once per key (fresh random segment per upload), so they can be cached forever. */
export const OPEN_MEDIA_CACHE_CONTROL = "public, max-age=31536000, immutable";

export function getOpenMedia(): R2Bucket {
  const bucket = getCloudflareContext().env.OPEN_MEDIA;
  if (!bucket) throw new Error("OPEN_MEDIA R2 bucket not bound");
  return bucket;
}

/** Best-effort delete: an orphaned object is harmless, so failures are logged, not thrown. */
export async function deleteOpenMedia(key: string) {
  try {
    await getOpenMedia().delete(key);
  } catch (error) {
    console.error(`[open] failed to delete media object ${key}`, error);
  }
}

/** Best-effort delete of every non-null key (e.g. team photos after a team/event delete). */
export async function deleteOpenMediaKeys(keys: (string | null)[]) {
  await Promise.all(keys.filter((key): key is string => Boolean(key)).map(deleteOpenMedia));
}

/**
 * Validates an uploaded image (declared type + size, then magic bytes) and writes it to a fresh,
 * immutable key from `keyFor`. Returns the key; the caller points a row at it.
 */
export async function putOpenImage({ file, keyFor }: { file: File; keyFor: (ext: TeamPhotoExt) => string }): Promise<string> {
  const validation = validateTeamPhoto({ contentType: file.type, size: file.size });
  if (!validation.ok) throw new ZSAError("INPUT_PARSE_ERROR", validation.message);
  const head = new Uint8Array(await file.slice(0, TEAM_PHOTO_SNIFF_BYTES).arrayBuffer());
  if (sniffTeamPhotoType(head) !== validation.contentType) {
    throw new ZSAError("INPUT_PARSE_ERROR", "That file doesn't look like a JPEG, PNG, or WebP image");
  }

  const key = keyFor(validation.ext);
  // A Blob has a known length, so R2 streams it without us buffering the whole file
  await getOpenMedia().put(key, file, {
    httpMetadata: { contentType: validation.contentType, cacheControl: OPEN_MEDIA_CACHE_CONTROL },
  });
  return key;
}
