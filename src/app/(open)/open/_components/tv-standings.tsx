import { STANDINGS_SORT, formatAverage, rankFor, type StandingsSort } from "@/lib/open/public-view"
import { cn } from "@/lib/utils"
import type { BoardTeam } from "../_lib/load-event-board"
import { TeamPhoto } from "./team-photo"

/** Big-screen standings rows for the gym TV: large type, photos, no links. Teams already in display order. */
export function TvStandings({ teams, sort }: { teams: BoardTeam[]; sort: StandingsSort }) {
  const isAvg = sort === STANDINGS_SORT.AVG
  return (
    <ol className="flex flex-col gap-4">
      {teams.map((team) => {
        const rank = rankFor({ team, sort })
        return (
          <li
            key={team.id}
            className={cn(
              "grid grid-cols-[2.5rem_1fr_auto] items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3 sm:grid-cols-[3rem_5rem_1fr_auto] sm:gap-4 sm:p-4 lg:grid-cols-[5rem_7rem_1fr_auto]",
              rank === 1 && "border-crimson",
            )}
          >
            <span className="text-center font-heading text-5xl tabular-nums lg:text-7xl">{rank}</span>
            {/* Photo hidden on narrow screens so the team name keeps its room */}
            <div className="hidden sm:block">
              <TeamPhoto
                name={team.name}
                color={team.color}
                photoUrl={team.photoUrl}
                width={112}
                height={112}
                loading="eager"
                className="h-20 w-20 rounded-md lg:h-28 lg:w-28"
                initialsClassName="text-4xl lg:text-5xl"
              />
            </div>
            <div className="min-w-0">
              <p className="truncate font-subheading text-2xl font-bold sm:text-3xl lg:text-5xl">{team.name}</p>
              {team.motto && <p className="mt-1 truncate text-base italic text-white/60 sm:text-xl lg:text-2xl">“{team.motto}”</p>}
              <p className="mt-1 text-sm text-white/60 sm:text-lg lg:text-xl">
                {team.memberCount} {team.memberCount === 1 ? "member" : "members"}
              </p>
            </div>
            <div className="text-right">
              <p className="font-heading text-5xl leading-none tabular-nums sm:text-6xl lg:text-8xl">
                {isAvg ? formatAverage(team.avgPerMember) : team.total}
              </p>
              <p className="mt-1 whitespace-nowrap text-sm text-white/60 sm:text-lg lg:text-2xl">
                {isAvg ? `${team.total} pts total` : `${formatAverage(team.avgPerMember)} per member`}
              </p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
