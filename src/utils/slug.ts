/**
 * Convert a name to a URL-safe slug.
 * Used for coach slugs and any name-to-slug conversion.
 */
export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}
