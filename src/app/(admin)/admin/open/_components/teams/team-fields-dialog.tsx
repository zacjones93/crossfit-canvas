"use client"

import { useState, type ReactNode } from "react"
import { useServerAction } from "zsa-react"
import { createOpenTeamAction, updateOpenTeamAction } from "@/actions/open/teams.action"
import { toastResult } from "@/components/open/action-error"
import { Field } from "@/components/open/field"
import { FormDialog } from "@/components/open/form-dialog"
import { Input } from "@/components/ui/input"
import { formInt, formText } from "@/lib/open/form-data"
import type { AdminOpenTeam } from "./types"

interface TeamFieldsDialogProps {
  eventId: string
  /** Edit this team; omit to create. */
  team?: AdminOpenTeam
  trigger: ReactNode
}

/** Admin-only team fields (name, slug, color, sort order). Motto/description/photo are the team profile. */
export function TeamFieldsDialog({ eventId, team, trigger }: TeamFieldsDialogProps) {
  const { execute: createTeam } = useServerAction(createOpenTeamAction)
  const { execute: updateTeam } = useServerAction(updateOpenTeamAction)

  async function handleSubmit(formData: FormData) {
    const fields = {
      name: formText({ formData, name: "name" }) ?? "",
      slug: formText({ formData, name: "slug" }),
      color: formText({ formData, name: "color" }) ?? null,
      sortOrder: formInt({ formData, name: "sortOrder" }),
    }
    const [, err] = team ? await updateTeam({ teamId: team.id, ...fields }) : await createTeam({ eventId, ...fields })
    return toastResult({ err, success: team ? "Team updated" : "Team created", fallback: "Failed to save team" })
  }

  return (
    <FormDialog
      trigger={trigger}
      title={team ? `Edit ${team.name}` : "Add team"}
      description={team ? undefined : "Add a photo, motto, and description from the team card once it's created."}
      submitLabel={team ? "Save changes" : "Create team"}
      onSubmit={handleSubmit}
    >
      <Field id="team-name" label="Name *">
        <Input id="team-name" name="name" required defaultValue={team?.name} placeholder="Team Burpee" />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field id="team-slug" label="Slug" hint={team ? undefined : "Optional; derived from the name."}>
          <Input id="team-slug" name="slug" defaultValue={team?.slug} placeholder="team-burpee" />
        </Field>
        <Field id="team-sort-order" label="Sort order">
          <Input id="team-sort-order" name="sortOrder" type="number" defaultValue={team?.sortOrder ?? 0} />
        </Field>
      </div>
      <ColorField defaultValue={team?.color ?? ""} />
    </FormDialog>
  )
}

const HEX_COLOR = /^#[0-9a-f]{6}$/i

/** Text field for any CSS color, plus a picker that fills it with a hex value. Blank = no color. */
function ColorField({ defaultValue }: { defaultValue: string }) {
  const [color, setColor] = useState(defaultValue)

  return (
    <Field id="team-color" label="Color" hint="Any CSS color, e.g. #ef4444. Leave blank for none.">
      <div className="flex items-center gap-2">
        <input
          type="color"
          aria-label="Pick a color"
          value={HEX_COLOR.test(color) ? color : "#000000"}
          onChange={(event) => setColor(event.target.value)}
          className="h-10 w-12 shrink-0 cursor-pointer rounded-md border bg-background p-1"
        />
        <Input id="team-color" name="color" value={color} onChange={(event) => setColor(event.target.value)} placeholder="#ef4444" />
      </div>
    </Field>
  )
}
