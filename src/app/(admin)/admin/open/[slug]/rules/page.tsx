import { getRules } from "@/server/open/event-data"
import { RulesTable } from "../../_components/rules/rules-table"
import { loadAdminEvent } from "../../_lib/load-event"

export default async function OpenRulesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const event = await loadAdminEvent(slug)
  const rules = await getRules({ eventId: event.id })
  return <RulesTable eventId={event.id} rules={rules} />
}
