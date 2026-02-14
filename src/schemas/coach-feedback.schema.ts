import { z } from "zod"

export interface FeedbackQuestionConfig {
  category: string
  label: string
  description: string
  placeholder: string
  itemCount: number
}

export function createCoachFeedbackSchema({ coachIds, questions }: { coachIds: string[]; questions: FeedbackQuestionConfig[] }) {
  const categoryFields: Record<string, z.ZodArray<z.ZodString>> = {}
  for (const q of questions) {
    categoryFields[q.category] = z.array(z.string().min(1, "This field is required")).length(q.itemCount)
  }

  return z.object({
    reviewerCoachId: z.string().refine((val) => coachIds.includes(val), {
      message: "Please select a valid coach",
    }),
    reviewedCoachId: z.string().refine((val) => coachIds.includes(val), {
      message: "Please select a valid coach",
    }),
    ...categoryFields,
  }).refine((data) => data.reviewerCoachId !== data.reviewedCoachId, {
    message: "You cannot review yourself",
    path: ["reviewedCoachId"],
  })
}

export type CoachFeedbackFormData = z.infer<ReturnType<typeof createCoachFeedbackSchema>>
