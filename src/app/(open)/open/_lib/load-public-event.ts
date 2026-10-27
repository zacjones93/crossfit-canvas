import "server-only"
import type { Metadata } from "next"
import { cache } from "react"
import { notFound } from "next/navigation"
import { EVENT_VISIBILITY, decideEventVisibility } from "@/lib/open/public-view"
import { getEventBySlug } from "@/server/open/events"
import { isOpenAdmin } from "@/server/open/permissions"
import { getSessionFromCookie } from "@/utils/auth"

/**
 * Event for a public page (deduped across generateMetadata and the page). Live/closed events are
 * public; a draft 404s unless the viewer is an admin (`isPreview` → show the draft banner). The
 * session is only read for drafts.
 */
export const loadPublicEvent = cache(async (slug: string) => {
  const event = await getEventBySlug({ slug })
  if (!event) notFound()

  const needsAdmin = decideEventVisibility({ status: event.status, isAdmin: false }) !== EVENT_VISIBILITY.PUBLIC
  const session = needsAdmin ? await getSessionFromCookie() : null
  const visibility = decideEventVisibility({ status: event.status, isAdmin: session ? isOpenAdmin(session) : false })
  if (visibility === EVENT_VISIBILITY.HIDDEN) notFound()

  return {
    event: {
      id: event.id,
      name: event.name,
      slug: event.slug,
      year: event.year,
      status: event.status,
      weightUnit: event.weightUnit,
      showIndividuals: event.showIndividuals,
    },
    isPreview: visibility === EVENT_VISIBILITY.PREVIEW,
  }
})

export type PublicEvent = Awaited<ReturnType<typeof loadPublicEvent>>["event"]

/** `robots` for generateMetadata: draft previews are never indexed; public pages inherit the site default. */
export function previewRobots(isPreview: boolean): Metadata["robots"] {
  return isPreview ? { index: false, follow: false } : undefined
}
