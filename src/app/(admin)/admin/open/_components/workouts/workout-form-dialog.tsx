"use client"

import { useState, type ReactNode } from "react"
import { toast } from "sonner"
import { useServerAction } from "zsa-react"
import { createOpenWorkoutAction, updateOpenWorkoutAction } from "@/actions/open/workouts.action"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import type { OpenWorkout } from "@/db/schema"
import { OPEN_SCORE_TYPE } from "@/lib/open/constants"
import { formatTime, parseTime } from "@/lib/open/score-codec"
import { toastResult } from "@/components/open/action-error"
import { Field, SwitchField } from "@/components/open/field"
import { FormDialog } from "@/components/open/form-dialog"
import { formBool, formInt, formOptionalId, formText, NONE } from "@/lib/open/form-data"
import { OptionalIdSelect, ScoreTypeSelect } from "@/components/open/selects"

interface WorkoutFormDialogProps {
  eventId: string
  /** Edit this workout; omit to create. */
  workout?: OpenWorkout
  weeks: { id: string; label: string }[]
  trigger: ReactNode
}

/** "mm:ss" (or "h:mm:ss") → whole seconds; null when blank; an error message when invalid. */
function parseTimeCap(text: string | undefined): { seconds: number | null } | { error: string } {
  if (!text) return { seconds: null }
  const parsed = parseTime(text)
  if (!parsed.ok) return { error: `Time cap: ${parsed.error}` }
  if (parsed.value % 1000 !== 0) return { error: "Time cap must be whole seconds" }
  return { seconds: parsed.value / 1000 }
}

export function WorkoutFormDialog({ eventId, workout, weeks, trigger }: WorkoutFormDialogProps) {
  const { execute: createWorkout } = useServerAction(createOpenWorkoutAction)
  const { execute: updateWorkout } = useServerAction(updateOpenWorkoutAction)

  async function handleSubmit(formData: FormData) {
    const timeCap = parseTimeCap(formText({ formData, name: "timeCap" }))
    if ("error" in timeCap) {
      toast.error(timeCap.error)
      return false
    }
    const scoreType = formText({ formData, name: "scoreType" }) ?? OPEN_SCORE_TYPE.TIME
    const fields = {
      name: formText({ formData, name: "name" }) ?? "",
      slug: formText({ formData, name: "slug" }),
      weekId: formOptionalId({ formData, name: "weekId" }),
      description: formText({ formData, name: "description" }) ?? null,
      scoreType,
      timeCapSeconds: timeCap.seconds,
      // Only rounds + reps workouts use it; leave any stored value alone otherwise
      repsPerRound: scoreType === OPEN_SCORE_TYPE.ROUNDS_REPS ? (formInt({ formData, name: "repsPerRound" }) ?? null) : undefined,
      hasTiebreak: formBool({ formData, name: "hasTiebreak" }),
      sortOrder: formInt({ formData, name: "sortOrder" }),
    }
    const [, err] = workout ? await updateWorkout({ workoutId: workout.id, ...fields }) : await createWorkout({ eventId, ...fields })
    return toastResult({ err, success: workout ? "Workout updated" : "Workout created", fallback: "Failed to save workout" })
  }

  return (
    <FormDialog
      trigger={trigger}
      title={workout ? `Edit ${workout.name}` : "Add workout"}
      description={workout ? "Score type, time cap, and reps per round can't change once the workout has scores." : undefined}
      submitLabel={workout ? "Save changes" : "Create workout"}
      onSubmit={handleSubmit}
    >
      <WorkoutFields workout={workout} weeks={weeks} />
    </FormDialog>
  )
}

function WorkoutFields({ workout, weeks }: { workout?: OpenWorkout; weeks: { id: string; label: string }[] }) {
  const [scoreType, setScoreType] = useState<string>(workout?.scoreType ?? OPEN_SCORE_TYPE.TIME)

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <Field id="workout-name" label="Name *">
          <Input id="workout-name" name="name" required defaultValue={workout?.name} placeholder="26.1" />
        </Field>
        <Field id="workout-slug" label="Slug" hint={workout ? undefined : "Optional; from the name."}>
          <Input id="workout-slug" name="slug" defaultValue={workout?.slug} placeholder="26-1" />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field id="workout-week" label="Week">
          <OptionalIdSelect id="workout-week" name="weekId" defaultValue={workout?.weekId ?? NONE} items={weeks} noneLabel="No week" />
        </Field>
        <Field id="workout-sort-order" label="Sort order">
          <Input id="workout-sort-order" name="sortOrder" type="number" defaultValue={workout?.sortOrder ?? 0} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field id="workout-score-type" label="Score type">
          <ScoreTypeSelect id="workout-score-type" name="scoreType" value={scoreType} onValueChange={setScoreType} />
        </Field>
        <Field id="workout-time-cap" label="Time cap" hint="mm:ss, blank for none.">
          <Input
            id="workout-time-cap"
            name="timeCap"
            placeholder="12:00"
            inputMode="numeric"
            defaultValue={workout?.timeCapSeconds ? formatTime(workout.timeCapSeconds * 1000) : ""}
          />
        </Field>
      </div>
      {scoreType === OPEN_SCORE_TYPE.ROUNDS_REPS && (
        <Field id="workout-reps-per-round" label="Reps per round *">
          <Input id="workout-reps-per-round" name="repsPerRound" type="number" min={1} required defaultValue={workout?.repsPerRound ?? ""} />
        </Field>
      )}
      <SwitchField id="workout-tiebreak" label="Tiebreak" hint="Athletes can enter a tiebreak time.">
        <Switch id="workout-tiebreak" name="hasTiebreak" defaultChecked={workout?.hasTiebreak ?? false} />
      </SwitchField>
      <Field id="workout-description" label="Description">
        <Textarea id="workout-description" name="description" rows={4} defaultValue={workout?.description ?? ""} />
      </Field>
    </>
  )
}
