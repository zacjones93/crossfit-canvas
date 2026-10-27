import { cn } from "@/lib/utils"

/** Small color dot for a team (dashed outline when the team has no color). */
export function TeamSwatch({ color, className }: { color: string | null; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("inline-block h-3 w-3 shrink-0 rounded-full", !color && "border border-dashed border-muted-foreground", className)}
      style={color ? { backgroundColor: color } : undefined}
    />
  )
}
