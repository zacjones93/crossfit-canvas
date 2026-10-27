import { Info } from "lucide-react"

/** Why a coach sees a grid read-only (flag off, week locked, …). */
export function ReadOnlyNotice({ message }: { message: string }) {
  return (
    <p className="flex items-start gap-2 rounded-md border bg-muted/50 px-3 py-2 text-sm">
      <Info aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
      <span>
        {message}. You can view, but not change, these.
      </span>
    </p>
  )
}
