// Plain module: coach photo lookup for public Open pages.
import { coaches } from "@/constants/coaches";
import { toSlug } from "@/utils/slug";

const photoBySlug = new Map(coaches.map((coach) => [toSlug(coach.name), coach.image]));

/**
 * Photo path for a coach (by `coach.slug`), or null → render an initials fallback.
 * Coach photos currently live only in `src/constants/coaches.ts` (matched by `toSlug(name)`).
 * This is the single swap point: if `coach.imagePath` is added to the DB later, read it here.
 */
export function getCoachPhoto({ slug }: { slug: string }): string | null {
  return photoBySlug.get(slug) ?? null;
}
