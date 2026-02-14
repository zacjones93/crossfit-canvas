"use server"

import { createServerAction } from "zsa"
import { getDB } from "@/db"
import { requireAdmin } from "@/utils/auth"
import { z } from "zod"
import { feedbackItemAnnotationTable } from "@/db/schema"
import { eq } from "drizzle-orm"

export const saveAnnotationAction = createServerAction()
  .input(
    z.object({
      feedbackItemId: z.string().min(1),
      revisedContent: z.string().nullable().optional(),
      excluded: z.boolean().optional(),
      adminNote: z.string().nullable().optional(),
    })
  )
  .handler(async ({ input }) => {
    await requireAdmin()

    const db = getDB()

    const [annotation] = await db
      .insert(feedbackItemAnnotationTable)
      .values({
        feedbackItemId: input.feedbackItemId,
        revisedContent: input.revisedContent ?? null,
        excluded: input.excluded ?? false,
        adminNote: input.adminNote ?? null,
      })
      .onConflictDoUpdate({
        target: feedbackItemAnnotationTable.feedbackItemId,
        set: {
          ...(input.revisedContent !== undefined && { revisedContent: input.revisedContent }),
          ...(input.excluded !== undefined && { excluded: input.excluded }),
          ...(input.adminNote !== undefined && { adminNote: input.adminNote }),
        },
      })
      .returning()

    return annotation
  })

export const deleteAnnotationAction = createServerAction()
  .input(z.object({ feedbackItemId: z.string().min(1) }))
  .handler(async ({ input }) => {
    await requireAdmin()

    const db = getDB()

    await db
      .delete(feedbackItemAnnotationTable)
      .where(eq(feedbackItemAnnotationTable.feedbackItemId, input.feedbackItemId))

    return { success: true }
  })
