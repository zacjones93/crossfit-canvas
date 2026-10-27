import type { getTeams } from "@/server/open/event-data"

export type AdminOpenTeam = Awaited<ReturnType<typeof getTeams>>[number]

export interface CoachOption {
  id: string
  name: string
}
