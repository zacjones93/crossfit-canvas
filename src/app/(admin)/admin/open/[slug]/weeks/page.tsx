import { getWeeks } from "@/server/open/event-data"
import { WeeksTable } from "../../_components/weeks/weeks-table"
import { loadAdminEvent } from "../../_lib/load-event"

export default async function OpenWeeksPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const event = await loadAdminEvent(slug)
  const weeks = await getWeeks({ eventId: event.id })
  return <WeeksTable eventId={event.id} weeks={weeks} />
}
