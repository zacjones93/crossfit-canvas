import { getAllCoaches } from "@/server/coaches"
import { getEntries, getTeams } from "@/server/open/event-data"
import { ParticipantsManager } from "../../_components/participants/participants-manager"
import { loadAdminEvent } from "../../_lib/load-event"

export default async function OpenParticipantsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const event = await loadAdminEvent(slug)
  const [entries, teams, coaches] = await Promise.all([
    getEntries({ eventId: event.id }),
    getTeams({ eventId: event.id }),
    getAllCoaches(),
  ])

  return (
    <ParticipantsManager
      eventId={event.id}
      entries={entries}
      teams={teams.map((team) => ({ id: team.id, label: team.name }))}
      coaches={coaches.map((coach) => ({ id: coach.id, label: coach.name }))}
    />
  )
}
