import { getAllCoaches } from "@/server/coaches"
import { getTeamMemberCounts, getTeams } from "@/server/open/event-data"
import { TeamsManager } from "../../_components/teams/teams-manager"
import { loadAdminEvent } from "../../_lib/load-event"

export default async function OpenTeamsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const event = await loadAdminEvent(slug)
  const [teams, memberCounts, coaches] = await Promise.all([
    getTeams({ eventId: event.id }),
    getTeamMemberCounts({ eventId: event.id }),
    getAllCoaches(),
  ])

  return (
    <TeamsManager
      eventId={event.id}
      teams={teams}
      memberCounts={memberCounts}
      coaches={coaches.map((coach) => ({ id: coach.id, name: coach.name }))}
    />
  )
}
