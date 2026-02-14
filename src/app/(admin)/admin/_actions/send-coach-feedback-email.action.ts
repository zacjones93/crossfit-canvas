"use server"

import { createServerAction } from "zsa"
import { requireAdmin } from "@/utils/auth"
import { z } from "zod"
import { getCoachFeedbackData } from "./get-coach-feedback.action"
import { sendCoachFeedbackEmail } from "@/utils/email"

const sendCoachFeedbackEmailSchema = z.object({
  coachName: z.string().min(1),
  recipientEmail: z.string().email(),
})

export const sendCoachFeedbackEmailAction = createServerAction()
  .input(sendCoachFeedbackEmailSchema)
  .handler(async ({ input }) => {
    await requireAdmin()

    const { coachName, recipientEmail } = input

    // Convert name to slug for the lookup
    const coachSlug = coachName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")

    const data = await getCoachFeedbackData({ input: { coachSlug } })

    if (!data) {
      throw new Error("No feedback found for this coach")
    }

    // Curate feedback: filter excluded items, use revisedContent where set
    const curatedEntries = data.feedbackEntries.map((entry) => ({
      categories: Object.fromEntries(
        data.questions.map((q) => [
          q.category,
          (entry.categories[q.category] ?? [])
            .filter((item) => !item.excluded)
            .map((item) => item.revisedContent ?? item.content),
        ])
      ),
    }))

    await sendCoachFeedbackEmail({
      coachName: data.coachName,
      questions: data.questions,
      feedbackEntries: curatedEntries,
      recipientEmail,
    })

    return { success: true }
  })
