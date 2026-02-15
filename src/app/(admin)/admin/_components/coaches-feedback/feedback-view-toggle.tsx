"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { FeedbackItemAnnotation } from "./feedback-item-annotation"
import { CoachFeedbackActions } from "./coach-feedback-actions"

interface FeedbackItemData {
  id: string
  content: string
  revisedContent: string | null
  excluded: boolean
  adminNote: string | null
  hasAnnotation: boolean
}

interface FeedbackEntry {
  id: string
  reviewerCoachName: string
  createdAt: string
  categories: Record<string, FeedbackItemData[]>
}

interface Question {
  category: string
  label: string
}

interface FeedbackViewToggleProps {
  coachName: string
  questions: Question[]
  feedbackEntries: FeedbackEntry[]
}

export function FeedbackViewToggle({ coachName, questions, feedbackEntries }: FeedbackViewToggleProps) {
  const [view, setView] = useState<"original" | "curated">("original")
  const showCurated = view === "curated"

  // Count how many annotations exist across all entries
  const annotationCount = feedbackEntries.reduce((acc, entry) => {
    return acc + Object.values(entry.categories).flat().filter((item) => item.hasAnnotation).length
  }, 0)

  // Build curated entries for sharing (string arrays for PDF/email)
  const curatedEntries = feedbackEntries.map((entry) => ({
    categories: Object.fromEntries(
      questions.map((q) => [
        q.category,
        (entry.categories[q.category] ?? [])
          .filter((item) => !item.excluded)
          .map((item) => item.revisedContent ?? item.content),
      ])
    ),
    createdAt: new Date(entry.createdAt),
  }))

  return (
    <div className="space-y-4">
      {/* View Toggle + Actions */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Tabs value={view} onValueChange={(v) => setView(v as "original" | "curated")}>
          <TabsList>
            <TabsTrigger value="original">Original Feedback</TabsTrigger>
            <TabsTrigger value="curated">
              Curated View
              {annotationCount > 0 && (
                <span className="ml-1.5 text-xs bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 rounded-full px-1.5 py-0.5">
                  {annotationCount}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <CoachFeedbackActions
          coachName={coachName}
          questions={questions}
          feedbackEntries={curatedEntries}
        />
      </div>

      {showCurated && annotationCount === 0 && (
        <p className="text-sm text-muted-foreground italic">
          No annotations yet. Hover over items in the Original view to edit, exclude, or add notes.
        </p>
      )}

      {/* Feedback Cards */}
      {feedbackEntries.map((entry) => {
        // In curated view, skip entries where all items are excluded
        const hasVisibleItems = showCurated
          ? Object.values(entry.categories).flat().some((item) => !item.excluded)
          : true
        if (!hasVisibleItems) return null

        return (
          <Card key={entry.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {showCurated ? `Review #${feedbackEntries.indexOf(entry) + 1}` : entry.reviewerCoachName}
                </CardTitle>
                <span className="text-sm text-muted-foreground">
                  {format(new Date(entry.createdAt), "PPP")}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {questions.map((question) => {
                  const items = entry.categories[question.category] ?? []
                  const visibleItems = showCurated ? items.filter((i) => !i.excluded) : items
                  if (visibleItems.length === 0) return null
                  return (
                    <div key={question.category}>
                      <h4 className="text-sm font-semibold flex items-center gap-1.5 mb-2">
                        {question.label}
                      </h4>
                      <ul className="space-y-1">
                        {items.map((item) => (
                          <FeedbackItemAnnotation
                            key={item.id}
                            feedbackItemId={item.id}
                            originalContent={item.content}
                            revisedContent={item.revisedContent}
                            excluded={item.excluded}
                            adminNote={item.adminNote}
                            hasAnnotation={item.hasAnnotation}
                            showCurated={showCurated}
                          />
                        ))}
                      </ul>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
