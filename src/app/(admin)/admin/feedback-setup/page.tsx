import { PageHeader } from "@/components/page-header"
import { FeedbackSetupForm } from "../_components/feedback-setup/feedback-setup-form"
import type { Metadata } from "next"
import { NuqsAdapter } from "nuqs/adapters/next/app"

export const metadata: Metadata = {
  title: "Feedback Setup - Admin",
  description: "Configure feedback questions for coaches peer review",
}

export default function FeedbackSetupPage() {
  return (
    <NuqsAdapter>
      <PageHeader items={[{ href: "/admin", label: "Admin" }, { href: "/admin/feedback-setup", label: "Feedback Setup" }]} />
      <FeedbackSetupForm />
    </NuqsAdapter>
  )
}
