"use server"

import { createServerAction } from "zsa"
import { getDB } from "@/db"
import { requireAdmin } from "@/utils/auth"
import { z } from "zod"
import { sql } from "drizzle-orm"
import { coachFeedbackTable, feedbackItemTable } from "@/db/schema"
import { PAGE_SIZE_OPTIONS } from "../admin-constants"

const getFeedbackSchema = z.object({
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(Math.max(...PAGE_SIZE_OPTIONS)).default(PAGE_SIZE_OPTIONS[0]),
  coachFilter: z.string().optional(),
})

export const getFeedbackAction = createServerAction()
  .input(getFeedbackSchema)
  .handler(async ({ input }) => {
    await requireAdmin()

    const db = getDB()
    const { page, pageSize, coachFilter } = input

    const offset = (page - 1) * pageSize

    // Build where clause for filtering by reviewed coach name
    const whereClause = coachFilter
      ? sql`${coachFeedbackTable.reviewedCoachName} LIKE ${`%${coachFilter}%`}`
      : undefined

    // Fetch total count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(coachFeedbackTable)
      .where(whereClause)

    // Fetch paginated feedback with their items
    const feedbackRows = await db.query.coachFeedbackTable.findMany({
      where: whereClause,
      with: {
        items: true,
      },
      orderBy: (feedback, { desc }) => [desc(feedback.createdAt)],
      limit: pageSize,
      offset,
    })

    // Transform to group items by category
    const feedback = feedbackRows.map((row) => ({
      id: row.id,
      reviewerCoachName: row.reviewerCoachName,
      reviewedCoachName: row.reviewedCoachName,
      createdAt: row.createdAt,
      liked: row.items
        .filter((item) => item.category === "liked")
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((item) => item.content),
      improvements: row.items
        .filter((item) => item.category === "improvement")
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((item) => item.content),
    }))

    return {
      feedback,
      totalCount: count,
      page,
      pageSize,
      totalPages: Math.ceil(count / pageSize),
    }
  })
