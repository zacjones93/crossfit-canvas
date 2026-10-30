// Plain module (no DB / server-only imports): derives standings from the award ledger plus placement points.
// Team points follow the entry's *current* teamId (moving an athlete moves their points).

export interface StandingsTeam {
  id: string;
  name: string;
  slug: string;
  color: string | null;
  sortOrder: number;
}

export interface StandingsEntry {
  id: string;
  teamId: string | null;
  participantName: string;
}

export interface StandingsAward {
  entryId: string;
  ruleId: string;
  weekId: string | null;
  points: number;
}

/** Derived placement points (see `computePlacements`) */
export interface StandingsPlacement {
  entryId: string;
  workoutId: string;
  weekId: string | null;
  points: number;
}

export interface TeamStanding extends StandingsTeam {
  total: number;
  memberCount: number;
  avgPerMember: number;
  /** weekId → points; awards with no week (e.g. once-per-event) are keyed under NO_WEEK_KEY */
  byWeek: Record<string, number>;
  /** ruleId → award points */
  byRule: Record<string, number>;
  /** workoutId → placement points */
  byWorkout: Record<string, number>;
}

export interface IndividualStanding {
  entryId: string;
  name: string;
  teamId: string | null;
  total: number;
}

export interface Standings {
  teams: TeamStanding[];
  /** Points earned by entries with no (or an unknown) team */
  unassigned: number;
  individuals: IndividualStanding[];
}

export const NO_WEEK_KEY = "_none";

function byTotalThenName(a: { total: number; name: string }, b: { total: number; name: string }): number {
  return b.total - a.total || a.name.localeCompare(b.name);
}

function addTo({ map, key, points }: { map: Record<string, number>; key: string; points: number }) {
  map[key] = (map[key] ?? 0) + points;
}

export function computeStandings({
  teams,
  entries,
  awards,
  placements = [],
}: {
  teams: readonly StandingsTeam[];
  entries: readonly StandingsEntry[];
  awards: readonly StandingsAward[];
  placements?: readonly StandingsPlacement[];
}): Standings {
  const teamById = new Map<string, TeamStanding>(
    teams.map((team) => [
      team.id,
      { ...team, total: 0, memberCount: 0, avgPerMember: 0, byWeek: {}, byRule: {}, byWorkout: {} },
    ]),
  );
  const individualById = new Map<string, IndividualStanding>(
    entries.map((entry) => [
      entry.id,
      { entryId: entry.id, name: entry.participantName, teamId: entry.teamId, total: 0 },
    ]),
  );

  for (const entry of entries) {
    const team = entry.teamId ? teamById.get(entry.teamId) : undefined;
    if (team) team.memberCount += 1;
  }

  let unassigned = 0;
  /** Credits the entry and its team; returns the team, if any */
  function credit({ entryId, weekId, points }: { entryId: string; weekId: string | null; points: number }) {
    const individual = individualById.get(entryId);
    if (!individual) return undefined;
    individual.total += points;

    const team = individual.teamId ? teamById.get(individual.teamId) : undefined;
    if (!team) {
      unassigned += points;
      return undefined;
    }
    team.total += points;
    addTo({ map: team.byWeek, key: weekId ?? NO_WEEK_KEY, points });
    return team;
  }

  for (const award of awards) {
    const team = credit(award);
    if (team) addTo({ map: team.byRule, key: award.ruleId, points: award.points });
  }
  for (const placement of placements) {
    if (placement.points === 0) continue;
    const team = credit(placement);
    if (team) addTo({ map: team.byWorkout, key: placement.workoutId, points: placement.points });
  }

  const teamStandings = [...teamById.values()].map((team) => ({
    ...team,
    avgPerMember: team.memberCount ? team.total / team.memberCount : 0,
  }));

  return {
    teams: teamStandings.sort(byTotalThenName),
    unassigned,
    individuals: [...individualById.values()].sort(byTotalThenName),
  };
}
