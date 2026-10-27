import "server-only"
import { cache } from "react"
import { notFound } from "next/navigation"
import { getEventBySlug } from "@/server/open/events"

/** The event for an `/admin/open/[slug]` route (deduped across layout + page); 404 when missing. */
export const loadAdminEvent = cache(async (slug: string) => {
  const event = await getEventBySlug({ slug })
  if (!event) notFound()
  return event
})
