// Plain module (no DB / server-only imports): derives placement points from workout scores.
// Placement points are never stored: they follow the scores, scalings, genders, and teams as they are now.
import { rankScores, type ScoreWorkout } from "./score-codec";

export interface PlacementTable {
  placementFirst: number;
  placementStep: number;
  placementMin: number;
  /** 0 = every athlete on a team counts */
  placementPerTeam: number;
}

export interface PlacementScaling extends PlacementTable {
  id: string;
  rank: number;
}

export interface PlacementWorkout extends ScoreWorkout {
  id: string;
  weekId: string | null;
}

export interface PlacementEntry {
  id: string;
  teamId: string | null;
  gender: string | null;
}

export interface PlacementScore {
  entryId: string;
  workoutId: string;
  scalingId: string;
  value: number;
  capped: boolean;
  tiebreakMs: number | null;
}

export interface Placement {
  entryId: string;
  workoutId: string;
  weekId: string | null;
  scalingId: string;
  /** Competition place in the workout × scaling × gender leaderboard (ties share: 1, 2, 2, 4) */
  place: number;
  /** 0 when the athlete isn't among their team's counted top N (or has no team) */
  points: number;
}

export function isPlacementEnabled(table: PlacementTable): boolean {
  return table.placementFirst > 0;
}

/** Points for a place: first − step × (place − 1), never below min. */
export function placementPoints({ table, place }: { table: PlacementTable; place: number }): number {
  if (!isPlacementEnabled(table)) return 0;
  return Math.max(table.placementFirst - table.placementStep * (place - 1), table.placementMin);
}

/** "100, 95, 90 … −5 per place, min 5 · top 3 men & women per team" */
export function placementSummary(table: PlacementTable): string {
  const first3 = [1, 2, 3].map((place) => placementPoints({ table, place }));
  const step = table.placementStep > 0 ? ` … −${table.placementStep} per place` : "";
  const perTeam =
    table.placementPerTeam > 0 ? `top ${table.placementPerTeam} men & women per team` : "every athlete counts";
  return `${[...new Set(first3)].join(", ")}${step}, min ${table.placementMin} · ${perTeam}`;
}

/**
 * Ranks every workout's scores per scaling and gender (gym-wide), then pays each team's top
 * `placementPerTeam` athletes per gender (by place; athletes tied at the cutoff all count) from the
 * scaling's table. Athletes without a gender aren't ranked; athletes without a team are ranked but earn 0.
 */
export function computePlacements({
  workouts,
  scalings,
  entries,
  scores,
}: {
  workouts: readonly PlacementWorkout[];
  scalings: readonly PlacementScaling[];
  entries: readonly PlacementEntry[];
  scores: readonly PlacementScore[];
}): Placement[] {
  const workoutById = new Map(workouts.map((workout) => [workout.id, workout]));
  const scalingById = new Map(scalings.filter(isPlacementEnabled).map((scaling) => [scaling.id, scaling]));
  const entryById = new Map(entries.map((entry) => [entry.id, entry]));

  const groups = new Map<string, PlacementScore[]>();
  for (const score of scores) {
    const gender = entryById.get(score.entryId)?.gender;
    if (!gender || !workoutById.has(score.workoutId) || !scalingById.has(score.scalingId)) continue;
    const key = [score.workoutId, score.scalingId, gender].join("|");
    const group = groups.get(key);
    if (group) group.push(score);
    else groups.set(key, [score]);
  }

  const placements: Placement[] = [];
  for (const group of groups.values()) {
    const { workoutId, scalingId } = group[0]!;
    const workout = workoutById.get(workoutId)!;
    const scaling = scalingById.get(scalingId)!;
    const ranked = rankScores({
      scores: group.map((score) => ({ ...score, scalingRank: scaling.rank })),
      workout,
    });

    // Places of each team's athletes, best first: the cutoff place is the Nth one
    const placesByTeam = new Map<string, number[]>();
    for (const score of ranked) {
      const teamId = entryById.get(score.entryId)!.teamId;
      if (!teamId) continue;
      const places = placesByTeam.get(teamId);
      if (places) places.push(score.rank);
      else placesByTeam.set(teamId, [score.rank]);
    }

    for (const score of ranked) {
      const teamId = entryById.get(score.entryId)!.teamId;
      const teamPlaces = teamId ? placesByTeam.get(teamId)! : [];
      const cutoff = scaling.placementPerTeam > 0 ? teamPlaces[scaling.placementPerTeam - 1] : undefined;
      const counts = teamId !== null && (cutoff === undefined || score.rank <= cutoff);
      placements.push({
        entryId: score.entryId,
        workoutId,
        weekId: workout.weekId,
        scalingId,
        place: score.rank,
        points: counts ? placementPoints({ table: scaling, place: score.rank }) : 0,
      });
    }
  }
  return placements;
}
