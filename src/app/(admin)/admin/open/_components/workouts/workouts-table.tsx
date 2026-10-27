"use client"

import { Pencil, Plus, Trash2 } from "lucide-react"
import { useServerAction } from "zsa-react"
import { deleteOpenWorkoutAction } from "@/actions/open/workouts.action"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { OpenWorkout } from "@/db/schema"
import { formatTime } from "@/lib/open/score-codec"
import { toastResult } from "@/components/open/action-error"
import { ConfirmButton } from "@/components/open/confirm-dialog"
import { labelFor, SCORE_TYPE_LABEL } from "@/lib/open/labels"
import { WorkoutFormDialog } from "./workout-form-dialog"

interface WeekOption {
  id: string
  label: string
}

export function WorkoutsTable({ eventId, workouts, weeks }: { eventId: string; workouts: OpenWorkout[]; weeks: WeekOption[] }) {
  const weekLabel = new Map(weeks.map((week) => [week.id, week.label]))

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">{workouts.length} workout(s)</p>
        <WorkoutFormDialog
          eventId={eventId}
          weeks={weeks}
          trigger={
            <Button className="shrink-0">
              <Plus className="mr-2 h-4 w-4" />
              Add workout
            </Button>
          }
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Workout</TableHead>
              <TableHead className="hidden sm:table-cell">Week</TableHead>
              <TableHead>Score</TableHead>
              <TableHead className="hidden md:table-cell">Time cap</TableHead>
              <TableHead className="hidden md:table-cell text-right">Order</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {workouts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No workouts yet.
                </TableCell>
              </TableRow>
            ) : (
              workouts.map((workout) => (
                <WorkoutRow
                  key={workout.id}
                  eventId={eventId}
                  workout={workout}
                  weeks={weeks}
                  weekLabel={workout.weekId ? weekLabel.get(workout.weekId) : undefined}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function WorkoutRow({
  eventId,
  workout,
  weeks,
  weekLabel,
}: {
  eventId: string
  workout: OpenWorkout
  weeks: WeekOption[]
  weekLabel?: string
}) {
  const { execute: deleteWorkout } = useServerAction(deleteOpenWorkoutAction)

  async function handleDelete() {
    const [, err] = await deleteWorkout({ workoutId: workout.id })
    return toastResult({ err, success: `Deleted ${workout.name}`, fallback: "Failed to delete workout" })
  }

  return (
    <TableRow>
      <TableCell>
        <div className="font-medium">{workout.name}</div>
        <div className="text-xs text-muted-foreground">{workout.slug}</div>
      </TableCell>
      <TableCell className="hidden sm:table-cell">{weekLabel ?? <span className="text-muted-foreground">--</span>}</TableCell>
      <TableCell>
        <div className="flex flex-wrap items-center gap-1">
          <Badge variant="outline">{labelFor({ labels: SCORE_TYPE_LABEL, value: workout.scoreType })}</Badge>
          {workout.repsPerRound && <span className="text-xs text-muted-foreground">{workout.repsPerRound}/rd</span>}
          {workout.hasTiebreak && <Badge variant="secondary">Tiebreak</Badge>}
        </div>
      </TableCell>
      <TableCell className="hidden tabular-nums md:table-cell">
        {workout.timeCapSeconds ? formatTime(workout.timeCapSeconds * 1000) : <span className="text-muted-foreground">--</span>}
      </TableCell>
      <TableCell className="hidden text-right tabular-nums md:table-cell">{workout.sortOrder}</TableCell>
      <TableCell>
        <div className="flex justify-end gap-1">
          <WorkoutFormDialog
            eventId={eventId}
            workout={workout}
            weeks={weeks}
            trigger={
              <Button variant="ghost" size="icon" aria-label={`Edit ${workout.name}`}>
                <Pencil className="h-4 w-4" />
              </Button>
            }
          />
          <ConfirmButton
            trigger={
              <Button variant="ghost" size="icon" aria-label={`Delete ${workout.name}`}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            }
            title="Delete workout"
            description={
              <p>
                Delete <strong>{workout.name}</strong>? Workouts with scores can&apos;t be deleted; clear the scores first.
              </p>
            }
            onConfirm={handleDelete}
          />
        </div>
      </TableCell>
    </TableRow>
  )
}
