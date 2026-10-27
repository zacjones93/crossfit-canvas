import type { ReactNode } from "react"
import Link from "next/link"
import { ExternalLink } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { CopyLinkButton } from "@/components/open/copy-link-button"
import { OPEN_EVENT_STATUS } from "@/lib/open/constants"
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
          <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
            <CopyLinkButton path={`/open/${event.slug}`} label="Copy public link" />
            <CopyLinkButton path={`/open/${event.slug}/tv`} label="Copy TV link" />
            <Button asChild variant="ghost" size="sm">
              <Link href={`/open/${event.slug}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="size-4" />
                View
              </Link>
            </Button>
          </div>
        </div>
        {event.status === OPEN_EVENT_STATUS.DRAFT && (
          <p className="text-sm text-muted-foreground">
            This event is a draft. Public links only work for admins until you set the status to live in Settings.
          </p>
        )}
        <EventNav slug={event.slug} />
        <div className="min-w-0">{children}</div>
      </div>
    </>
  )
}
