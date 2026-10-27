"use client"

import type { ReactNode } from "react"
import { useServerAction } from "zsa-react"
import { updateOpenEntryAction } from "@/actions/open/roster.action"
import { Input } from "@/components/ui/input"
import { toastResult } from "@/components/open/action-error"
import { Field } from "@/components/open/field"
import { FormDialog } from "@/components/open/form-dialog"
import { formOptionalId, formText, NONE } from "@/lib/open/form-data"
import { OptionalIdSelect } from "@/components/open/selects"
import type { AdminOpenEntry, TeamOption } from "./types"

interface EntryFormDialogProps {
  entry: AdminOpenEntry
  teams: TeamOption[]
  coaches: TeamOption[]
  trigger: ReactNode
}

/**
 * Edit an athlete: name/email/coach link (the person, shared across events) and division/team (this event).
 */
export function EntryFormDialog({ entry, teams, coaches, trigger }: EntryFormDialogProps) {
  const { execute } = useServerAction(updateOpenEntryAction)

  async function handleSubmit(formData: FormData) {
    const [, err] = await execute({
      entryId: entry.id,
      name: formText({ formData, name: "name" }) ?? "",
      email: formText({ formData, name: "email" }) ?? null,
      coachId: formOptionalId({ formData, name: "coachId" }),
      division: formText({ formData, name: "division" }) ?? null,
      teamId: formOptionalId({ formData, name: "teamId" }),
    })
    return toastResult({ err, success: "Athlete updated", fallback: "Failed to update athlete" })
  }

  return (
    <FormDialog
      trigger={trigger}
      title={`Edit ${entry.participant.name}`}
      description="Name and email belong to the person and are shared with their other events."
      submitLabel="Save changes"
      onSubmit={handleSubmit}
    >
      <Field id="entry-name" label="Name *">
        <Input id="entry-name" name="name" required defaultValue={entry.participant.name} />
      </Field>
      <Field id="entry-email" label="Email">
        <Input id="entry-email" name="email" type="email" defaultValue={entry.participant.email ?? ""} />
      </Field>
      <Field
        id="entry-coach"
        label="Coach profile"
        hint="Same person as this coach. They show as Coach on teams the coach is assigned to."
      >
        <OptionalIdSelect
          id="entry-coach"
          name="coachId"
          defaultValue={entry.participant.coachId ?? NONE}
          items={coaches}
          noneLabel="Not a coach"
        />
      </Field>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field id="entry-team" label="Team">
          <OptionalIdSelect id="entry-team" name="teamId" defaultValue={entry.teamId ?? NONE} items={teams} noneLabel="No team" />
        </Field>
        <Field id="entry-division" label="Division">
          <Input id="entry-division" name="division" defaultValue={entry.division ?? ""} placeholder="e.g. Masters 40+" />
        </Field>
      </div>
    </FormDialog>
  )
}
