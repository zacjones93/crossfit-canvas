import "server-only";
import { NextResponse } from "next/server";
import { ZSAError } from "zsa";
import { TEAM_PHOTO_MAX_REQUEST_BYTES } from "@/lib/open/team-photo";
import { requireOpenSession, toFriendlyError } from "./write";

// Shared by the multipart image upload route handlers (team photo, event banner). Route handlers (not
// server actions) so a 5 MB body doesn't require raising the global server-action body limit. They lack
// server actions' built-in CSRF check, so the same-origin check here is required.

const STATUS_BY_CODE: Partial<Record<ZSAError["code"], number>> = {
  INPUT_PARSE_ERROR: 400,
  NOT_AUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  PRECONDITION_FAILED: 412,
  PAYLOAD_TOO_LARGE: 413,
};

function errorResponse({ code, message }: { code: ZSAError["code"]; message: string }) {
  return NextResponse.json({ error: { code, message } }, { status: STATUS_BY_CODE[code] ?? 500 });
}

/** The request's Origin must be this host (same check server actions do: forwarded host, else host). */
function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

type OpenSession = Awaited<ReturnType<typeof requireOpenSession>>;

/**
 * Same-origin + Content-Length checks before reading the body, then a signed-in session and the parsed
 * form; `handle` returns the JSON body. ZSAErrors (and DB errors) become `{ error: { code, message } }`.
 */
export async function handleImageUpload({
  request,
  handle,
}: {
  request: Request;
  handle: (args: { session: OpenSession; formData: FormData }) => Promise<Record<string, unknown>>;
}) {
  if (!isSameOrigin(request)) return errorResponse({ code: "FORBIDDEN", message: "Cross-origin uploads are not allowed" });

  const contentLength = Number(request.headers.get("content-length"));
  if (!contentLength) return errorResponse({ code: "INPUT_PARSE_ERROR", message: "Missing Content-Length" });
  if (contentLength > TEAM_PHOTO_MAX_REQUEST_BYTES) {
    return errorResponse({ code: "PAYLOAD_TOO_LARGE", message: "Images must be 5 MB or smaller" });
  }

  try {
    const session = await requireOpenSession();
    const formData = await request.formData().catch(() => {
      throw new ZSAError("INPUT_PARSE_ERROR", "Expected a multipart form upload");
    });
    return NextResponse.json(await handle({ session, formData }));
  } catch (error) {
    const friendly = toFriendlyError({ error });
    return errorResponse({ code: friendly.code, message: typeof friendly.data === "string" ? friendly.data : friendly.message });
  }
}
