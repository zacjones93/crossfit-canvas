import { AwardGrid } from "@/components/open/award-grid"
import { loadAwardGridData } from "@/server/open/grid-data"
import { ReadOnlyNotice } from "../../_components/read-only-notice"
import { loadWorkspaceTeam } from "../../_lib/load-workspace"

export default async function ManagePointsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; teamSlug: string }>
  searchParams: Promise<{ week?: string }>
}) {
  const [{ slug, teamSlug }, { week }] = await Promise.all([params, searchParams])
  const workspace = await loadWorkspaceTeam({ slug, teamSlug })
  if (!workspace) return null
  const { notice, props } = await loadAwardGridData({ scope: workspace.scope, week })

  return (
    <div className="flex flex-col gap-4">
      {notice && <ReadOnlyNotice message={notice} />}
      <AwardGrid {...props} />
    </div>
  )
}
