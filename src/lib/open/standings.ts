// Plain module (no DB / server-only imports): derives standings from the award ledger.
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

export interface TeamStanding extends StandingsTeam {
  total: number;
  memberCount: number;
  avgPerMember: number;
  /** weekId → points; awards with no week (e.g. once-per-event) are keyed under NO_WEEK_KEY */
  byWeek: Record<string, number>;
  /** ruleId → points */
  byRule: Record<string, number>;
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
}: {
  teams: readonly StandingsTeam[];
  entries: readonly StandingsEntry[];
  awards: readonly StandingsAward[];
}): Standings {
  const teamById = new Map<string, TeamStanding>(
    teams.map((team) => [
      team.id,
      { ...team, total: 0, memberCount: 0, avgPerMember: 0, byWeek: {}, byRule: {} },
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
  for (const award of awards) {
    const individual = individualById.get(award.entryId);
    if (!individual) continue;
    individual.total += award.points;

    const team = individual.teamId ? teamById.get(individual.teamId) : undefined;
    if (!team) {
      unassigned += award.points;
      continue;
    }
    team.total += award.points;
    addTo({ map: team.byWeek, key: award.weekId ?? NO_WEEK_KEY, points: award.points });
    addTo({ map: team.byRule, key: award.ruleId, points: award.points });
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
