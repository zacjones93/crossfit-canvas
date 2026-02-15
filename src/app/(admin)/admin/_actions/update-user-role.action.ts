"use server"

import { createServerAction, ZSAError } from "zsa"
import { getDB } from "@/db"
import { ROLES_ENUM, userTable } from "@/db/schema"
import { requireAdmin } from "@/utils/auth"
import { z } from "zod"
import { eq } from "drizzle-orm"

const updateUserRoleSchema = z.object({
  userId: z.string(),
  role: z.enum([ROLES_ENUM.ADMIN, ROLES_ENUM.USER]),
})

export const updateUserRoleAction = createServerAction()
  .input(updateUserRoleSchema)
  .handler(async ({ input }) => {
    const session = await requireAdmin()

    if (session?.user.id === input.userId) {
      throw new ZSAError("FORBIDDEN", "Cannot change your own role")
    }

    const db = getDB()

    const [updated] = await db
      .update(userTable)
      .set({ role: input.role })
      .where(eq(userTable.id, input.userId))
      .returning({ id: userTable.id, role: userTable.role })

    if (!updated) {
      throw new ZSAError("NOT_FOUND", "User not found")
    }

    return updated
  })
