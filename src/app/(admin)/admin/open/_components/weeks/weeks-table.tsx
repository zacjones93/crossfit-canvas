"use client"

import { Lock, Pencil, Plus, Trash2 } from "lucide-react"
import { useServerAction } from "zsa-react"
import { deleteOpenWeekAction, lockOpenWeekAction, unlockOpenWeekAction } from "@/actions/open/weeks.action"
import { LocalTime } from "@/components/open/local-time"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { OpenWeek } from "@/db/schema"
import { toastResult } from "@/components/open/action-error"
import { ConfirmButton } from "@/components/open/confirm-dialog"
import { WeekFormDialog } from "./week-form-dialog"

export function WeeksTable({ eventId, weeks }: { eventId: string; weeks: OpenWeek[] }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">Locking a week stops coach edits for it; admins are unaffected.</p>
        <WeekFormDialog
          eventId={eventId}
          trigger={
            <Button className="shrink-0">
              <Plus className="mr-2 h-4 w-4" />
              Add week
            </Button>
          }
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Label</TableHead>
              <TableHead className="hidden sm:table-cell">Starts</TableHead>
              <TableHead>Locked</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {weeks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No weeks yet.
                </TableCell>
              </TableRow>
            ) : (
              weeks.map((week) => <WeekRow key={week.id} eventId={eventId} week={week} />)
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function WeekRow({ eventId, week }: { eventId: string; week: OpenWeek }) {
  const { execute: lockWeek, isPending: isLocking } = useServerAction(lockOpenWeekAction)
  const { execute: unlockWeek, isPending: isUnlocking } = useServerAction(unlockOpenWeekAction)
  const { execute: deleteWeek } = useServerAction(deleteOpenWeekAction)
  const isLocked = !!week.lockedAt

  async function handleLockChange(lock: boolean) {
    const [, err] = lock ? await lockWeek({ weekId: week.id }) : await unlockWeek({ weekId: week.id })
    toastResult({ err, success: `${week.label} ${lock ? "locked" : "unlocked"}`, fallback: "Failed to update week" })
  }

  async function handleDelete() {
    const [, err] = await deleteWeek({ weekId: week.id })
    return toastResult({ err, success: `Deleted ${week.label}`, fallback: "Failed to delete week" })
  }

  return (
    <TableRow>
      <TableCell className="tabular-nums">{week.number}</TableCell>
      <TableCell className="font-medium">{week.label}</TableCell>
      <TableCell className="hidden sm:table-cell">
        {week.startsAt ? <LocalTime value={week.startsAt} format="PP" /> : <span className="text-muted-foreground">--</span>}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Switch
            checked={isLocked}
            disabled={isLocking || isUnlocking}
            onCheckedChange={handleLockChange}
            aria-label={`Lock ${week.label}`}
          />
          {isLocked && week.lockedAt && (
            <span className="hidden items-center gap-1 text-xs text-muted-foreground md:inline-flex">
              <Lock className="h-3 w-3" />
              <LocalTime value={week.lockedAt} format="PP p" />
            </span>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex justify-end gap-1">
          <WeekFormDialog
            eventId={eventId}
            week={week}
            trigger={
              <Button variant="ghost" size="icon" aria-label={`Edit ${week.label}`}>
                <Pencil className="h-4 w-4" />
              </Button>
            }
          />
          <ConfirmButton
            trigger={
              <Button variant="ghost" size="icon" aria-label={`Delete ${week.label}`}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            }
            title="Delete week"
            description={
              <p>
                Delete <strong>{week.label}</strong>? Weeks with workouts or awards can&apos;t be deleted; move or delete those first.
              </p>
            }
            onConfirm={handleDelete}
          />
        </div>
      </TableCell>
    </TableRow>
  )
}
