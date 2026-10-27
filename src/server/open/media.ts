import "server-only";
import { getCloudflareContext } from "@opennextjs/cloudflare";

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
