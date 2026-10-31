import { ZSAError } from "zsa";
import { uploadTeamPhotoSchema } from "@/schemas/open.schema";
import { uploadTeamPhoto } from "@/server/open/team-photo";
import { handleImageUpload } from "@/server/open/upload-route";

// POST multipart/form-data { eventId, teamId, file } → { team } (the updated row).
export async function POST(request: Request) {
  return handleImageUpload({
    request,
    handle: async ({ session, formData }) => {
      const parsed = uploadTeamPhotoSchema.safeParse(Object.fromEntries(formData));
      if (!parsed.success) throw new ZSAError("INPUT_PARSE_ERROR", parsed.error.issues[0]?.message ?? "Invalid upload");
      return { team: await uploadTeamPhoto({ session, ...parsed.data }) };
    },
  });
}
