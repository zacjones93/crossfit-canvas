import type { ReactNode } from "react"
import { PageHeader } from "@/components/page-header"
import { EventStatusBadge } from "../_components/event-status-badge"
import { EventNav } from "../_components/event-nav"
import { loadAdminEvent } from "../_lib/load-event"

export default async function OpenEventLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const event = await loadAdminEvent(slug)

  return (
    <>
      <PageHeader
        items={[
          { href: "/admin", label: "Admin" },
          { href: "/admin/open", label: "Open" },
          { href: `/admin/open/${event.slug}`, label: event.name },
        ]}
      />
      <div className="flex w-full min-w-0 flex-col gap-4 p-4 sm:p-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold sm:text-3xl">{event.name}</h1>
          <EventStatusBadge status={event.status} />
          <span className="text-sm text-muted-foreground">{event.year}</span>
        </div>
        <EventNav slug={event.slug} />
        <div className="min-w-0">{children}</div>
      </div>
    </>
  )
}
