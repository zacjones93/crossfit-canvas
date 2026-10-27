import type { Metadata } from "next"
import Image from "next/image"
import { notFound } from "next/navigation"
import { cache } from "react"
import { getCoachPhoto } from "@/lib/open/coach-photo"
import { formatAverage, initials, tiebreakLabel, weekColumns } from "@/lib/open/public-view"
import { formatScore } from "@/lib/open/score-codec"
import { teamPhotoUrl } from "@/lib/open/team-photo"
import { getPublicTeam, getPublicTeamRoster } from "@/server/open/public"
import { Note, PublicShell, PUBLIC_SECTION, SectionHeading } from "../../../_components/public-shell"
import { TeamPhoto } from "../../../_components/team-photo"
import { loadEventBoard } from "../../../_lib/load-event-board"
import { loadPublicEvent, previewRobots } from "../../../_lib/load-public-event"

interface PageProps {
  params: Promise<{ slug: string; teamSlug: string }>
}

/** Event + team (404 if missing) + board, deduped across generateMetadata and the page. */
const loadTeam = cache(async (slug: string, teamSlug: string) => {
  const { event, isPreview } = await loadPublicEvent(slug)
  const [team, board] = await Promise.all([getPublicTeam({ eventId: event.id, slug: teamSlug }), loadEventBoard(event)])
  if (!team) notFound()
  return { event, isPreview, team, board }
})

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, teamSlug } = await params
  const { event, isPreview, team } = await loadTeam(slug, teamSlug)
  return {
    title: `${team.name} · ${event.name}`,
    description: team.motto ?? `${team.name}: roster, points, and scores in ${event.name} at CrossFit Canvas.`,
    robots: previewRobots(isPreview),
  }
}

export default async function TeamPage({ params }: PageProps) {
  const { slug, teamSlug } = await params
  const { event, isPreview, team, board } = await loadTeam(slug, teamSlug)
  const roster = await getPublicTeamRoster({ eventId: event.id, teamId: team.id, withScores: event.showIndividuals })

  const standing = board.teams.find((item) => item.id === team.id)
  const columns = standing ? weekColumns({ weeks: board.weeks, teams: [standing] }) : []
  const scoreByKey = new Map(roster.scores.map((score) => [`${score.entryId}:${score.workoutId}`, score]))
  const workouts = event.showIndividuals ? board.workouts : []

  return (
    <PublicShell event={event} isPreview={isPreview} active={PUBLIC_SECTION.TEAMS} title={team.name}>
      <section aria-label="Team profile" className="grid gap-6 md:grid-cols-[minmax(0,22rem)_1fr] md:gap-10">
        <TeamPhoto
          name={team.name}
          color={team.color}
          photoUrl={teamPhotoUrl(team.photoKey)}
          width={704}
          height={528}
          loading="eager"
          alt={`${team.name} team photo`}
          className="aspect-[4/3] h-auto w-full rounded-lg"
          initialsClassName="text-8xl"
        />
        <div className="flex flex-col gap-4">
          {team.motto && <p className="font-subheading text-xl font-bold italic md:text-2xl">“{team.motto}”</p>}
          {team.description && <p className="whitespace-pre-line text-muted-foreground">{team.description}</p>}
          <dl className="mt-auto grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Rank" value={standing ? `#${standing.rank}` : "–"} hint={`of ${board.teams.length}`} />
            <Stat label="Total" value={String(standing?.total ?? 0)} hint="points" />
            <Stat label="Avg / member" value={formatAverage(standing?.avgPerMember ?? 0)} hint="points" />
            <Stat label="Members" value={String(roster.members.length)} />
          </dl>
        </div>
      </section>

      {team.coaches.length > 0 && (
        <section aria-labelledby="coaches">
          <SectionHeading>
            <span id="coaches">{team.coaches.length === 1 ? "Coach" : "Coaches"}</span>
          </SectionHeading>
          <ul className="grid gap-4 md:grid-cols-2">
            {team.coaches.map((coach) => (
              <CoachCard key={coach.slug} coach={coach} />
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="roster">
        <SectionHeading>
          <span id="roster">Roster</span>
        </SectionHeading>
        {roster.members.length === 0 ? (
          <Note>No athletes on this team yet.</Note>
        ) : event.showIndividuals ? (
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full min-w-max text-sm">
              <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th scope="col" className="sticky left-0 bg-muted px-3 py-2 text-left font-semibold">
                    Athlete
                  </th>
                  <th scope="col" className="px-3 py-2 text-right font-semibold">
                    Points
                  </th>
                  {workouts.map((workout) => (
                    <th key={workout.id} scope="col" className="px-3 py-2 text-right font-semibold">
                      {workout.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Index keys: entry ids stay server-side (keys are serialized into the page payload) */}
                {roster.members.map((member, index) => (
                  <tr key={index} className="border-t">
                    <th scope="row" className="sticky left-0 bg-background px-3 py-2 text-left font-semibold">
                      {member.name}
                    </th>
                    <td className="px-3 py-2 text-right font-bold tabular-nums">{board.pointsByEntry.get(member.entryId) ?? 0}</td>
                    {workouts.map((workout) => {
                      const score = scoreByKey.get(`${member.entryId}:${workout.id}`)
                      const tiebreak = score && tiebreakLabel({ workout, tiebreakMs: score.tiebreakMs })
                      return (
                        <td key={workout.id} className="px-3 py-2 text-right tabular-nums">
                          {score ? (
                            <>
                              {formatScore({ score, workout, weightUnit: event.weightUnit })}
                              <span className="ml-1.5 text-xs text-muted-foreground">{score.scalingName}</span>
                              {tiebreak && <span className="ml-1.5 text-xs text-muted-foreground">{tiebreak}</span>}
                            </>
                          ) : (
                            <span className="text-muted-foreground">–</span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-2 rounded-lg border p-4 sm:grid-cols-3 lg:grid-cols-4">
              {roster.members.map((member, index) => (
                <li key={index} className="truncate font-semibold">
                  {member.name}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-muted-foreground">Individual points and scores are hidden for this event.</p>
          </>
        )}
      </section>

      {standing && columns.length > 0 && (
        <section aria-labelledby="by-week">
          <SectionHeading>
            <span id="by-week">Week by week</span>
          </SectionHeading>
          <ol className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {columns.map((column) => (
              <li key={column.key} className="rounded-lg border bg-card p-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">{column.label}</p>
                <p className="font-heading text-4xl leading-none tabular-nums">
                  {standing.byWeek[column.key] ?? 0}
                  <span className="ml-1 font-sans text-xs text-muted-foreground">pts</span>
                </p>
              </li>
            ))}
          </ol>
        </section>
      )}
    </PublicShell>
  )
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-lg border bg-card p-3">
      <dt className="text-xs uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="font-heading text-4xl leading-none tabular-nums">
        {value}
        {hint && <span className="ml-1 font-sans text-xs text-muted-foreground">{hint}</span>}
      </dd>
    </div>
  )
}

interface PublicCoach {
  name: string
  slug: string
  credentials: string | null
  bio: string | null
}

function CoachCard({ coach }: { coach: PublicCoach }) {
  const photo = getCoachPhoto({ slug: coach.slug })
  return (
    <li className="flex gap-4 rounded-lg border bg-card p-4">
      {photo ? (
        <Image
          src={photo}
          alt={coach.name}
          width={96}
          height={96}
          sizes="96px"
          className="h-20 w-20 shrink-0 rounded-md object-cover object-top md:h-24 md:w-24"
        />
      ) : (
        <div
          aria-hidden
          className="flex h-20 w-20 shrink-0 items-center justify-center rounded-md bg-muted font-heading text-3xl text-muted-foreground md:h-24 md:w-24"
        >
          {initials(coach.name)}
        </div>
      )}
      <div className="min-w-0">
        <h3 className="font-heading text-2xl uppercase leading-none tracking-wide">{coach.name}</h3>
        {coach.credentials && <p className="mt-1 text-sm font-semibold">{coach.credentials}</p>}
        {coach.bio && (
          <details className="group mt-2 text-sm">
            <summary className="cursor-pointer text-muted-foreground hover:text-foreground">Read bio</summary>
            <p className="mt-2 whitespace-pre-line text-muted-foreground">{coach.bio}</p>
          </details>
        )}
      </div>
    </li>
  )
}
