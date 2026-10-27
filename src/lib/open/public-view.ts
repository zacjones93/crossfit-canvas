// Plain module (no DB / server-only imports): pure decisions and shaping for the public Open pages.
import { OPEN_EVENT_STATUS } from "./constants";
import { formatTiebreak } from "./score-codec";
import { NO_WEEK_KEY } from "./standings";

export const EVENT_VISIBILITY = {
  PUBLIC: "public",
  /** Draft event viewed by an admin: render with a "Draft preview" banner. */
  PREVIEW: "preview",
  HIDDEN: "hidden",
} as const;

export type EventVisibility = (typeof EVENT_VISIBILITY)[keyof typeof EVENT_VISIBILITY];

/** Live and closed events are public; drafts are visible to admins only (as a preview). */
export function decideEventVisibility({ status, isAdmin }: { status: string; isAdmin: boolean }): EventVisibility {
  if (status === OPEN_EVENT_STATUS.LIVE || status === OPEN_EVENT_STATUS.CLOSED) return EVENT_VISIBILITY.PUBLIC;
  return isAdmin ? EVENT_VISIBILITY.PREVIEW : EVENT_VISIBILITY.HIDDEN;
}

export const STANDINGS_SORT = {
  TOTAL: "total",
  AVG: "avg",
} as const;

export type StandingsSort = (typeof STANDINGS_SORT)[keyof typeof STANDINGS_SORT];

export function parseStandingsSort(value: string | string[] | undefined): StandingsSort {
  return value === STANDINGS_SORT.AVG ? STANDINGS_SORT.AVG : STANDINGS_SORT.TOTAL;
}

interface RankableTeam {
  name: string;
  total: number;
  /** Only needed when sorting by average (individuals rank by total). */
  avgPerMember?: number;
}

/** Sorts teams (or individuals) by total (or average per member) desc, then name; ties share a competition rank (1, 2, 2, 4). */
export function rankTeams<T extends RankableTeam>({
  teams,
  sort = STANDINGS_SORT.TOTAL,
}: {
  teams: readonly T[];
  sort?: StandingsSort;
}): (T & { rank: number })[] {
  const key = (team: T) => (sort === STANDINGS_SORT.AVG ? (team.avgPerMember ?? 0) : team.total);
  const sorted = [...teams].sort((a, b) => key(b) - key(a) || a.name.localeCompare(b.name));
  const ranked: (T & { rank: number })[] = [];
  sorted.forEach((team, index) => {
    const previous = ranked[index - 1];
    ranked.push({ ...team, rank: previous && key(previous) === key(team) ? previous.rank : index + 1 });
  });
  return ranked;
}

/**
 * Both competition ranks for every team, computed once: `rank` (by total) and `avgRank` (by avg per member).
 * Returned in total order.
 */
export function withStandingRanks<T extends RankableTeam & { id: string; avgPerMember: number }>({
  teams,
}: {
  teams: readonly T[];
}): (T & { rank: number; avgRank: number })[] {
  const avgRankById = new Map(rankTeams({ teams, sort: STANDINGS_SORT.AVG }).map((team) => [team.id, team.rank]));
  return rankTeams({ teams }).map((team) => ({ ...team, avgRank: avgRankById.get(team.id) ?? team.rank }));
}

/** The rank shown for `sort`. */
export function rankFor({ team, sort }: { team: { rank: number; avgRank: number }; sort: StandingsSort }): number {
  return sort === STANDINGS_SORT.AVG ? team.avgRank : team.rank;
}

/** Teams in display order for `sort` (by that rank, then name); does not re-rank. */
export function orderTeams<T extends { name: string; rank: number; avgRank: number }>({
  teams,
  sort,
}: {
  teams: readonly T[];
  sort: StandingsSort;
}): T[] {
  return [...teams].sort((a, b) => rankFor({ team: a, sort }) - rankFor({ team: b, sort }) || a.name.localeCompare(b.name));
}

/** "TB 5:01" when the workout uses tiebreaks and the score has one; otherwise null. */
export function tiebreakLabel({
  workout,
  tiebreakMs,
}: {
  workout: { hasTiebreak: boolean };
  tiebreakMs: number | null;
}): string | null {
  return workout.hasTiebreak && tiebreakMs !== null ? `TB ${formatTiebreak(tiebreakMs)}` : null;
}

/** Up to two initials for an avatar fallback ("Red Rhinos" → "RR", "zac" → "Z"). */
export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]!.toUpperCase())
    .join("");
}

/** Points per member, one decimal ("12.5"). */
export function formatAverage(value: number): string {
  return value.toFixed(1);
}

export interface WeekColumn {
  /** weekId, or NO_WEEK_KEY for event-level (once-per-event / unscheduled) points */
  key: string;
  label: string;
  shortLabel: string;
}

/**
 * Week-by-week columns: one per week in order, plus an event-level column only when some team has
 * points that aren't tied to a week.
 */
export function weekColumns({
  weeks,
  teams,
}: {
  weeks: readonly { id: string; number: number; label: string }[];
  teams: readonly { byWeek: Record<string, number> }[];
}): WeekColumn[] {
  const columns = weeks.map((week) => ({ key: week.id, label: week.label, shortLabel: `W${week.number}` }));
  const hasEventPoints = teams.some((team) => (team.byWeek[NO_WEEK_KEY] ?? 0) !== 0);
  return hasEventPoints ? [...columns, { key: NO_WEEK_KEY, label: "Event-wide", shortLabel: "Event" }] : columns;
}

export interface RosterEntry {
  entryId: string;
  name: string;
  /** The participant's linked coach profile, if any. */
  coachId: string | null;
  total: number;
}

/**
 * A team's roster in display order, each flagged `isCoach` iff the person is one of *this* team's coaches
 * (a coach on another team's roster is a regular member there). With `showIndividuals`: points desc, then
 * name; without: alphabetical (no per-person ordering by points).
 */
function sortRoster<T extends RosterEntry>({
  entries,
  teamCoachIds,
  showIndividuals,
}: {
  entries: readonly T[];
  teamCoachIds: ReadonlySet<string>;
  showIndividuals: boolean;
}): (T & { isCoach: boolean })[] {
  return entries
    .map((entry) => ({ ...entry, isCoach: entry.coachId !== null && teamCoachIds.has(entry.coachId) }))
    .sort((a, b) => (showIndividuals ? b.total - a.total : 0) || a.name.localeCompare(b.name));
}

export interface PublicMember {
  /** Server-side lookups only (e.g. scores); never render or pass to client components. */
  entryId: string;
  name: string;
  isCoach: boolean;
  /** Omitted when the event hides individuals. */
  points?: number;
}

export interface PublicTeamCoach {
  name: string;
  slug: string;
  /** Competing on this team's roster. */
  onRoster: boolean;
  /** Only when on the roster and the event shows individuals. */
  points?: number;
}

export interface PublicTeamRoster {
  coaches: PublicTeamCoach[];
  /** Everyone on the roster (coaches included, flagged), in `sortRoster` order. */
  members: PublicMember[];
}

/**
 * Per-team public rosters (teamId → coaches + members) from entries with totals and the event's team-coach
 * assignments: the one place coach-ness is derived for public pages (coach cards and roster badges). Display
 * fields plus `entryId` for server-side lookups; no coach ids or emails.
 */
export function buildTeamRosters({
  entries,
  teamCoaches,
  showIndividuals,
}: {
  entries: readonly (RosterEntry & { teamId: string | null })[];
  teamCoaches: readonly { teamId: string; coachId: string; name: string; slug: string }[];
  showIndividuals: boolean;
}): Map<string, PublicTeamRoster> {
  const coachIdsByTeam = new Map<string, Set<string>>();
  for (const { teamId, coachId } of teamCoaches) coachIdsByTeam.set(teamId, (coachIdsByTeam.get(teamId) ?? new Set()).add(coachId));
  const entriesByTeam = new Map<string, (RosterEntry & { teamId: string | null })[]>();
  for (const entry of entries) {
    if (entry.teamId) entriesByTeam.set(entry.teamId, [...(entriesByTeam.get(entry.teamId) ?? []), entry]);
  }

  const teamIds = new Set([...entriesByTeam.keys(), ...coachIdsByTeam.keys()]);
  return new Map(
    [...teamIds].map((teamId) => {
      const sorted = sortRoster({
        entries: entriesByTeam.get(teamId) ?? [],
        teamCoachIds: coachIdsByTeam.get(teamId) ?? new Set(),
        showIndividuals,
      });
      const pointsOf = (entry: RosterEntry) => (showIndividuals ? { points: entry.total } : {});
      const coaches = teamCoaches
        .filter((coach) => coach.teamId === teamId)
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((coach) => {
          const entry = sorted.find((member) => member.coachId === coach.coachId);
          return { name: coach.name, slug: coach.slug, onRoster: Boolean(entry), ...(entry ? pointsOf(entry) : {}) };
        });
      const members = sorted.map((entry) => ({ entryId: entry.entryId, name: entry.name, isCoach: entry.isCoach, ...pointsOf(entry) }));
      return [teamId, { coaches, members }];
    }),
  );
}
