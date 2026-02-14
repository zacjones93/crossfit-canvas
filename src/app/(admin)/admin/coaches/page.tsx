import { CoachesTable } from "../_components/coaches/coaches-table"
import { PageHeader } from "@/components/page-header"
import type { Metadata } from "next"
import { NuqsAdapter } from 'nuqs/adapters/next/app'

export const metadata: Metadata = {
  title: "Coach Management",
  description: "Manage all coaches",
}

export default function CoachesPage() {
  return (
    <NuqsAdapter>
      <PageHeader items={[{ href: "/admin", label: "Admin" }, { href: "/admin/coaches", label: "Coaches" }]} />
      <CoachesTable />
    </NuqsAdapter>
  )
}
