import { NuqsAdapter } from "nuqs/adapters/next/app"
import { AwardGrid } from "@/components/open/award-grid"
import { loadAwardGridData } from "@/server/open/grid-data"
import { loadAdminEvent } from "../../_lib/load-event"

export default async function OpenPointsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ week?: string }>
}) {
  const [{ slug }, { week }] = await Promise.all([params, searchParams])
  const event = await loadAdminEvent(slug)
  const { props } = await loadAwardGridData({
    scope: { isAdmin: true, manageableTeamIds: new Set(), event, teamId: null },
    week,
  })

  return (
    <NuqsAdapter>
      <AwardGrid {...props} />
    </NuqsAdapter>
  )
}
