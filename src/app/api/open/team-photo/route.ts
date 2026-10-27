import { NextResponse } from "next/server";
import { ZSAError } from "zsa";
import { TEAM_PHOTO_MAX_REQUEST_BYTES } from "@/lib/open/team-photo";
import { uploadTeamPhotoSchema } from "@/schemas/open.schema";
import { uploadTeamPhoto } from "@/server/open/team-photo";
import { requireOpenSession, toFriendlyError } from "@/server/open/write";

// POST multipart/form-data { eventId, teamId, file } → the updated team row.
// A route handler (not a server action) so the 5 MB body doesn't require raising the global
// server-action body limit. Route handlers lack server actions' built-in CSRF check, so the
// same-origin check below is required.

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

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return errorResponse({ code: "FORBIDDEN", message: "Cross-origin uploads are not allowed" });

  const contentLength = Number(request.headers.get("content-length"));
  if (!contentLength) return errorResponse({ code: "INPUT_PARSE_ERROR", message: "Missing Content-Length" });
  if (contentLength > TEAM_PHOTO_MAX_REQUEST_BYTES) {
    return errorResponse({ code: "PAYLOAD_TOO_LARGE", message: "Photos must be 5 MB or smaller" });
  }

  try {
    const session = await requireOpenSession();
    const formData = await request.formData().catch(() => {
      throw new ZSAError("INPUT_PARSE_ERROR", "Expected a multipart form upload");
    });
    const parsed = uploadTeamPhotoSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      throw new ZSAError("INPUT_PARSE_ERROR", parsed.error.issues[0]?.message ?? "Invalid upload");
    }

    const team = await uploadTeamPhoto({ session, ...parsed.data });
    return NextResponse.json({ team });
  } catch (error) {
    const friendly = toFriendlyError({ error });
    return errorResponse({ code: friendly.code, message: typeof friendly.data === "string" ? friendly.data : friendly.message });
  }
}
