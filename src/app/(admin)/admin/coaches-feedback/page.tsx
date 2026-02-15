import { PageHeader } from "@/components/page-header"
import { FeedbackTable } from "../_components/coaches-feedback/feedback-table"
import type { Metadata } from "next"
import { NuqsAdapter } from "nuqs/adapters/next/app"

export const metadata: Metadata = {
  title: "Coaches Feedback - Admin",
  description: "View coaches peer feedback submissions",
}

export default function CoachesFeedbackPage() {
  return (
    <NuqsAdapter>
      <PageHeader items={[{ href: "/admin", label: "Admin" }, { href: "/admin/coaches-feedback", label: "Coaches Feedback" }]} />
      <FeedbackTable />
    </NuqsAdapter>
  )
}
