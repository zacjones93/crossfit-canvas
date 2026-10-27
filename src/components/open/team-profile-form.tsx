"use client"

import type { FormEvent } from "react"
import { useServerAction } from "zsa-react"
import { updateTeamProfileAction } from "@/actions/open/team-profile.action"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { formText } from "@/lib/open/form-data"
import { OPEN_TEAM_MOTTO_MAX } from "@/schemas/open.schema"
import { toastResult } from "./action-error"
import { Field } from "./field"

interface TeamProfileFormProps {
  eventId: string
  team: { id: string; motto: string | null; description: string | null }
  /** Called after a successful save (e.g. to close a dialog). */
  onSaved?: () => void
}

/** Team motto + description (admins on any team, coaches on teams they coach). Blank clears a field. */
export function TeamProfileForm({ eventId, team, onSaved }: TeamProfileFormProps) {
  const { execute, isPending } = useServerAction(updateTeamProfileAction)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const [, err] = await execute({
      eventId,
      teamId: team.id,
      motto: formText({ formData, name: "motto" }) ?? null,
      description: formText({ formData, name: "description" }) ?? null,
    })
    if (toastResult({ err, success: "Team profile saved", fallback: "Failed to save team profile" })) onSaved?.()
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <Field id={`team-motto-${team.id}`} label="Motto" hint={`Up to ${OPEN_TEAM_MOTTO_MAX} characters.`}>
        <Input id={`team-motto-${team.id}`} name="motto" maxLength={OPEN_TEAM_MOTTO_MAX} defaultValue={team.motto ?? ""} />
      </Field>
      <Field id={`team-description-${team.id}`} label="Description">
        <Textarea id={`team-description-${team.id}`} name="description" rows={4} defaultValue={team.description ?? ""} />
      </Field>
      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save profile"}
        </Button>
      </div>
    </form>
  )
}
