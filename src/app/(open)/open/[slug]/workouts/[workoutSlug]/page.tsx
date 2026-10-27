import type { Metadata, Route } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { tiebreakLabel } from "@/lib/open/public-view"
import { formatScore, rankScores } from "@/lib/open/score-codec"
import { cn } from "@/lib/utils"
import { getPublicWorkoutScores, type PublicWorkout } from "@/server/open/public"
import { Note, PublicShell, PUBLIC_SECTION, SectionHeading } from "../../../_components/public-shell"
import { WorkoutMeta } from "../../../_components/workout-meta"
import { loadEventBoard } from "../../../_lib/load-event-board"
import { loadPublicEvent, previewRobots } from "../../../_lib/load-public-event"

interface PageProps {
  params: Promise<{ slug: string; workoutSlug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

async function loadWorkout({ slug, workoutSlug }: { slug: string; workoutSlug: string }) {
  const { event, isPreview } = await loadPublicEvent(slug)
  const board = await loadEventBoard(event)
  const workout = board.workouts.find((item) => item.slug === workoutSlug)
  if (!workout) notFound()
  return { event, isPreview, board, workout }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { event, isPreview, workout } = await loadWorkout(await params)
  return {
    title: `${workout.name} · ${event.name}`,
    description: `${workout.name} workout and leaderboard for ${event.name} at CrossFit Canvas.`,
    robots: previewRobots(isPreview),
  }
}

export default async function WorkoutPage({ params, searchParams }: PageProps) {
  const [{ slug, workoutSlug }, query] = await Promise.all([params, searchParams])
  const { event, isPreview, board, workout } = await loadWorkout({ slug, workoutSlug })
  const weekLabel = workout.weekId ? board.weeks.find((week) => week.id === workout.weekId)?.label : undefined

  return (
    <PublicShell event={event} isPreview={isPreview} active={PUBLIC_SECTION.WORKOUTS} title={workout.name}>
      <section aria-label="Workout" className="flex max-w-3xl flex-col gap-4">
        <WorkoutMeta workout={workout} weekLabel={weekLabel} />
        {workout.description && <p className="whitespace-pre-line text-base leading-relaxed md:text-lg">{workout.description}</p>}
      </section>

      <section aria-labelledby="leaderboard">
        {event.showIndividuals ? (
          <Leaderboard
            slug={slug}
            eventId={event.id}
            workout={workout}
            weightUnit={event.weightUnit}
            scalings={board.scalings}
            scaling={typeof query.scaling === "string" ? query.scaling : undefined}
          />
        ) : (
          <>
            <SectionHeading>
              <span id="leaderboard">Leaderboard</span>
            </SectionHeading>
            <Note>Individual results are hidden for this event — team standings are on the leaderboard.</Note>
          </>
        )}
      </section>
    </PublicShell>
  )
}

async function Leaderboard({
  slug,
  eventId,
  workout,
  weightUnit,
  scalings,
  scaling,
}: {
  slug: string
  eventId: string
  workout: PublicWorkout
  weightUnit: string
  scalings: { name: string; slug: string }[]
  scaling: string | undefined
}) {
  const active = scalings.find((item) => item.slug === scaling)
  const allScores = await getPublicWorkoutScores({ eventId, workoutId: workout.id })
  const scores = rankScores({
    scores: active ? allScores.filter((score) => score.scalingSlug === active.slug) : allScores,
    workout,
  })
  const base = `/open/${slug}/workouts/${workout.slug}`
  const filters = [{ label: "All", slug: undefined }, ...scalings.map((item) => ({ label: item.name, slug: item.slug }))]

  return (
    <>
      <SectionHeading
        aside={
          scalings.length > 1 && (
            <nav aria-label="Filter by scaling" className="inline-flex flex-wrap rounded-md border p-0.5 text-sm">
              {filters.map((filter) => {
                const isActive = filter.slug === active?.slug
                return (
                    <Link
                      key={filter.label}
                      href={(filter.slug ? `${base}?scaling=${filter.slug}` : base) as Route}
                      scroll={false}
                      aria-current={isActive ? "true" : undefined}
                      className={cn(
                        "rounded-[5px] px-3 py-1.5 font-semibold transition-colors",
                        isActive ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {filter.label}
                    </Link>
                  )
                })}
              </nav>
            )
          }
        >
          <span id="leaderboard">Leaderboard</span>
        </SectionHeading>
        {scores.length === 0 ? (
          <Note>No scores {active ? `in ${active.name} ` : ""}yet.</Note>
        ) : (
          <ol className="divide-y rounded-lg border">
            {scores.map((score) => {
              const tiebreak = tiebreakLabel({ workout, tiebreakMs: score.tiebreakMs })
              return (
              <li key={score.id} className="grid grid-cols-[2.5rem_1fr_auto] items-center gap-3 px-4 py-3">
                <span className="font-heading text-2xl tabular-nums">{score.rank}</span>
                <div className="min-w-0">
                  <p className="truncate font-semibold">{score.participantName}</p>
                  <p className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                    {score.teamSlug && score.teamName && (
                      <Link
                        href={`/open/${slug}/teams/${score.teamSlug}` as Route}
                        className="inline-flex items-center gap-1.5 hover:text-foreground"
                      >
                        <span
                          aria-hidden
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: score.teamColor ?? "transparent" }}
                        />
                        {score.teamName}
                      </Link>
                    )}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-heading text-2xl leading-none tabular-nums">
                    {formatScore({ score, workout, weightUnit })}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    <span className="rounded-sm border px-1.5 py-px font-semibold uppercase tracking-wider">{score.scalingName}</span>
                    {tiebreak && <span className="ml-2">{tiebreak}</span>}
                  </p>
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </>
  )
}
