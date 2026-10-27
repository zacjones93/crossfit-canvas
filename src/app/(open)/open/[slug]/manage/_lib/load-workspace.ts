import "server-only"
import { cache } from "react"
import type { Route } from "next"
import { notFound, redirect } from "next/navigation"
import { manageSignInHref } from "@/lib/open/manage-links"
import { getEventBySlug } from "@/server/open/events"
import type { GridScope } from "@/server/open/grid-data"
import { getManageableTeams, isOpenAdmin } from "@/server/open/permissions"
import { getSessionFromCookie } from "@/utils/auth"

/**
 * Session + event + the teams this user may manage (all teams for admins), deduped across the
 * layout and pages. Layouts and pages render in parallel, so every page calls this itself
 * rather than trusting the layout's checks.
 */
export const loadWorkspace = cache(async (slug: string) => {
  const session = await getSessionFromCookie()
  if (!session) redirect(manageSignInHref(slug) as Route)

  const event = await getEventBySlug({ slug })
  if (!event) notFound()

  const teams = await getManageableTeams({ session, eventId: event.id })
  return { session, event, teams, isAdmin: isOpenAdmin(session) }
})

/**
 * One manageable team by slug, with the grid scope for it. `null` when the user manages no team
 * (the layout shows the "not a coach" page); 404 when the team isn't one of theirs.
 */
export async function loadWorkspaceTeam({ slug, teamSlug }: { slug: string; teamSlug: string }) {
  const workspace = await loadWorkspace(slug)
  if (workspace.teams.length === 0) return null

  const team = workspace.teams.find((item) => item.slug === teamSlug)
  if (!team) notFound()

  const scope: GridScope = {
    isAdmin: workspace.isAdmin,
    manageableTeamIds: new Set(workspace.teams.map((item) => item.id)),
    event: workspace.event,
    teamId: team.id,
  }
  return { ...workspace, team, scope }
}
