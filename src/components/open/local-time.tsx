"use client"

import { useSyncExternalStore } from "react"
import { format as formatDate } from "date-fns"

const subscribe = () => () => {}

/** False during SSR and hydration, true afterwards (no effect + extra state needed). */
function useIsHydrated(): boolean {
  return useSyncExternalStore(subscribe, () => true, () => false)
}

interface LocalTimeProps {
  value: Date | string | number
  /** date-fns format string, e.g. "PP" or "MMM d, HH:mm:ss". */
  format: string
  className?: string
}

/**
 * A timestamp in the viewer's time zone. Server HTML has no text (its time zone is the server's),
 * so hydration never mismatches; the formatted time appears right after hydration.
 */
export function LocalTime({ value, format, className }: LocalTimeProps) {
  const isHydrated = useIsHydrated()
  const date = new Date(value)

  return (
    <time dateTime={date.toISOString()} className={className}>
      {isHydrated ? formatDate(date, format) : null}
    </time>
  )
}
