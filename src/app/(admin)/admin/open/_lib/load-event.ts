import "server-only"
import { cache } from "react"
import { notFound } from "next/navigation"
import { getEventBySlug } from "@/server/open/events"
import { requireAdmin } from "@/utils/auth"

/**
 * The event for an `/admin/open/[slug]` route (deduped across layout + page); 404 when missing.
 * Requires an admin itself: pages render in parallel with the admin layout's check.
 */
export const loadAdminEvent = cache(async (slug: string) => {
  await requireAdmin()
  const event = await getEventBySlug({ slug })
  if (!event) notFound()
  return event
})
