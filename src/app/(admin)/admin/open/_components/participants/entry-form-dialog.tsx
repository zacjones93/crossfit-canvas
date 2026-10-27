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

/** Edit an athlete: name/email (the person, shared across events) and division/team (this event). */
export function EntryFormDialog({ entry, teams, trigger }: { entry: AdminOpenEntry; teams: TeamOption[]; trigger: ReactNode }) {
  const { execute } = useServerAction(updateOpenEntryAction)

  async function handleSubmit(formData: FormData) {
    const [, err] = await execute({
      entryId: entry.id,
      name: formText({ formData, name: "name" }) ?? "",
      email: formText({ formData, name: "email" }) ?? null,
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
