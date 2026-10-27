import "server-only"
import { cache } from "react"
import { manageHref, manageSignInHref } from "@/lib/open/manage-links"
import { getManageableTeams, isOpenAdmin } from "@/server/open/permissions"
import { getSessionFromCookie } from "@/utils/auth"
import type { PublicEvent } from "./load-public-event"

export interface ManageLink {
  href: string
  label: string
  /** A signed-in admin/coach (prominent button) vs. everyone else (subtle sign-in link). */
  canManage: boolean
}

/**
 * The public pages' entry point into the coach workspace. Reads the session cookie; only a signed-in
 * viewer costs a manageable-teams query. Returns just a link — no team or session data.
 */
export const loadManageLink = cache(async (event: PublicEvent): Promise<ManageLink> => {
  const session = await getSessionFromCookie()
  const teams = session ? await getManageableTeams({ session, eventId: event.id }) : []
  if (!session || teams.length === 0) return { href: manageSignInHref(event.slug), label: "Coach sign in", canManage: false }
  const isSingleTeamCoach = !isOpenAdmin(session) && teams.length === 1
  return { href: manageHref(event.slug), label: isSingleTeamCoach ? "Manage my team" : "Manage teams", canManage: true }
})
