"use server"

import { createServerAction, ZSAError } from "zsa"
import { getDB } from "@/db"
import { coachFeedbackTable, feedbackItemTable } from "@/db/schema"
import { coachFeedbackSchema, FEEDBACK_CATEGORIES } from "@/schemas/coach-feedback.schema"
import { withRateLimit, RATE_LIMITS } from "@/utils/with-rate-limit"

export const submitCoachFeedbackAction = createServerAction()
  .input(coachFeedbackSchema)
  .handler(async ({ input }) => {
    return withRateLimit(
      async () => {
        try {
          const db = getDB()

          // Insert the feedback submission
          const [feedback] = await db
            .insert(coachFeedbackTable)
            .values({
              reviewerCoachName: input.reviewerCoachName,
              reviewedCoachName: input.reviewedCoachName,
            })
            .returning({ id: coachFeedbackTable.id })

          // Insert liked items
          const likedItems = input.liked.map((content, index) => ({
            feedbackId: feedback.id,
            category: FEEDBACK_CATEGORIES.LIKED,
            content,
            sortOrder: index,
          }))

          // Insert improvement items
          const improvementItems = input.improvements.map((content, index) => ({
            feedbackId: feedback.id,
            category: FEEDBACK_CATEGORIES.IMPROVEMENT,
            content,
            sortOrder: index,
          }))

          await db.insert(feedbackItemTable).values([...likedItems, ...improvementItems])

          return { success: true }
        } catch (error) {
          console.error("Coach feedback submission error:", error)

          if (error instanceof ZSAError) {
            throw error
          }

          throw new ZSAError(
            "INTERNAL_SERVER_ERROR",
            "Failed to submit feedback. Please try again later."
          )
        }
      },
      RATE_LIMITS.COACH_FEEDBACK
    )
  })
