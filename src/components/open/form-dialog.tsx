"use client"

import { useState, type FormEvent, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface FormDialogProps {
  trigger: ReactNode
  title: string
  description?: ReactNode
  submitLabel: string
  /** Resolve true to close the dialog (success), false to keep it open (error already reported). */
  onSubmit: (formData: FormData) => Promise<boolean>
  children: ReactNode
  className?: string
}

/**
 * Dialog + uncontrolled form shell shared by the Open admin create/edit forms. Fields mount with the
 * dialog content, so `defaultValue`s reset every time it opens.
 */
export function FormDialog({ trigger, title, description, submitLabel, onSubmit, children, className }: FormDialogProps) {
  const [open, setOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsPending(true)
    try {
      if (await onSubmit(new FormData(event.currentTarget))) setOpen(false)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !isPending && setOpen(next)}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className={className ?? "max-h-[90vh] overflow-y-auto sm:max-w-lg"}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
          {children}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
