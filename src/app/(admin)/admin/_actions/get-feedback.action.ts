"use server"

import { createServerAction } from "zsa"
import { getDB } from "@/db"
import { requireAdmin } from "@/utils/auth"
import { z } from "zod"
import { sql } from "drizzle-orm"
import { coachFeedbackTable, coachTable } from "@/db/schema"
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
      ? sql`${coachTable.name} LIKE ${`%${coachFilter}%`}`
      : undefined

    // Fetch paginated feedback with their items and coach relations
    const feedbackRows = await db.query.coachFeedbackTable.findMany({
      where: whereClause
        ? (feedback, { exists }) =>
            exists(
              db.select().from(coachTable).where(
                sql`${coachTable.id} = ${feedback.reviewedCoachId} AND ${coachTable.name} LIKE ${`%${coachFilter}%`}`
              )
            )
        : undefined,
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
      where: whereClause
        ? (feedback, { exists }) =>
            exists(
              db.select().from(coachTable).where(
                sql`${coachTable.id} = ${feedback.reviewedCoachId} AND ${coachTable.name} LIKE ${`%${coachFilter}%`}`
              )
            )
        : undefined,
      columns: { id: true },
    })
    const count = allFeedback.length

    // Transform to group items by category
    const feedback = feedbackRows.map((row) => ({
      id: row.id,
      reviewerCoachName: row.reviewer?.name ?? "Unknown",
      reviewedCoachName: row.reviewed?.name ?? "Unknown",
      reviewedCoachSlug: row.reviewed?.slug ?? "",
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
