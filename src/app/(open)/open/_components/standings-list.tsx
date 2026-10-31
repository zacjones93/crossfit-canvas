import type { Route } from "next"
import Link from "next/link"
import { ChevronDown } from "lucide-react"
import { TeamSwatch } from "@/components/open/team-swatch"
import { STANDINGS_SORT, formatAverage, rankFor, type StandingsSort } from "@/lib/open/public-view"
import { cn } from "@/lib/utils"
import type { BoardTeam } from "../_lib/load-event-board"
import { MemberList } from "./team-members"
import { TeamPhoto } from "./team-photo"

interface StandingsListProps {
  /** Already in display order for `sort` (see `orderTeams`). */
  teams: BoardTeam[]
  slug: string
  sort: StandingsSort
}

/**
 * Ranked team standings; the sorted metric is the big number, the other one sits under it. Each row expands
 * (`<details>`, no client JS) into the team's members and total.
 */
export function StandingsList({ teams, slug, sort }: StandingsListProps) {
  const isAvg = sort === STANDINGS_SORT.AVG
  return (
    <ol className="flex flex-col gap-2">
      {teams.map((team, index) => {
        const rank = rankFor({ team, sort })
        const total = <span className="tabular-nums">{team.total}</span>
        const avg = <span className="tabular-nums">{formatAverage(team.avgPerMember)}</span>
        return (
          <li key={team.id} className={cn("rounded-lg border bg-card", rank === 1 && "border-open-accent")}>
            <div className="grid grid-cols-[2rem_3rem_1fr_auto] items-center gap-3 p-3 md:grid-cols-[3rem_3.5rem_1fr_auto] md:gap-4 md:p-4">
              <span className={cn("text-center font-heading text-3xl tabular-nums md:text-4xl", rank === 1 && "text-open-accent")} aria-label={`Rank ${rank}`}>
                {rank}
              </span>
              <TeamPhoto
                name={team.name}
                color={team.color}
                photoUrl={team.photoUrl}
                width={56}
                height={56}
                loading={index < 6 ? "eager" : "lazy"}
                className="h-12 w-12 rounded-md md:h-14 md:w-14"
                initialsClassName="text-xl"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <TeamSwatch color={team.color} className="h-2.5 w-2.5" />
                  <Link
                    href={`/open/${slug}/teams/${team.slug}` as Route}
                    className="line-clamp-2 min-w-0 font-open-heading text-sm font-bold uppercase leading-tight hover:underline sm:truncate sm:text-base md:text-lg md:tracking-wide"
                  >
                    {team.name}
                  </Link>
                </div>
                {team.motto && <p className="truncate text-xs italic text-muted-foreground md:text-sm">“{team.motto}”</p>}
                {team.members.length === 0 && <p className="text-xs text-muted-foreground">0 members</p>}
              </div>
              <div className="text-right">
                <p className="font-heading text-3xl leading-none md:text-4xl">
                  {isAvg ? avg : total}
                  <span className="ml-1 font-sans text-xs text-muted-foreground">{isAvg ? "avg" : "pts"}</span>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{isAvg ? <>{total} pts total</> : <>{avg} per member</>}</p>
              </div>
            </div>
            {team.members.length > 0 && (
              <details className="group border-t">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground md:px-4 [&::-webkit-details-marker]:hidden">
                  <span>
                    {team.memberCount} {team.memberCount === 1 ? "member" : "members"}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="group-open:hidden">Show</span>
                    <span className="hidden group-open:inline">Hide</span>
                    <ChevronDown className="h-3.5 w-3.5 transition-transform group-open:rotate-180" aria-hidden />
                  </span>
                </summary>
                <MemberList members={team.members} className="px-3 pb-2 md:px-4" />
                <p className="flex justify-between border-t px-3 py-2 text-sm font-bold md:px-4">
                  <span>Team total</span>
                  <span className="tabular-nums">{team.total} pts</span>
                </p>
              </details>
            )}
          </li>
        )
      })}
    </ol>
  )
}

/** Total / Average toggle as plain links (no client JS). */
export function SortLinks({ slug, sort }: { slug: string; sort: StandingsSort }) {
  const options = [
    { value: STANDINGS_SORT.TOTAL, label: "Total", href: `/open/${slug}` },
    { value: STANDINGS_SORT.AVG, label: "Avg / member", href: `/open/${slug}?sort=${STANDINGS_SORT.AVG}` },
  ]
  return (
    <nav aria-label="Sort standings" className="inline-flex rounded-md border p-0.5 text-sm">
      {options.map((option) => (
        <Link
          key={option.value}
          href={option.href as Route}
          scroll={false}
          aria-current={option.value === sort ? "true" : undefined}
          className={cn(
            "rounded-[5px] px-3 py-1.5 font-semibold transition-colors",
            option.value === sort ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {option.label}
        </Link>
      ))}
    </nav>
  )
}
