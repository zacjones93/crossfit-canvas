import { z } from "zod"
import { coaches } from "@/constants/coaches"

const coachNames = coaches.map((c) => c.name)

export const FEEDBACK_CATEGORIES = {
  LIKED: "liked",
  IMPROVEMENT: "improvement",
} as const

export const ITEMS_PER_CATEGORY = 3

export const coachFeedbackSchema = z.object({
  reviewerCoachName: z.string().refine((val) => coachNames.includes(val), {
    message: "Please select a valid coach",
  }),
  reviewedCoachName: z.string().refine((val) => coachNames.includes(val), {
    message: "Please select a valid coach",
  }),
  liked: z.array(z.string().min(1, "This field is required")).length(ITEMS_PER_CATEGORY),
  improvements: z.array(z.string().min(1, "This field is required")).length(ITEMS_PER_CATEGORY),
}).refine((data) => data.reviewerCoachName !== data.reviewedCoachName, {
  message: "You cannot review yourself",
  path: ["reviewedCoachName"],
})

export type CoachFeedbackFormData = z.infer<typeof coachFeedbackSchema>
