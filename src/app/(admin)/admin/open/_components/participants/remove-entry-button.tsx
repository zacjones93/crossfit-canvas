"use client"

import { useState } from "react"
import { UserMinus } from "lucide-react"
import { useServerAction } from "zsa-react"
import { removeOpenEntryAction } from "@/actions/open/roster.action"
import { Button } from "@/components/ui/button"
import { actionErrorMessage, hasErrorCode, toastResult } from "@/components/open/action-error"
import { ConfirmDialog } from "@/components/open/confirm-dialog"
import type { AdminOpenEntry } from "./types"

/**
 * Removes an athlete from the event (the person record is kept). The first attempt refuses when
 * they have awards/scores; the dialog then shows the server's count and offers a forced removal.
 */
export function RemoveEntryButton({ entry }: { entry: AdminOpenEntry }) {
  const [open, setOpen] = useState(false)
  const [forceReason, setForceReason] = useState<string | null>(null)
  const { execute, isPending } = useServerAction(removeOpenEntryAction)
  const name = entry.participant.name

  async function handleConfirm() {
    const force = forceReason !== null
    const [data, err] = await execute({ entryId: entry.id, force })
    if (!force && hasErrorCode({ err, code: "PRECONDITION_FAILED" })) {
      setForceReason(actionErrorMessage({ err, fallback: `${name} has awards or scores` }))
      return
    }
    const deleted = data && data.deletedAwards + data.deletedScores > 0
      ? ` (deleted ${data.deletedAwards} award(s), ${data.deletedScores} score(s))`
      : ""
    if (toastResult({ err, success: `Removed ${name}${deleted}`, fallback: "Failed to remove athlete" })) setOpen(false)
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={(next) => {
        if (isPending) return
        setOpen(next)
        if (!next) setForceReason(null)
      }}
      trigger={
        <Button variant="ghost" size="icon" aria-label={`Remove ${name}`}>
          <UserMinus className="h-4 w-4 text-destructive" />
        </Button>
      }
      title={forceReason ? "Remove anyway?" : "Remove athlete"}
      description={
        forceReason ? (
          <>
            <p>{forceReason}.</p>
            <p>
              Removing <strong>{name}</strong> permanently deletes those awards and scores (each deletion is recorded in the
              audit log). Their person record is kept.
            </p>
          </>
        ) : (
          <p>
            Remove <strong>{name}</strong> from this event? Their person record is kept for other events.
          </p>
        )
      }
      confirmLabel={forceReason ? "Delete awards & scores and remove" : "Remove"}
      isPending={isPending}
      onConfirm={handleConfirm}
    />
  )
}
