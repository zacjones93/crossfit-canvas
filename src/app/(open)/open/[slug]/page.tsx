import type { Metadata, Route } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Monitor } from "lucide-react"
import { RULE_CADENCE_LABEL, labelFor } from "@/lib/open/labels"
import { STANDINGS_SORT, orderTeams, parseStandingsSort, weekColumns } from "@/lib/open/public-view"
import { cn } from "@/lib/utils"
import { Note, PublicShell, PUBLIC_SECTION, SectionHeading } from "../_components/public-shell"
import { SortLinks, StandingsList } from "../_components/standings-list"
import { WeekTable } from "../_components/week-table"
import { loadEventBoard, type BoardTeam } from "../_lib/load-event-board"
import { loadPublicEvent, previewRobots } from "../_lib/load-public-event"

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}


export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const { event, isPreview } = await loadPublicEvent(slug)
  return {
    title: `${event.name} Leaderboard`,
    description: `Live team standings, week-by-week points, and scoring rules for ${event.name} at CrossFit Canvas.`,
    robots: previewRobots(isPreview),
  }
}

export default async function LeaderboardPage({ params, searchParams }: PageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams])
  const sort = parseStandingsSort(query.sort)
  const sortQuery = sort === STANDINGS_SORT.AVG ? `?sort=${STANDINGS_SORT.AVG}` : ""
  // Convenience alias for the TV route
  if (query.tv === "1") redirect(`/open/${slug}/tv${sortQuery}` as Route)

  const { event, isPreview } = await loadPublicEvent(slug)
  const board = await loadEventBoard(event)
  const ranked = orderTeams({ teams: board.teams, sort })
  const columns = weekColumns({ weeks: board.weeks, teams: board.teams })
  const teamById = new Map(board.teams.map((team) => [team.id, team]))
  const { topIndividuals } = board

  return (
    <PublicShell event={event} isPreview={isPreview} active={PUBLIC_SECTION.LEADERBOARD}>
      <section aria-labelledby="standings">
        <SectionHeading aside={<SortLinks slug={slug} sort={sort} />}>
          <span id="standings">Team standings</span>
        </SectionHeading>
        {ranked.length === 0 ? <Note>Teams haven&apos;t been announced yet.</Note> : <StandingsList teams={ranked} slug={slug} sort={sort} />}
        <p className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>Avg / member = team points ÷ roster size, so smaller teams can compete.</span>
          <Link href={`/open/${slug}/tv${sortQuery}` as Route} className="inline-flex items-center gap-1 font-semibold hover:text-foreground">
            <Monitor className="h-3.5 w-3.5" aria-hidden /> TV mode
          </Link>
        </p>
      </section>

      {columns.length > 0 && board.teams.length > 0 && (
        <section aria-labelledby="by-week">
          <SectionHeading>
            <span id="by-week">Week by week</span>
          </SectionHeading>
          <WeekTable teams={board.teams} columns={columns} slug={slug} />
        </section>
      )}

      <div className={cn("grid gap-12", topIndividuals.length > 0 && "lg:grid-cols-2")}>
        <section aria-labelledby="how-points-work">
          <SectionHeading>
            <span id="how-points-work">How points work</span>
          </SectionHeading>
          {board.rules.length === 0 ? (
            <Note>Point rules are coming soon.</Note>
          ) : (
            <ul className="divide-y rounded-lg border">
              {board.rules.map((rule) => (
                <li key={rule.id} className="flex items-start justify-between gap-4 p-4">
                  <div className="min-w-0">
                    <p className="font-subheading font-bold">
                      {rule.name}
                      {!rule.isActive && (
                        <span className="ml-2 rounded-sm border px-1.5 py-px align-middle text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Retired
                        </span>
                      )}
                    </p>
                    {rule.description && <p className="text-sm text-muted-foreground">{rule.description}</p>}
                    <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
                      {labelFor({ labels: RULE_CADENCE_LABEL, value: rule.cadence })}
                    </p>
                  </div>
                  <p className="shrink-0 font-heading text-3xl leading-none">
                    {rule.points > 0 ? `+${rule.points}` : rule.points}
                    <span className="ml-1 font-sans text-xs text-muted-foreground">pts</span>
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        {topIndividuals.length > 0 && (
          <section aria-labelledby="top-individuals">
            <SectionHeading>
              <span id="top-individuals">Top {topIndividuals.length} athletes</span>
            </SectionHeading>
            <ol className="divide-y rounded-lg border">
              {topIndividuals.map((individual, index) => {
                const team = individual.teamId ? teamById.get(individual.teamId) : undefined
                return (
                  // Index keys: entry ids stay server-side (keys are serialized into the page payload)
                  <li key={index} className="grid grid-cols-[2rem_1fr_auto] items-center gap-3 px-4 py-3">
                    <span className="font-heading text-2xl tabular-nums">{individual.rank}</span>
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{individual.name}</p>
                      {team && <TeamTag team={team} slug={slug} />}
                    </div>
                    <p className="font-heading text-2xl tabular-nums">
                      {individual.total}
                      <span className="ml-1 font-sans text-xs text-muted-foreground">pts</span>
                    </p>
                  </li>
                )
              })}
            </ol>
          </section>
        )}
      </div>
    </PublicShell>
  )
}

function TeamTag({ team, slug }: { team: Pick<BoardTeam, "name" | "slug" | "color">; slug: string }) {
  return (
    <Link
      href={`/open/${slug}/teams/${team.slug}` as Route}
      className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
    >
      <span aria-hidden className="h-2 w-2 rounded-full" style={{ backgroundColor: team.color ?? "transparent" }} />
      {team.name}
    </Link>
  )
}
