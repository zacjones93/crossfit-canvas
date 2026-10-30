"use client"

import type { ReactNode } from "react"
import { useServerAction } from "zsa-react"
import { createOpenScalingAction, updateOpenScalingAction } from "@/actions/open/scalings.action"
import { Input } from "@/components/ui/input"
import type { OpenScaling } from "@/db/schema"
import { toastResult } from "@/components/open/action-error"
import { Field } from "@/components/open/field"
import { FormDialog } from "@/components/open/form-dialog"
import { formInt, formText } from "@/lib/open/form-data"

interface ScalingFormDialogProps {
  eventId: string
  /** Edit this scaling; omit to create. */
  scaling?: OpenScaling
  /** Default rank for a new scaling (after the last one). */
  nextRank: number
  trigger: ReactNode
}

export function ScalingFormDialog({ eventId, scaling, nextRank, trigger }: ScalingFormDialogProps) {
  const { execute: createScaling } = useServerAction(createOpenScalingAction)
  const { execute: updateScaling } = useServerAction(updateOpenScalingAction)

  async function handleSubmit(formData: FormData) {
    const fields = {
      name: formText({ formData, name: "name" }) ?? "",
      slug: formText({ formData, name: "slug" }),
      rank: formInt({ formData, name: "rank" }) ?? nextRank,
      placementFirst: formInt({ formData, name: "placementFirst" }) ?? 0,
      placementStep: formInt({ formData, name: "placementStep" }) ?? 0,
      placementMin: formInt({ formData, name: "placementMin" }) ?? 0,
      placementPerTeam: formInt({ formData, name: "placementPerTeam" }) ?? 0,
    }
    const [, err] = scaling ? await updateScaling({ scalingId: scaling.id, ...fields }) : await createScaling({ eventId, ...fields })
    return toastResult({ err, success: scaling ? "Scaling updated" : "Scaling created", fallback: "Failed to save scaling" })
  }

  return (
    <FormDialog
      trigger={trigger}
      title={scaling ? `Edit ${scaling.name}` : "Add scaling level"}
      submitLabel={scaling ? "Save changes" : "Create scaling"}
      onSubmit={handleSubmit}
    >
      <Field id="scaling-name" label="Name *">
        <Input id="scaling-name" name="name" required defaultValue={scaling?.name} placeholder="Scaled" />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field id="scaling-slug" label="Slug" hint={scaling ? undefined : "Optional; from the name."}>
          <Input id="scaling-slug" name="slug" defaultValue={scaling?.slug} placeholder="scaled" />
        </Field>
        <Field id="scaling-rank" label="Rank *" hint="Lower ranks above higher (Rx = 0).">
          <Input id="scaling-rank" name="rank" type="number" required min={0} max={1000} defaultValue={scaling?.rank ?? nextRank} />
        </Field>
      </div>
      <fieldset className="flex flex-col gap-3 rounded-md border p-4">
        <legend className="px-1 text-sm font-medium">Placement points</legend>
        <p className="text-xs text-muted-foreground">
          Each workout ranks men and women in this scaling gym-wide. Place <em>p</em> earns 1st − step × (p − 1), never below the
          minimum; only each team&apos;s top N per gender count. 1st place 0 = off.
        </p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <PlacementInput name="placementFirst" label="1st place" defaultValue={scaling?.placementFirst} />
          <PlacementInput name="placementStep" label="Step" defaultValue={scaling?.placementStep} />
          <PlacementInput name="placementMin" label="Minimum" defaultValue={scaling?.placementMin} />
          <PlacementInput name="placementPerTeam" label="Top N / team" hint="0 = all" defaultValue={scaling?.placementPerTeam} />
        </div>
      </fieldset>
    </FormDialog>
  )
}

function PlacementInput({ name, label, hint, defaultValue }: { name: string; label: string; hint?: string; defaultValue?: number }) {
  const id = `scaling-${name}`
  return (
    <Field id={id} label={label} hint={hint}>
      <Input id={id} name={name} type="number" min={0} max={10000} defaultValue={defaultValue ?? 0} />
    </Field>
  )
}
