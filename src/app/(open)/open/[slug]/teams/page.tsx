import type { Metadata, Route } from "next"
import Image from "next/image"
import Link from "next/link"
import { getCoachPhoto } from "@/lib/open/coach-photo"
import { initials, type PublicTeamCoach } from "@/lib/open/public-view"
import { Note, PublicShell, PUBLIC_SECTION } from "../../_components/public-shell"
import { CoachBadge, MemberList, Points } from "../../_components/team-members"
import { TeamPhoto } from "../../_components/team-photo"
import { loadEventBoard } from "../../_lib/load-event-board"
import { loadPublicEvent, previewRobots } from "../../_lib/load-public-event"

interface PageProps {
  params: Promise<{ slug: string }>
}

/** Cards in the first row(s) load eagerly (likely LCP); the rest lazy-load. */
const EAGER_PHOTOS = 3

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const { event, isPreview } = await loadPublicEvent(slug)
  return {
    title: `Teams · ${event.name}`,
    description: `Meet the teams competing in ${event.name} at CrossFit Canvas.`,
    robots: previewRobots(isPreview),
  }
}

export default async function TeamsPage({ params }: PageProps) {
  const { slug } = await params
  const { event, isPreview } = await loadPublicEvent(slug)
  const board = await loadEventBoard(event)
  const { teams } = board

  return (
    <PublicShell event={event} isPreview={isPreview} active={PUBLIC_SECTION.TEAMS}>
      {teams.length === 0 ? (
        <Note>Teams haven&apos;t been announced yet.</Note>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((team, index) => {
            // Coaches competing on the roster show (with points) in the coaches list instead
            const players = team.members.filter((member) => !member.isCoach)
            return (
              <li key={team.id}>
                <Link
                  href={`/open/${slug}/teams/${team.slug}` as Route}
                  className="group flex h-full flex-col overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-lg"
                >
                  <div className="relative">
                    <TeamPhoto
                      name={team.name}
                      color={team.color}
                      photoUrl={team.photoUrl}
                      width={640}
                      height={400}
                      loading={index < EAGER_PHOTOS ? "eager" : "lazy"}
                      className="aspect-[8/5] h-auto w-full"
                      initialsClassName="text-7xl"
                    />
                    <span className="absolute left-3 top-3 rounded-sm bg-black/80 px-2 py-0.5 font-heading text-xl text-white">
                      #{team.rank}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col gap-1 border-t-4 p-4" style={{ borderTopColor: team.color ?? undefined }}>
                    <h2 className="font-heading text-3xl uppercase leading-none tracking-wide group-hover:underline">{team.name}</h2>
                    {team.motto && <p className="text-sm italic text-muted-foreground">“{team.motto}”</p>}
                    {team.coaches.length > 0 && (
                      <ul aria-label="Coaches" className="mt-3 flex flex-col gap-2">
                        {team.coaches.map((coach) => (
                          <li key={coach.slug} className="flex items-center gap-2 text-sm">
                            <CoachAvatar coach={coach} />
                            <span className="min-w-0 flex-1 truncate font-semibold">{coach.name}</span>
                            <CoachBadge />
                            {coach.points !== undefined && <Points value={coach.points} className="w-14 shrink-0 text-right font-semibold" />}
                          </li>
                        ))}
                      </ul>
                    )}
                    {players.length > 0 && <MemberList members={players} className="mt-2 border-t" />}
                    <div className="mt-auto flex items-end justify-between pt-3 text-sm text-muted-foreground">
                      <span>
                        {team.memberCount} {team.memberCount === 1 ? "member" : "members"}
                      </span>
                      <span>
                        <span className="font-heading text-3xl leading-none text-foreground tabular-nums">{team.total}</span> pts
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </PublicShell>
  )
}

function CoachAvatar({ coach }: { coach: PublicTeamCoach }) {
  const photo = getCoachPhoto({ slug: coach.slug })
  return photo ? (
    <Image src={photo} alt="" width={32} height={32} sizes="32px" className="h-8 w-8 shrink-0 rounded-full object-cover object-top" />
  ) : (
    <span aria-hidden className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
      {initials(coach.name)}
    </span>
  )
}
