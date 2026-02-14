"use server"

import { createServerAction } from "zsa"
import { getDB } from "@/db"
import { requireAdmin } from "@/utils/auth"
import { z } from "zod"
import { sql } from "drizzle-orm"
import { coachFeedbackTable, coachTable } from "@/db/schema"
import { getAllFeedbackQuestions } from "@/server/feedback-questions"
import { PAGE_SIZE_OPTIONS } from "../admin-constants"

const getFeedbackSchema = z.object({
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(Math.max(...PAGE_SIZE_OPTIONS)).default(PAGE_SIZE_OPTIONS[0]),
  coachFilter: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
})

export const getFeedbackAction = createServerAction()
  .input(getFeedbackSchema)
  .handler(async ({ input }) => {
    await requireAdmin()

    const db = getDB()
    const { page, pageSize, coachFilter, from, to } = input

    const offset = (page - 1) * pageSize

    // Build where conditions
    const buildWhere = (feedback: typeof coachFeedbackTable.$inferSelect, { exists, and, gte, lte }: { exists: Function, and: Function, gte: Function, lte: Function }) => {
      const conditions = []

      if (coachFilter) {
        conditions.push(
          exists(
            db.select().from(coachTable).where(
              sql`${coachTable.id} = ${feedback.reviewedCoachId} AND ${coachTable.name} LIKE ${`%${coachFilter}%`}`
            )
          )
        )
      }

      if (from) {
        conditions.push(gte(coachFeedbackTable.createdAt, new Date(from)))
      }
      if (to) {
        conditions.push(lte(coachFeedbackTable.createdAt, new Date(to)))
      }

      return conditions.length > 0 ? and(...conditions) : undefined
    }

    // Fetch paginated feedback with their items and coach relations
    const feedbackRows = await db.query.coachFeedbackTable.findMany({
      where: (feedback, ops) => buildWhere(feedback, ops),
      with: {
        items: true,
        reviewer: true,
        reviewed: true,
      },
      orderBy: (feedback, { desc }) => [desc(feedback.createdAt)],
      limit: pageSize,
      offset,
    })

    // Fetch total count
    const allFeedback = await db.query.coachFeedbackTable.findMany({
      where: (feedback, ops) => buildWhere(feedback, ops),
      columns: { id: true },
    })
    const count = allFeedback.length

    const questions = await getAllFeedbackQuestions()

    // Transform to group items by category dynamically
    const feedback = feedbackRows.map((row) => {
      const categories: Record<string, string[]> = {}
      for (const q of questions) {
        categories[q.category] = row.items
          .filter((item) => item.category === q.category)
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((item) => item.content)
      }
      return {
        id: row.id,
        reviewerCoachName: row.reviewer?.name ?? "Unknown",
        reviewedCoachName: row.reviewed?.name ?? "Unknown",
        reviewedCoachSlug: row.reviewed?.slug ?? "",
        createdAt: row.createdAt,
        categories,
      }
    })

    return {
      feedback,
      questions: questions.map((q) => ({ category: q.category, label: q.label })),
      totalCount: count,
      page,
      pageSize,
      totalPages: Math.ceil(count / pageSize),
    }
  })
