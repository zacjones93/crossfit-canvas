import { NuqsAdapter } from "nuqs/adapters/next/app"
import { ScoreGrid } from "@/components/open/score-grid"
import { loadScoreGridData } from "@/server/open/grid-data"
import { loadAdminEvent } from "../../_lib/load-event"

export default async function OpenScoresPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ workout?: string }>
}) {
  const [{ slug }, { workout }] = await Promise.all([params, searchParams])
  const event = await loadAdminEvent(slug)
  const { props } = await loadScoreGridData({
    scope: { isAdmin: true, manageableTeamIds: new Set(), event, teamId: null },
    workout,
  })

  return (
    <NuqsAdapter>
      <ScoreGrid {...props} />
    </NuqsAdapter>
  )
}
