import type { getEntries } from "@/server/open/event-data"

export type AdminOpenEntry = Awaited<ReturnType<typeof getEntries>>[number]

export interface TeamOption {
  id: string
  label: string
}
