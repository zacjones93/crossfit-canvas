"use client"

import { useServerAction } from "zsa-react"
import { deleteOpenEventFromAdminAction } from "../../../_actions/open-event-navigation.action"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { OpenEvent } from "@/db/schema"
import { OPEN_EVENT_STATUS } from "@/lib/open/constants"
import { toastResult } from "@/components/open/action-error"
import { ConfirmButton } from "@/components/open/confirm-dialog"

/** Only empty draft events can be deleted; the server re-checks (and its error is shown) either way. */
export function DeleteEventCard({ event, entryCount }: { event: OpenEvent; entryCount: number }) {
  const { execute } = useServerAction(deleteOpenEventFromAdminAction)
  const isDraft = event.status === OPEN_EVENT_STATUS.DRAFT
  const canDelete = isDraft && entryCount === 0

  async function handleDelete() {
    // Success redirects from the action to the events list; only failures resolve here
    const [, err] = await execute({ eventId: event.id })
    return toastResult({ err, success: `Deleted "${event.name}"`, fallback: "Failed to delete event" })
  }

  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <CardTitle className="text-destructive">Danger zone</CardTitle>
        <CardDescription>
          Deleting removes the event with its weeks, teams, rules, scalings, and workouts. Only draft events without athletes
          can be deleted; close an event instead to retire it.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {canDelete
            ? "This event can be deleted."
            : !isDraft
              ? "Set the status to draft to delete this event."
              : `Remove its ${entryCount} athlete(s) first.`}
        </p>
        <ConfirmButton
          trigger={
            <Button variant="destructive" disabled={!canDelete}>
              Delete event
            </Button>
          }
          title="Delete event"
          description={
            <p>
              Permanently delete <strong>{event.name}</strong> and everything in it? This can&apos;t be undone.
            </p>
          }
          onConfirm={handleDelete}
        />
      </CardContent>
    </Card>
  )
}
