import "server-only"
import { cache } from "react"
import { rankTeams, withStandingRanks } from "@/lib/open/public-view"
import { teamPhotoUrl } from "@/lib/open/team-photo"
import { getPublicEventData } from "@/server/open/public"
import { getStandings } from "@/server/open/standings"
import type { PublicEvent } from "./load-public-event"

const TOP_INDIVIDUALS = 10

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
  const individuals = event.showIndividuals ? standings.individuals : []
  const topIndividuals = rankTeams({
    teams: individuals.filter((individual) => individual.total > 0).slice(0, TOP_INDIVIDUALS),
  })

  return {
    teams,
    /** entryId → points; empty when the event hides individuals */
    pointsByEntry: new Map(individuals.map((individual) => [individual.entryId, individual.total])),
    topIndividuals,
    weeks: data.weeks,
    rules: data.rules,
    workouts: data.workouts,
    scalings: data.scalings,
  }
})

export type EventBoard = Awaited<ReturnType<typeof loadEventBoard>>
export type BoardTeam = EventBoard["teams"][number]
