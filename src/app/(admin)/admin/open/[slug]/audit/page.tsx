import { NuqsAdapter } from "nuqs/adapters/next/app"
import { openAuditEntityTuple } from "@/lib/open/constants"
import { getAuditLog } from "@/server/open/audit"
import { AuditLog } from "../../_components/audit/audit-log"
import { loadAdminEvent } from "../../_lib/load-event"

function param(value: string | string[] | undefined): string | undefined {
  const text = Array.isArray(value) ? value[0] : value
  return text?.trim() || undefined
}

export default async function OpenAuditPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const [{ slug }, query] = await Promise.all([params, searchParams])
  const event = await loadAdminEvent(slug)
  const entityType = param(query.entityType)
  const filters = {
    actorUserId: param(query.actor),
    entityType: entityType && openAuditEntityTuple.includes(entityType) ? entityType : undefined,
    entityId: param(query.entityId),
  }
  const firstPage = await getAuditLog({ eventId: event.id, ...filters })

  return (
    <NuqsAdapter>
      {/* Keyed by the filters so "Load more" state resets when they change */}
      <AuditLog key={JSON.stringify(filters)} eventId={event.id} filters={filters} firstPage={firstPage} />
    </NuqsAdapter>
  )
}
