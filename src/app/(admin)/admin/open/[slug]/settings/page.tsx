import { getEventCounts } from "@/server/open/events"
import { EventBannerCard } from "../../_components/settings/event-banner-card"
import { DeleteEventCard } from "../../_components/settings/delete-event-card"
import { EventSettingsForm } from "../../_components/settings/event-settings-form"
import { loadAdminEvent } from "../../_lib/load-event"

export default async function OpenSettingsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const event = await loadAdminEvent(slug)
  const counts = await getEventCounts({ eventId: event.id })

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <EventSettingsForm event={event} />
      <EventBannerCard event={event} />
      <DeleteEventCard event={event} entryCount={counts.get(event.id)?.entries ?? 0} />
    </div>
  )
}
