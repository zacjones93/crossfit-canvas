"use client"

import { useMemo } from "react"
import { Search } from "lucide-react"
import { parseAsString, useQueryStates } from "nuqs"
import { Input } from "@/components/ui/input"
import { OptionSelect } from "./selects"

const ALL_TEAMS = "__all__"
const NO_TEAM = "__none__"

// Client-only URL state (shallow): survives reloads and shares as a link, no server round trip
const filterParsers = {
  q: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
  team: parseAsString.withDefault(ALL_TEAMS).withOptions({ clearOnDefault: true }),
}

/** An athlete row in the award / score grids. */
export interface GridEntry {
  id: string
  name: string
  team: { id: string; name: string; color: string | null } | null
}

export interface EntryGroup<E extends GridEntry> {
  key: string
  team: GridEntry["team"]
  entries: E[]
}

/** Team filter (`?team=`) + name search (`?q=`) over grid entries. */
export function useEntryFilter<E extends GridEntry>(entries: readonly E[]) {
  const [{ q: query, team: requestedTeam }, setFilters] = useQueryStates(filterParsers)
  const setQuery = (value: string) => void setFilters({ q: value })
  const setTeam = (value: string) => void setFilters({ team: value })

  const teams = useMemo(() => {
    const byId = new Map<string, NonNullable<GridEntry["team"]>>()
    for (const entry of entries) if (entry.team) byId.set(entry.team.id, entry.team)
    return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name))
  }, [entries])
  const hasUnassigned = entries.some((entry) => !entry.team)
  // An unknown/stale `?team=` (e.g. a team the grid doesn't show) falls back to all teams
  const team =
    requestedTeam === NO_TEAM ? (hasUnassigned ? NO_TEAM : ALL_TEAMS) : teams.some((item) => item.id === requestedTeam) ? requestedTeam : ALL_TEAMS

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()
    const matchesTeam = (entry: E) =>
      team === ALL_TEAMS || (team === NO_TEAM ? !entry.team : entry.team?.id === team)
    return entries.filter((entry) => matchesTeam(entry) && (!needle || entry.name.toLowerCase().includes(needle)))
  }, [entries, query, team])

  /** Visible entries grouped by team (teams alphabetical, unassigned last). */
  const groups = useMemo(() => {
    const byKey = new Map<string, EntryGroup<E>>()
    for (const entry of visible) {
      const key = entry.team?.id ?? NO_TEAM
      const group = byKey.get(key) ?? byKey.set(key, { key, team: entry.team, entries: [] }).get(key)!
      group.entries.push(entry)
    }
    return [...byKey.values()].sort((a, b) => {
      if (!a.team || !b.team) return a.team ? -1 : b.team ? 1 : 0
      return a.team.name.localeCompare(b.team.name)
    })
  }, [visible])

  return {
    query,
    setQuery,
    team,
    setTeam,
    teams,
    hasUnassigned,
    visible,
    groups,
  }
}

type EntryFilterState = ReturnType<typeof useEntryFilter>

/** Search box, plus a team select when the grid spans more than one team. */
export function EntryFilterBar({ filter }: { filter: Pick<EntryFilterState, "query" | "setQuery" | "team" | "setTeam" | "teams" | "hasUnassigned"> }) {
  const showTeams = filter.teams.length + (filter.hasUnassigned ? 1 : 0) > 1

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <div className="relative sm:w-64">
        <Search aria-hidden className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          aria-label="Search athletes"
          placeholder="Search athletes"
          className="pl-8"
          value={filter.query}
          onChange={(event) => filter.setQuery(event.target.value)}
        />
      </div>
      {showTeams && (
        <OptionSelect
          className="sm:w-56"
          value={filter.team}
          onValueChange={filter.setTeam}
          options={[
            { value: ALL_TEAMS, label: "All teams" },
            ...filter.teams.map((team) => ({ value: team.id, label: team.name })),
            ...(filter.hasUnassigned ? [{ value: NO_TEAM, label: "No team" }] : []),
          ]}
        />
      )}
    </div>
  )
}
