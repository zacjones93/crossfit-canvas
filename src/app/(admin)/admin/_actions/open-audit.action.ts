"use server"

import { createServerAction } from "zsa"
import { z } from "zod"
import { openAuditEntityTuple } from "@/lib/open/constants"
import { getAuditLog } from "@/server/open/audit"
import { requireAdmin } from "@/utils/auth"

const getOpenAuditLogSchema = z.object({
  eventId: z.string().min(1),
  actorUserId: z.string().min(1).optional(),
  entityType: z.enum(openAuditEntityTuple).optional(),
  entityId: z.string().min(1).optional(),
  cursor: z.string().min(1),
})

/** Next page of the Open audit log for the admin "Load more" button. */
export const getOpenAuditLogAction = createServerAction()
  .input(getOpenAuditLogSchema)
  .handler(async ({ input }) => {
    await requireAdmin()
    return getAuditLog(input)
  })
