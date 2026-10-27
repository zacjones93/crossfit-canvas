"use client"

import { UserPlus, X } from "lucide-react"
import { toast } from "sonner"
import { useServerAction } from "zsa-react"
import { addCoachToRosterAction } from "@/actions/open/roster.action"
import { assignOpenTeamCoachAction, unassignOpenTeamCoachAction } from "@/actions/open/teams.action"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { toastResult } from "@/components/open/action-error"
import { OptionSelect } from "@/components/open/selects"
import type { AdminOpenTeam, CoachOption } from "./types"

interface TeamCoachesControlProps {
  eventId: string
  team: AdminOpenTeam
  coaches: CoachOption[]
  /** coachId → team of the coach's entry in this event (null = no team); absent = not entered */
  coachEntryTeams: Record<string, string | null>
}

/**
 * Coach badges (click × to unassign), a picker of coaches not yet on the team, and "Add to roster" for
 * assigned coaches who aren't competing on this team (coaches compete too; their points count).
 */
export function TeamCoachesControl({ eventId, team, coaches, coachEntryTeams }: TeamCoachesControlProps) {
  const { execute: assign, isPending: isAssigning } = useServerAction(assignOpenTeamCoachAction)
  const { execute: unassign, isPending: isUnassigning } = useServerAction(unassignOpenTeamCoachAction)
  const { execute: addToRoster, isPending: isAddingToRoster } = useServerAction(addCoachToRosterAction)
  const assignedIds = new Set(team.coaches.map(({ coach }) => coach.id))
  const available = coaches.filter((coach) => !assignedIds.has(coach.id))
  const offRoster = team.coaches.filter(({ coach }) => coachEntryTeams[coach.id] !== team.id)

  async function handleAddToRoster(coach: { id: string; name: string }) {
    const [, err] = await addToRoster({ eventId, teamId: team.id, coachId: coach.id })
    toastResult({ err, success: `${coach.name} is on the roster`, fallback: "Failed to add coach to roster" })
  }

  async function handleAssign(coachId: string) {
    const [data, err] = await assign({ teamId: team.id, coachId })
    if (toastResult({ err, success: "Coach assigned", fallback: "Failed to assign coach" })) {
      for (const note of data?.notes ?? []) toast.info(note)
    }
  }

  async function handleUnassign(coach: { id: string; name: string }) {
    const [, err] = await unassign({ teamId: team.id, coachId: coach.id })
    toastResult({ err, success: `Unassigned ${coach.name}`, fallback: "Failed to unassign coach" })
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Coaches</div>
      <div className="flex flex-wrap items-center gap-2">
        {team.coaches.length === 0 && <span className="text-sm text-muted-foreground">None assigned</span>}
        {team.coaches.map(({ coach }) => (
          <Badge key={coach.id} variant="secondary" className="gap-1 pr-1">
            {coach.name}
            {!coach.userId && <span className="font-normal text-muted-foreground">(no login)</span>}
            {coachEntryTeams[coach.id] === team.id && <span className="font-normal text-muted-foreground">· on roster</span>}
            <button
              type="button"
              aria-label={`Unassign ${coach.name}`}
              disabled={isUnassigning}
              onClick={() => handleUnassign(coach)}
              className="rounded-full p-0.5 hover:bg-background/60"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
      {offRoster.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {offRoster.map(({ coach }) => (
            <Button
              key={coach.id}
              type="button"
              variant="outline"
              size="sm"
              disabled={isAddingToRoster}
              onClick={() => handleAddToRoster(coach)}
              title={coach.id in coachEntryTeams ? "Moves their entry (and points) to this team" : undefined}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              {coach.id in coachEntryTeams ? `Move ${coach.name} to roster` : `Add ${coach.name} to roster`}
            </Button>
          ))}
        </div>
      )}
      {available.length > 0 && (
        <OptionSelect
          // Reset to the placeholder after each pick
          key={team.coaches.length}
          placeholder={isAssigning ? "Assigning..." : "Assign a coach..."}
          disabled={isAssigning}
          onValueChange={handleAssign}
          options={available.map((coach) => ({ value: coach.id, label: coach.name }))}
          className="h-9 w-full sm:w-64"
        />
      )}
    </div>
  )
}
