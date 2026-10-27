import { SCORE_TYPE_LABEL, labelFor } from "@/lib/open/labels"
import { formatTime } from "@/lib/open/score-codec"
import type { PublicWorkout } from "@/server/open/public"

/** "Week 1 · For time · 12:00 cap" chips for a workout. */
export function WorkoutMeta({ workout, weekLabel }: { workout: PublicWorkout; weekLabel?: string }) {
  const items = [
    weekLabel,
    labelFor({ labels: SCORE_TYPE_LABEL, value: workout.scoreType }),
    workout.timeCapSeconds ? `${formatTime(workout.timeCapSeconds * 1000)} cap` : undefined,
    workout.hasTiebreak ? "Tiebreak" : undefined,
  ].filter(Boolean)

  return (
    <ul className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wider">
      {items.map((item) => (
        <li key={item} className="rounded-sm border px-2 py-0.5 text-muted-foreground">
          {item}
        </li>
      ))}
    </ul>
  )
}
