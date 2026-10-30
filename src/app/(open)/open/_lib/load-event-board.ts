import "server-only"
import { cache } from "react"
import { buildTeamRosters, rankTeams, withStandingRanks } from "@/lib/open/public-view"
import { teamPhotoUrl } from "@/lib/open/team-photo"
import { getPublicEventData } from "@/server/open/public"
import { getStandings } from "@/server/open/standings"
import type { PublicEvent } from "./load-public-event"

const TOP_INDIVIDUALS = 10

export function placementKey({ entryId, workoutId }: { entryId: string; workoutId: string }) {
  return `${entryId}|${workoutId}`
}

/**
 * Standings (tagged cache) merged with team profile fields and both ranks, plus the event's weeks, rules,
 * workouts, and scalings. The single place individuals are dropped for public pages: gated on the fresh
 * (uncached) `event.showIndividuals`. Takes the request-cached event object so calls dedupe per request.
 */
export const loadEventBoard = cache(async (event: PublicEvent) => {
  const [standings, data] = await Promise.all([getStandings({ eventId: event.id }), getPublicEventData({ eventId: event.id })])
  const profileById = new Map(data.teamProfiles.map((profile) => [profile.id, profile]))
  const teams = withStandingRanks({
    teams: standings.teams.map((team) => {
      const profile = profileById.get(team.id)
      return { ...team, photoUrl: teamPhotoUrl(profile?.photoKey), motto: profile?.motto ?? null }
    }),
  })
  const coachIdByEntry = new Map(data.entryCoaches.map((row) => [row.entryId, row.coachId]))
  // Names (and coach flags) are public even when individuals are hidden; points are dropped by buildTeamRosters
  const rosters = buildTeamRosters({
    entries: standings.individuals.map((individual) => ({
      entryId: individual.entryId,
      name: individual.name,
      teamId: individual.teamId,
      total: individual.total,
      coachId: coachIdByEntry.get(individual.entryId) ?? null,
    })),
    teamCoaches: data.teamCoaches,
    showIndividuals: event.showIndividuals,
  })
  const individuals = event.showIndividuals ? standings.individuals : []
  const topIndividuals = rankTeams({
    teams: individuals.filter((individual) => individual.total > 0).slice(0, TOP_INDIVIDUALS),
  })

  return {
    teams: teams.map((team) => ({ ...team, ...(rosters.get(team.id) ?? { coaches: [], members: [] }) })),
    /** entryId → points; empty when the event hides individuals */
    pointsByEntry: new Map(individuals.map((individual) => [individual.entryId, individual.total])),
    /** `placementKey({ entryId, workoutId })` → placement points earned; empty when the event hides individuals */
    placementPoints: new Map(
      event.showIndividuals
        ? standings.placements.map((placement) => [placementKey(placement), placement.points])
        : [],
    ),
    topIndividuals,
    weeks: data.weeks,
    rules: data.rules,
    workouts: data.workouts,
    scalings: data.scalings,
  }
})

export type EventBoard = Awaited<ReturnType<typeof loadEventBoard>>
export type BoardTeam = EventBoard["teams"][number]
