import { isServableMediaKey } from "@/lib/open/team-photo";
import { getOpenMedia, OPEN_MEDIA_CACHE_CONTROL } from "@/server/open/media";

// Serves Open media (team photos) from R2. Keys are immutable (new key per upload), so responses
// are cached forever. `media` is a static segment that wins over `/open/[slug]`; the slug is
// reserved in the event slug schema.

function notFound() {
  return new Response("Not found", { status: 404, headers: { "Cache-Control": "no-store" } });
}

/** Single entity tag from If-None-Match, unquoted (R2 compares bare etags); lists and `*` are ignored. */
function ifNoneMatchEtag(header: string | null): string | null {
  const match = header?.trim().match(/^(?:W\/)?"([^"]+)"$/);
  return match ? match[1] : null;
}

export async function GET(request: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const { key: segments } = await params;
  const key = segments.join("/");
  if (!isServableMediaKey(key)) return notFound();

  // Plain-object conditional (not `request.headers`): works in production and through the dev proxy
  const etag = ifNoneMatchEtag(request.headers.get("If-None-Match"));
  const object = await getOpenMedia().get(key, etag ? { onlyIf: { etagDoesNotMatch: etag } } : undefined);
  if (!object) return notFound();

  // Explicit headers rather than `object.writeHttpMetadata(headers)`, which the dev proxy can't serialize
  const headers = new Headers({
    "Content-Type": object.httpMetadata?.contentType ?? "application/octet-stream",
    "Cache-Control": OPEN_MEDIA_CACHE_CONTROL,
    ETag: object.httpEtag,
    "X-Content-Type-Options": "nosniff",
    // If a non-image ever slipped through, opened directly it can't run script or load anything
    "Content-Security-Policy": "default-src 'none'; sandbox",
  });

  // If-None-Match matched: R2 returns metadata without a body
  if (!("body" in object)) return new Response(null, { status: 304, headers });
  return new Response(object.body, { headers });
}
