"use server"

import { createServerAction, ZSAError } from "zsa"
import { getDB } from "@/db"
import { coachFeedbackTable, feedbackItemTable } from "@/db/schema"
import { withRateLimit, RATE_LIMITS } from "@/utils/with-rate-limit"
import { getAllCoaches } from "@/server/coaches"
import { getAllActiveFeedbackQuestions } from "@/server/feedback-questions"
import { createCoachFeedbackSchema } from "@/schemas/coach-feedback.schema"
import { z } from "zod"

// Use a loose schema for ZSA input since we validate dynamically with DB questions inside the handler
const looseInputSchema = z.object({
  reviewerCoachId: z.string().min(1),
  reviewedCoachId: z.string().min(1),
}).passthrough()

export const submitCoachFeedbackAction = createServerAction()
  .input(looseInputSchema)
  .handler(async ({ input }) => {
    return withRateLimit(
      async () => {
        try {
          const [coaches, questions] = await Promise.all([
            getAllCoaches(),
            getAllActiveFeedbackQuestions(),
          ])
          const coachIds = coaches.map((c) => c.id)

          // Validate against actual DB coaches and dynamic questions
          const schema = createCoachFeedbackSchema({
            coachIds,
            questions: questions.map(q => ({
              category: q.category,
              label: q.label,
              description: q.description ?? "",
              placeholder: q.placeholder ?? "",
              itemCount: q.itemCount,
            })),
          })
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

          // Insert feedback items dynamically from all question categories
          const allItems = questions.flatMap((q) => {
            const values = (input as Record<string, string[]>)[q.category] ?? []
            return values.map((content, index) => ({
              feedbackId: feedback.id,
              category: q.category,
              content,
              sortOrder: index,
            }))
          })

          await db.insert(feedbackItemTable).values(allItems)

          return { success: true }
        } catch (error) {
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
