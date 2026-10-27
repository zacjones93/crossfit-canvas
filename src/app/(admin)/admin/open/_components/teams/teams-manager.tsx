"use client"

import Image from "next/image"
import { Pencil, Plus, Trash2, UserRoundPen, Users } from "lucide-react"
import { useServerAction } from "zsa-react"
import { deleteOpenTeamAction } from "@/actions/open/teams.action"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { teamPhotoUrl } from "@/lib/open/team-photo"
import { toastResult } from "@/components/open/action-error"
import { ConfirmButton } from "@/components/open/confirm-dialog"
import { TeamSwatch } from "@/components/open/team-swatch"
import { TeamCoachesControl } from "./team-coaches-control"
import { TeamFieldsDialog } from "./team-fields-dialog"
import { TeamProfileDialog } from "./team-profile-dialog"
import type { AdminOpenTeam, CoachOption } from "./types"

interface TeamsManagerProps {
  eventId: string
  teams: AdminOpenTeam[]
  memberCounts: Record<string, number>
  /** coachId → team of the coach's entry in this event (null = no team); absent = not entered */
  coachEntryTeams: Record<string, string | null>
  coaches: CoachOption[]
}

export function TeamsManager({ eventId, teams, memberCounts, coachEntryTeams, coaches }: TeamsManagerProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">{teams.length} team(s)</p>
        <TeamFieldsDialog
          eventId={eventId}
          trigger={
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add team
            </Button>
          }
        />
      </div>

      {teams.length === 0 ? (
        <div className="rounded-md border border-dashed p-10 text-center text-muted-foreground">No teams yet.</div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {teams.map((team) => (
            <TeamCard
              key={team.id}
              eventId={eventId}
              team={team}
              memberCount={memberCounts[team.id] ?? 0}
              coachEntryTeams={coachEntryTeams}
              coaches={coaches}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function TeamCard({
  eventId,
  team,
  memberCount,
  coachEntryTeams,
  coaches,
}: {
  eventId: string
  team: AdminOpenTeam
  memberCount: number
  coachEntryTeams: Record<string, string | null>
  coaches: CoachOption[]
}) {
  const photoUrl = teamPhotoUrl(team.photoKey)
  const { execute: deleteTeam } = useServerAction(deleteOpenTeamAction)

  async function handleDelete() {
    const [, err] = await deleteTeam({ teamId: team.id })
    return toastResult({ err, success: `Deleted "${team.name}"`, fallback: "Failed to delete team" })
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-4 sm:flex-row">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md border bg-muted">
          {photoUrl ? (
            <Image src={photoUrl} alt={`${team.name} photo`} fill sizes="96px" className="object-cover" unoptimized />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <Users className="h-8 w-8" />
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <TeamSwatch color={team.color} />
                <h3 className="truncate font-semibold">{team.name}</h3>
              </div>
              <p className="text-xs text-muted-foreground">
                {team.slug} · order {team.sortOrder} · {memberCount} member(s)
              </p>
              {team.motto && <p className="mt-1 text-sm italic">&ldquo;{team.motto}&rdquo;</p>}
            </div>
            <div className="flex shrink-0 gap-1">
              <TeamFieldsDialog
                eventId={eventId}
                team={team}
                trigger={
                  <Button variant="ghost" size="icon" aria-label={`Edit ${team.name}`}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                }
              />
              <ConfirmButton
                trigger={
                  <Button variant="ghost" size="icon" aria-label={`Delete ${team.name}`}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                }
                title="Delete team"
                description={
                  <>
                    <p>
                      Delete <strong>{team.name}</strong>? Coach assignments and the team photo go with it.
                    </p>
                    {memberCount > 0 && <p>It still has {memberCount} athlete(s); move them to another team first.</p>}
                  </>
                }
                onConfirm={handleDelete}
              />
            </div>
          </div>

          <div>
            <TeamProfileDialog
              eventId={eventId}
              team={team}
              trigger={
                <Button variant="outline" size="sm">
                  <UserRoundPen className="mr-2 h-4 w-4" />
                  Edit profile
                </Button>
              }
            />
          </div>
          <TeamCoachesControl eventId={eventId} team={team} coaches={coaches} coachEntryTeams={coachEntryTeams} />
        </div>
      </CardContent>
    </Card>
  )
}
