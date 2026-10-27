import { getScalings } from "@/server/open/event-data"
import { ScalingsTable } from "../../_components/scalings/scalings-table"
import { loadAdminEvent } from "../../_lib/load-event"

export default async function OpenScalingsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const event = await loadAdminEvent(slug)
  const scalings = await getScalings({ eventId: event.id })
  return <ScalingsTable eventId={event.id} scalings={scalings} />
}
