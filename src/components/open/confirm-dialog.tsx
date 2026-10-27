"use client"

import { useState, type ReactNode } from "react"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  trigger?: ReactNode
  title: string
  description: ReactNode
  confirmLabel?: string
  isPending?: boolean
  destructive?: boolean
  onConfirm: () => void
}

/** Controlled confirm dialog that stays open while the action runs (close it from the caller on success). */
export function ConfirmDialog({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  confirmLabel = "Delete",
  isPending = false,
  destructive = true,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      {trigger && <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2 text-sm text-muted-foreground">{description}</div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <Button variant={destructive ? "destructive" : "default"} onClick={onConfirm} disabled={isPending}>
            {isPending ? "Working..." : confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

interface ConfirmButtonProps extends Omit<ConfirmDialogProps, "open" | "onOpenChange" | "onConfirm" | "isPending" | "trigger"> {
  trigger: ReactNode
  /** Resolve true to close the dialog. */
  onConfirm: () => Promise<boolean>
}

/** Trigger + ConfirmDialog with its own open/pending state. */
export function ConfirmButton({ onConfirm, ...props }: ConfirmButtonProps) {
  const [open, setOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)

  async function handleConfirm() {
    setIsPending(true)
    try {
      if (await onConfirm()) setOpen(false)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <ConfirmDialog
      {...props}
      open={open}
      onOpenChange={(next) => !isPending && setOpen(next)}
      isPending={isPending}
      onConfirm={handleConfirm}
    />
  )
}
