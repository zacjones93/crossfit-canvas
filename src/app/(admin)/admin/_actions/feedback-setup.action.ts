"use server"

import { createServerAction } from "zsa"
import { getDB } from "@/db"
import { requireAdmin } from "@/utils/auth"
import { z } from "zod"
import { eq, asc, sql } from "drizzle-orm"
import { feedbackQuestionTable } from "@/db/schema"

export const getFeedbackQuestionsAction = createServerAction()
  .handler(async () => {
    await requireAdmin()

    const db = getDB()

    return db.query.feedbackQuestionTable.findMany({
      orderBy: [asc(feedbackQuestionTable.sortOrder)],
    })
  })

export const createFeedbackQuestionAction = createServerAction()
  .input(
    z.object({
      category: z.string().min(1).max(100),
      label: z.string().min(1).max(255),
      description: z.string().optional(),
      placeholder: z.string().optional(),
      itemCount: z.number().int().min(1).max(10),
    })
  )
  .handler(async ({ input }) => {
    await requireAdmin()

    const db = getDB()

    // Get max sortOrder
    const [result] = await db
      .select({ maxSort: sql<number>`COALESCE(MAX(${feedbackQuestionTable.sortOrder}), -1)` })
      .from(feedbackQuestionTable)

    await db.insert(feedbackQuestionTable).values({
      category: input.category,
      label: input.label,
      description: input.description,
      placeholder: input.placeholder,
      itemCount: input.itemCount,
      sortOrder: result.maxSort + 1,
    })

    return { success: true }
  })

export const updateFeedbackQuestionAction = createServerAction()
  .input(
    z.object({
      id: z.string(),
      category: z.string().min(1).max(100).optional(),
      label: z.string().min(1).max(255).optional(),
      description: z.string().optional(),
      placeholder: z.string().optional(),
      itemCount: z.number().int().min(1).max(10).optional(),
      isActive: z.boolean().optional(),
      sortOrder: z.number().int().optional(),
    })
  )
  .handler(async ({ input }) => {
    await requireAdmin()

    const db = getDB()
    const { id, ...updates } = input

    // Filter out undefined values
    const cleanUpdates: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) cleanUpdates[key] = value
    }

    if (Object.keys(cleanUpdates).length > 0) {
      await db
        .update(feedbackQuestionTable)
        .set(cleanUpdates)
        .where(eq(feedbackQuestionTable.id, id))
    }

    return { success: true }
  })

export const deleteFeedbackQuestionAction = createServerAction()
  .input(z.object({ id: z.string() }))
  .handler(async ({ input }) => {
    await requireAdmin()

    const db = getDB()
    await db
      .delete(feedbackQuestionTable)
      .where(eq(feedbackQuestionTable.id, input.id))

    return { success: true }
  })

export const reorderFeedbackQuestionsAction = createServerAction()
  .input(z.object({ orderedIds: z.array(z.string()) }))
  .handler(async ({ input }) => {
    await requireAdmin()

    const db = getDB()

    for (let i = 0; i < input.orderedIds.length; i++) {
      await db
        .update(feedbackQuestionTable)
        .set({ sortOrder: i })
        .where(eq(feedbackQuestionTable.id, input.orderedIds[i]))
    }

    return { success: true }
  })
