import { cn } from "@/lib/utils"
import type { PublicMember } from "@/lib/open/public-view"

/** Small "Coach" tag next to a roster name. */
export function CoachBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-sm bg-open-accent px-1.5 py-px text-[10px] font-bold uppercase leading-4 tracking-wider text-open-accent-foreground",
        className,
      )}
    >
      Coach
    </span>
  )
}

/** Points with a muted "pts" suffix. */
export function Points({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cn("tabular-nums", className)}>
      {value}
      <span className="ml-0.5 text-[10px] font-normal text-muted-foreground">pts</span>
    </span>
  )
}

/**
 * Compact roster list, already in display order (`buildTeamRosters`). Points show only when present
 * (the event shows individuals).
 */
export function MemberList({ members, className }: { members: PublicMember[]; className?: string }) {
  return (
    <ol className={cn("divide-y text-sm", className)}>
      {/* Index keys: names aren't unique and ids stay server-side */}
      {members.map((member, index) => (
        <li key={index} className="flex items-center justify-between gap-3 py-1.5">
          <span className="flex min-w-0 items-center gap-2">
            <span className="truncate">{member.name}</span>
            {member.isCoach && <CoachBadge />}
          </span>
          {member.points !== undefined && <Points value={member.points} className="shrink-0 font-semibold" />}
        </li>
      ))}
    </ol>
  )
}
