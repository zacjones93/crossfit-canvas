"use client"

import { X } from "lucide-react"
import { useServerAction } from "zsa-react"
import { assignOpenTeamCoachAction, unassignOpenTeamCoachAction } from "@/actions/open/teams.action"
import { Badge } from "@/components/ui/badge"
import { toastResult } from "@/components/open/action-error"
import { OptionSelect } from "@/components/open/selects"
import type { AdminOpenTeam, CoachOption } from "./types"

/** Coach badges (click × to unassign) plus a picker of coaches not yet on the team. */
export function TeamCoachesControl({ team, coaches }: { team: AdminOpenTeam; coaches: CoachOption[] }) {
  const { execute: assign, isPending: isAssigning } = useServerAction(assignOpenTeamCoachAction)
  const { execute: unassign, isPending: isUnassigning } = useServerAction(unassignOpenTeamCoachAction)
  const assignedIds = new Set(team.coaches.map(({ coach }) => coach.id))
  const available = coaches.filter((coach) => !assignedIds.has(coach.id))

  async function handleAssign(coachId: string) {
    const [, err] = await assign({ teamId: team.id, coachId })
    toastResult({ err, success: "Coach assigned", fallback: "Failed to assign coach" })
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
