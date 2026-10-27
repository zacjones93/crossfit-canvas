"use client"

import type { Route } from "next"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { useServerAction } from "zsa-react"
import { createOpenEventAction } from "@/actions/open/events.action"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { OPEN_WEIGHT_UNIT } from "@/lib/open/constants"
import { toastResult } from "@/components/open/action-error"
import { Field } from "@/components/open/field"
import { FormDialog } from "@/components/open/form-dialog"
import { formInt, formText } from "@/lib/open/form-data"
import { WeightUnitSelect } from "@/components/open/selects"

export function CreateEventDialog() {
  const router = useRouter()
  const { execute } = useServerAction(createOpenEventAction)

  async function handleSubmit(formData: FormData) {
    const [data, err] = await execute({
      name: formText({ formData, name: "name" }) ?? "",
      slug: formText({ formData, name: "slug" }),
      year: formInt({ formData, name: "year" }) ?? new Date().getFullYear(),
      weekCount: formInt({ formData, name: "weekCount" }) ?? 0,
      weightUnit: formText({ formData, name: "weightUnit" }),
    })
    const ok = toastResult({ err, success: "Event created", fallback: "Failed to create event" })
    if (ok && data) router.push(`/admin/open/${data.slug}` as Route)
    return ok
  }

  return (
    <FormDialog
      trigger={
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create event
        </Button>
      }
      title="Create Open event"
      description="Starts as a draft with default rules and scaling levels (copied from the latest event when there is one)."
      submitLabel="Create event"
      onSubmit={handleSubmit}
    >
      <Field id="event-name" label="Name *">
        <Input id="event-name" name="name" required placeholder="CrossFit Open 2027" />
      </Field>
      <Field id="event-slug" label="Slug" hint="Optional; derived from the name. Used in /open/<slug>.">
        <Input id="event-slug" name="slug" placeholder="open-2027" />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field id="event-year" label="Year *">
          <Input id="event-year" name="year" type="number" required min={2000} max={2100} defaultValue={new Date().getFullYear()} />
        </Field>
        <Field id="event-weeks" label="Weeks">
          <Input id="event-weeks" name="weekCount" type="number" min={0} max={52} defaultValue={3} />
        </Field>
      </div>
      <Field id="event-weight-unit" label="Weight unit">
        <WeightUnitSelect id="event-weight-unit" name="weightUnit" defaultValue={OPEN_WEIGHT_UNIT.LB} />
      </Field>
    </FormDialog>
  )
}
