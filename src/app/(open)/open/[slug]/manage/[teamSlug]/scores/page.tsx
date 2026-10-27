import { ScoreGrid } from "@/components/open/score-grid"
import { loadScoreGridData } from "@/server/open/grid-data"
import { ReadOnlyNotice } from "../../_components/read-only-notice"
import { loadWorkspaceTeam } from "../../_lib/load-workspace"

export default async function ManageScoresPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; teamSlug: string }>
  searchParams: Promise<{ workout?: string }>
}) {
  const [{ slug, teamSlug }, { workout }] = await Promise.all([params, searchParams])
  const workspace = await loadWorkspaceTeam({ slug, teamSlug })
  if (!workspace) return null
  const { notice, props } = await loadScoreGridData({ scope: workspace.scope, workout })

  return (
    <div className="flex flex-col gap-4">
      {notice && <ReadOnlyNotice message={notice} />}
      <ScoreGrid {...props} />
    </div>
  )
}
