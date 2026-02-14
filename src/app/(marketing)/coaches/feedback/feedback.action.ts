"use server"

import { createServerAction, ZSAError } from "zsa"
import { getDB } from "@/db"
import { coachFeedbackTable, feedbackItemTable } from "@/db/schema"
import { createCoachFeedbackSchema, FEEDBACK_CATEGORIES } from "@/schemas/coach-feedback.schema"
import { withRateLimit, RATE_LIMITS } from "@/utils/with-rate-limit"
import { getAllCoaches } from "@/server/coaches"
import { z } from "zod"

// Use a loose schema for the ZSA input since we validate with DB coaches inside the handler
const looseInputSchema = z.object({
  reviewerCoachId: z.string().min(1),
  reviewedCoachId: z.string().min(1),
  liked: z.array(z.string().min(1)).length(3),
  improvements: z.array(z.string().min(1)).length(3),
})

export const submitCoachFeedbackAction = createServerAction()
  .input(looseInputSchema)
  .handler(async ({ input }) => {
    return withRateLimit(
      async () => {
        try {
          const coaches = await getAllCoaches()
          const coachIds = coaches.map((c) => c.id)

          // Validate against actual DB coaches
          const schema = createCoachFeedbackSchema({ coachIds })
          const result = schema.safeParse(input)
          if (!result.success) {
            throw new ZSAError("INPUT_PARSE_ERROR", result.error.errors[0]?.message || "Invalid input")
          }

          const db = getDB()

          // Insert the feedback submission
          const [feedback] = await db
            .insert(coachFeedbackTable)
            .values({
              reviewerCoachId: input.reviewerCoachId,
              reviewedCoachId: input.reviewedCoachId,
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
