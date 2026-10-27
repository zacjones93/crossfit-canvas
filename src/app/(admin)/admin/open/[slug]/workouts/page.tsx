import { getWeeks, getWorkouts } from "@/server/open/event-data"
import { WorkoutsTable } from "../../_components/workouts/workouts-table"
import { loadAdminEvent } from "../../_lib/load-event"

export default async function OpenWorkoutsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const event = await loadAdminEvent(slug)
  const [workouts, weeks] = await Promise.all([getWorkouts({ eventId: event.id }), getWeeks({ eventId: event.id })])
  return <WorkoutsTable eventId={event.id} workouts={workouts} weeks={weeks.map((week) => ({ id: week.id, label: week.label }))} />
}
