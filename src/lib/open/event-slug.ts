// Plain module: the one owner of event slug rules (derivation + reserved segments).
import { toSlug } from "@/utils/slug";

/**
 * Event slugs that would collide with static segments under `/open/` (e.g. `/open/media/...`
 * beats `/open/[slug]`).
 */
export const RESERVED_OPEN_EVENT_SLUGS: readonly string[] = ["media"];

export const RESERVED_SLUG_MESSAGE = "That slug is reserved; pick another";
const EMPTY_SLUG_MESSAGE = "Name must contain letters or numbers";

export type EventSlugResult = { ok: true; slug: string } | { ok: false; message: string };

/** The explicit slug, else one derived from `name`; rejects empty and reserved slugs. */
export function resolveEventSlug({ slug, name = "" }: { slug?: string; name?: string }): EventSlugResult {
  const resolved = slug ?? toSlug(name);
  if (!resolved) return { ok: false, message: EMPTY_SLUG_MESSAGE };
  if (RESERVED_OPEN_EVENT_SLUGS.includes(resolved)) return { ok: false, message: RESERVED_SLUG_MESSAGE };
  return { ok: true, slug: resolved };
}
