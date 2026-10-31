import { ZSAError } from "zsa";
import { uploadEventBannerSchema } from "@/schemas/open.schema";
import { uploadEventBanner } from "@/server/open/event-banner";
import { isOpenAdmin } from "@/server/open/permissions";
import { handleImageUpload } from "@/server/open/upload-route";

// POST multipart/form-data { eventId, file } → { event } (the updated row). Admins only.
export async function POST(request: Request) {
  return handleImageUpload({
    request,
    handle: async ({ session, formData }) => {
      if (!isOpenAdmin(session)) throw new ZSAError("FORBIDDEN", "Only admins can change the event banner");
      const parsed = uploadEventBannerSchema.safeParse(Object.fromEntries(formData));
      if (!parsed.success) throw new ZSAError("INPUT_PARSE_ERROR", parsed.error.issues[0]?.message ?? "Invalid upload");
      return { event: await uploadEventBanner({ actorUserId: session.userId, ...parsed.data }) };
    },
  });
}
