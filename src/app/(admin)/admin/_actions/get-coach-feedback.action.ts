"use server"

import { createServerAction } from "zsa"
import { getDB } from "@/db"
import { requireAdmin } from "@/utils/auth"
import { z } from "zod"
import { coachFeedbackTable, coachTable } from "@/db/schema"
import { eq } from "drizzle-orm"
import { getAllFeedbackQuestions } from "@/server/feedback-questions"

const getCoachFeedbackSchema = z.object({
  coachSlug: z.string().min(1),
})

const getCoachFeedbackHandler = async ({ input }: { input: { coachSlug: string } }) => {
  await requireAdmin()

  const db = getDB()
  const { coachSlug } = input

  // Look up coach by slug
  const coach = await db.query.coachTable.findFirst({
    where: eq(coachTable.slug, coachSlug),
  })

  if (!coach) {
    return null
  }

  const feedbackRows = await db.query.coachFeedbackTable.findMany({
    where: eq(coachFeedbackTable.reviewedCoachId, coach.id),
    with: {
      items: { with: { annotation: true } },
      reviewer: true,
    },
    orderBy: (feedback, { desc }) => [desc(feedback.createdAt)],
  })

  if (feedbackRows.length === 0) {
    return null
  }

  const questions = await getAllFeedbackQuestions()

  const feedbackEntries = feedbackRows.map((row) => {
    const categories: Record<string, Array<{
      id: string
      content: string
      revisedContent: string | null
      excluded: boolean
      adminNote: string | null
      hasAnnotation: boolean
    }>> = {}
    for (const q of questions) {
      categories[q.category] = row.items
        .filter((item) => item.category === q.category)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((item) => ({
          id: item.id,
          content: item.content,
          revisedContent: item.annotation?.revisedContent ?? null,
          excluded: item.annotation?.excluded ?? false,
          adminNote: item.annotation?.adminNote ?? null,
          hasAnnotation: !!item.annotation,
        }))
    }
    return {
      id: row.id,
      reviewerCoachName: row.reviewer?.name ?? "Unknown",
      createdAt: row.createdAt,
      categories,
    }
  })

  const dates = feedbackRows.map((r) => r.createdAt)
  const earliestDate = new Date(Math.min(...dates.map((d) => d.getTime())))
  const latestDate = new Date(Math.max(...dates.map((d) => d.getTime())))

  return {
    coachName: coach.name,
    coachSlug: coach.slug,
    credentials: coach.credentials,
    totalCount: feedbackRows.length,
    feedbackEntries,
    questions: questions.map((q) => ({ category: q.category, label: q.label })),
    dateRange: { from: earliestDate, to: latestDate },
  }
}

export const getCoachFeedbackAction = createServerAction()
  .input(getCoachFeedbackSchema)
  .handler(getCoachFeedbackHandler)

// Export handler for direct use in server components
export const getCoachFeedbackData = getCoachFeedbackHandler
