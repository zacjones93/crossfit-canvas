import type { ReactNode } from "react"
import { Label } from "@/components/ui/label"

interface FieldProps {
  id: string
  label: string
  hint?: ReactNode
  children: ReactNode
}

/** Label + control + optional hint, the one field layout used by the Open admin forms. */
export function Field({ id, label, hint, children }: FieldProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

/** Switch row: label/hint on the left, control on the right. */
export function SwitchField({ id, label, hint, children }: FieldProps) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-md border p-3">
      <div className="grid gap-1">
        <Label htmlFor={id}>{label}</Label>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      {children}
    </div>
  )
}
