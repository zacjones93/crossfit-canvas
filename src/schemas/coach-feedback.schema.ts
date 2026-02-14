import { z } from "zod"

export const FEEDBACK_CATEGORIES = {
  LIKED: "liked",
  IMPROVEMENT: "improvement",
} as const

export const ITEMS_PER_CATEGORY = 3

export function createCoachFeedbackSchema({ coachIds }: { coachIds: string[] }) {
  return z.object({
    reviewerCoachId: z.string().refine((val) => coachIds.includes(val), {
      message: "Please select a valid coach",
    }),
    reviewedCoachId: z.string().refine((val) => coachIds.includes(val), {
      message: "Please select a valid coach",
    }),
    liked: z.array(z.string().min(1, "This field is required")).length(ITEMS_PER_CATEGORY),
    improvements: z.array(z.string().min(1, "This field is required")).length(ITEMS_PER_CATEGORY),
  }).refine((data) => data.reviewerCoachId !== data.reviewedCoachId, {
    message: "You cannot review yourself",
    path: ["reviewedCoachId"],
  })
}

export type CoachFeedbackFormData = z.infer<ReturnType<typeof createCoachFeedbackSchema>>
