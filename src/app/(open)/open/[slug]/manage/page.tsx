import type { Route } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { ChevronRight } from "lucide-react"
import { TeamSwatch } from "@/components/open/team-swatch"
import { loadWorkspace } from "./_lib/load-workspace"

export default async function ManageTeamPickerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { event, teams } = await loadWorkspace(slug)
  if (teams.length === 0) return null
  if (teams.length === 1) redirect(`/open/${event.slug}/manage/${teams[0].slug}/points` as Route)

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">Pick a team</h2>
      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {teams.map((team) => (
          <li key={team.id}>
            <Link
              href={`/open/${event.slug}/manage/${team.slug}/points` as Route}
              className="flex min-h-14 items-center justify-between gap-3 rounded-md border px-4 py-3 transition-colors hover:bg-muted"
            >
              <span className="flex items-center gap-2 font-medium">
                <TeamSwatch color={team.color} />
                {team.name}
              </span>
              <ChevronRight aria-hidden className="h-4 w-4 text-muted-foreground" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
