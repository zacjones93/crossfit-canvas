import type { Metadata } from "next"
import { FeedbackForm } from "./feedback-form"
import { getAllCoaches } from "@/server/coaches"

export const metadata: Metadata = {
  title: "Coach Feedback - CrossFit Canvas",
  description: "Submit peer feedback for CrossFit Canvas coaches.",
}

export default async function CoachFeedbackPage() {
  const coaches = await getAllCoaches()
  return (
    <main className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="font-heading text-3xl md:text-4xl font-bold mb-3 tracking-tight">
              Coach Peer Feedback
            </h1>
            <p className="text-lg text-muted-foreground">
              Share constructive feedback to help our coaching team grow
            </p>
          </div>
          <FeedbackForm coaches={coaches.map(c => ({ id: c.id, name: c.name }))} />
        </div>
      </div>
    </main>
  )
}
