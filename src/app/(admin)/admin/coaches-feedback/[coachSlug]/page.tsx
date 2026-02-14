import { getCoachFeedbackData } from "../../_actions/get-coach-feedback.action"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { CoachFeedbackActions } from "../../_components/coaches-feedback/coach-feedback-actions"
import { User, Calendar } from "lucide-react"

interface CoachFeedbackDetailPageProps {
  params: Promise<{ coachSlug: string }>
}

export async function generateMetadata({ params }: CoachFeedbackDetailPageProps): Promise<Metadata> {
  const { coachSlug } = await params
  const data = await getCoachFeedbackData({ input: { coachSlug } }).catch(() => null)

  return {
    title: `${data?.coachName ?? coachSlug} - Coach Feedback`,
    description: `Peer feedback for ${data?.coachName ?? coachSlug}`,
  }
}

export default async function CoachFeedbackDetailPage({ params }: CoachFeedbackDetailPageProps) {
  const { coachSlug } = await params

  let data
  try {
    data = await getCoachFeedbackData({ input: { coachSlug } })
  } catch {
    notFound()
  }

  if (!data) {
    notFound()
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <PageHeader
        items={[
          { href: "/admin", label: "Admin" },
          { href: "/admin/coaches-feedback", label: "Coaches Feedback" },
          { href: `/admin/coaches-feedback/${coachSlug}`, label: data.coachName },
        ]}
      />

      <div className="grid gap-6 mt-6">
        {/* Summary Card */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <User className="h-6 w-6" />
                  {data.coachName}
                </CardTitle>
                {data.credentials && (
                  <p className="text-muted-foreground mt-1">{data.credentials}</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="text-sm">
                  {data.totalCount} review{data.totalCount !== 1 ? "s" : ""}
                </Badge>
                <Badge variant="outline" className="text-sm">
                  <Calendar className="h-3 w-3 mr-1" />
                  {format(data.dateRange.from, "MMM d, yyyy")} - {format(data.dateRange.to, "MMM d, yyyy")}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <CoachFeedbackActions
              coachName={data.coachName}
              questions={data.questions}
              feedbackEntries={data.feedbackEntries.map((e) => ({
                categories: e.categories,
                createdAt: new Date(e.createdAt),
              }))}
            />
          </CardContent>
        </Card>

        {/* Feedback Cards */}
        {data.feedbackEntries.map((entry) => (
          <Card key={entry.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{entry.reviewerCoachName}</CardTitle>
                <span className="text-sm text-muted-foreground">
                  {format(new Date(entry.createdAt), "PPP")}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {data.questions.map((question) => {
                  const items = entry.categories[question.category] ?? []
                  if (items.length === 0) return null
                  return (
                    <div key={question.category}>
                      <h4 className="text-sm font-semibold flex items-center gap-1.5 mb-2">
                        {question.label}
                      </h4>
                      <ul className="space-y-1.5">
                        {items.map((item, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex gap-2">
                            <span className="shrink-0">&bull;</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
