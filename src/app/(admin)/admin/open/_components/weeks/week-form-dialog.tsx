"use client"

import type { ReactNode } from "react"
import { useServerAction } from "zsa-react"
import { createOpenWeekAction, updateOpenWeekAction } from "@/actions/open/weeks.action"
import { Input } from "@/components/ui/input"
import type { OpenWeek } from "@/db/schema"
import { toastResult } from "@/components/open/action-error"
import { Field } from "@/components/open/field"
import { FormDialog } from "@/components/open/form-dialog"
import { formDate, formInt, formText, toDateInputValue } from "@/lib/open/form-data"

interface WeekFormDialogProps {
  eventId: string
  /** Edit this week; omit to create. */
  week?: OpenWeek
  trigger: ReactNode
}

export function WeekFormDialog({ eventId, week, trigger }: WeekFormDialogProps) {
  const { execute: createWeek } = useServerAction(createOpenWeekAction)
  const { execute: updateWeek } = useServerAction(updateOpenWeekAction)

  async function handleSubmit(formData: FormData) {
    const fields = {
      number: formInt({ formData, name: "number" }),
      label: formText({ formData, name: "label" }),
      startsAt: formDate({ formData, name: "startsAt" }),
    }
    const [, err] = week ? await updateWeek({ weekId: week.id, ...fields }) : await createWeek({ eventId, ...fields })
    return toastResult({ err, success: week ? "Week updated" : "Week created", fallback: "Failed to save week" })
  }

  return (
    <FormDialog trigger={trigger} title={week ? `Edit ${week.label}` : "Add week"} submitLabel={week ? "Save changes" : "Create week"} onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 gap-4">
        <Field id="week-number" label={week ? "Number *" : "Number"} hint={week ? undefined : "Defaults to the next number."}>
          <Input id="week-number" name="number" type="number" min={1} max={52} required={!!week} defaultValue={week?.number} />
        </Field>
        <Field id="week-starts-at" label="Starts">
          <Input id="week-starts-at" name="startsAt" type="date" defaultValue={toDateInputValue(week?.startsAt)} />
        </Field>
      </div>
      <Field id="week-label" label={week ? "Label *" : "Label"} hint={week ? undefined : 'Defaults to "Week <number>".'}>
        <Input id="week-label" name="label" required={!!week} defaultValue={week?.label} placeholder="Week 1 (26.1)" />
      </Field>
    </FormDialog>
  )
}
