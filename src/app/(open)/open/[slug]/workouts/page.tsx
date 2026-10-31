import type { Metadata, Route } from "next"
import Link from "next/link"
import { Note, PublicShell, PUBLIC_SECTION } from "../../_components/public-shell"
import { WorkoutMeta } from "../../_components/workout-meta"
import { loadEventBoard } from "../../_lib/load-event-board"
import { loadPublicEvent, previewRobots } from "../../_lib/load-public-event"

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const { event, isPreview } = await loadPublicEvent(slug)
  return {
    title: `Workouts · ${event.name}`,
    description: `Workouts and leaderboards for ${event.name} at CrossFit Canvas.`,
    robots: previewRobots(isPreview),
  }
}

export default async function WorkoutsPage({ params }: PageProps) {
  const { slug } = await params
  const { event, isPreview } = await loadPublicEvent(slug)
  const board = await loadEventBoard(event)
  const weekLabelById = new Map(board.weeks.map((week) => [week.id, week.label]))

  return (
    <PublicShell event={event} isPreview={isPreview} active={PUBLIC_SECTION.WORKOUTS}>
      {board.workouts.length === 0 ? (
        <Note>Workouts will be announced each week.</Note>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {board.workouts.map((workout) => (
            <li key={workout.id}>
              <Link
                href={`/open/${slug}/workouts/${workout.slug}` as Route}
                className="group flex h-full flex-col gap-3 rounded-lg border bg-card p-5 transition-shadow hover:shadow-lg"
              >
                <h2 className="font-open-heading text-4xl uppercase leading-none tracking-wide group-hover:underline">
                  {workout.name}
                </h2>
                <WorkoutMeta workout={workout} weekLabel={workout.weekId ? weekLabelById.get(workout.weekId) : undefined} />
                {workout.description && (
                  <p className="line-clamp-4 whitespace-pre-line text-sm text-muted-foreground">{workout.description}</p>
                )}
                <span className="mt-auto text-sm font-semibold">
                  {event.showIndividuals ? "Leaderboard →" : "Details →"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </PublicShell>
  )
}
