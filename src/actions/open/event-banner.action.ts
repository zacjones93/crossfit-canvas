"use server";

import { createServerAction } from "zsa";
import { openEventIdSchema } from "@/schemas/open.schema";
import { removeEventBanner } from "@/server/open/event-banner";
import { requireOpenAdmin } from "@/server/open/write";

/** Uploads go through the `/api/open/event-banner` route handler (body size); removal is a plain action. */
export const removeEventBannerAction = createServerAction()
  .input(openEventIdSchema)
  .handler(async ({ input }) => {
    const session = await requireOpenAdmin();
    return removeEventBanner({ actorUserId: session.userId, eventId: input.eventId });
  });
