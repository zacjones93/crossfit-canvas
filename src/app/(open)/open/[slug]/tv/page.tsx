import type { Metadata } from "next"
import { STANDINGS_SORT, orderTeams, parseStandingsSort } from "@/lib/open/public-view"
import { teamPhotoUrl } from "@/lib/open/team-photo"
import { cn } from "@/lib/utils"
import { TvStandings } from "../../_components/tv-standings"
import { loadEventBoard } from "../../_lib/load-event-board"
import { loadPublicEvent, previewRobots } from "../../_lib/load-public-event"
import { openThemeClass } from "../../_lib/theme"

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const REFRESH_SECONDS = 60

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const { event, isPreview } = await loadPublicEvent(slug)
  return {
    title: `${event.name} · TV`,
    description: `Big-screen team standings for ${event.name}.`,
    robots: previewRobots(isPreview),
  }
}

/** Big-screen standings for the gym TV: no site chrome, large type, reloads every minute. */
export default async function TvPage({ params, searchParams }: PageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams])
  const { event, isPreview } = await loadPublicEvent(slug)
  const board = await loadEventBoard(event)
  const sort = parseStandingsSort(query.sort)

  const bannerUrl = teamPhotoUrl(event.bannerKey)

  return (
    <div className={cn("dark min-h-screen bg-black px-4 py-6 sm:px-6 sm:py-8 text-white lg:px-12 lg:py-10", openThemeClass(event.theme))}>
      <meta httpEquiv="refresh" content={String(REFRESH_SECONDS)} />
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        {bannerUrl ? (
          <div className="min-w-0 flex-1">
            {/* eslint-disable-next-line @next/next/no-img-element -- R2 media, immutable */}
            <img src={bannerUrl} alt="" width={1200} height={576} className="h-28 w-auto max-w-full object-cover object-top sm:h-36 lg:h-52" />
            <h1 className="sr-only">{event.name}</h1>
            {isPreview && <p className="mt-2 text-lg font-semibold uppercase tracking-widest text-amber-400">Draft preview</p>}
          </div>
        ) : (
          <div>
            <p className="text-lg font-semibold uppercase tracking-widest text-white/60 lg:text-xl">
              CrossFit Canvas Open {event.year}
              {isPreview && <span className="ml-3 text-amber-400">Draft preview</span>}
            </p>
            <h1 className="font-open-display text-6xl uppercase leading-none tracking-wide lg:text-8xl">{event.name}</h1>
            <div className="mt-3 h-1 w-32 bg-open-accent" aria-hidden />
          </div>
        )}
        <p className="text-xl uppercase tracking-widest text-white/60 lg:text-2xl">
          {sort === STANDINGS_SORT.AVG ? "Avg points / member" : "Total points"}
        </p>
      </header>
      {board.teams.length === 0 ? (
        <p className="text-3xl text-white/60">Teams haven&apos;t been announced yet.</p>
      ) : (
        <TvStandings teams={orderTeams({ teams: board.teams, sort })} sort={sort} />
      )}
    </div>
  )
}
