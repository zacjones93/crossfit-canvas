import { describe, expect, it } from "vitest";
import { OPEN_GENDER, OPEN_SCORE_TYPE } from "./constants";
import { computePlacements, placementPoints, placementSummary, type PlacementEntry, type PlacementScore } from "./placement";

const rx = { id: "rx", rank: 0, placementFirst: 100, placementStep: 5, placementMin: 5, placementPerTeam: 3 };
const scaled = { id: "sc", rank: 1, placementFirst: 50, placementStep: 5, placementMin: 5, placementPerTeam: 2 };
const foundations = { id: "fd", rank: 2, placementFirst: 0, placementStep: 0, placementMin: 0, placementPerTeam: 0 };
const workout = { id: "w1", weekId: "wk1", scoreType: OPEN_SCORE_TYPE.REPS, timeCapSeconds: null, repsPerRound: null };

const { MALE, FEMALE } = OPEN_GENDER;

function score({ entryId, value, scalingId = rx.id }: { entryId: string; value: number; scalingId?: string }): PlacementScore {
  return { entryId, workoutId: workout.id, scalingId, value, capped: false, tiebreakMs: null };
}

function run({ entries, scores }: { entries: PlacementEntry[]; scores: PlacementScore[] }) {
  const placements = computePlacements({ workouts: [workout], scalings: [rx, scaled, foundations], entries, scores });
  return Object.fromEntries(placements.map((p) => [p.entryId, [p.place, p.points]]));
}

describe("placementPoints", () => {
  it("matches the Rx table: 100, 95 … 5 at 20th, then the 5 minimum", () => {
    expect([1, 2, 5, 6, 20, 21, 40].map((place) => placementPoints({ table: rx, place }))).toEqual([100, 95, 80, 75, 5, 5, 5]);
  });

  it("matches the Scaled table: 50 … 5 at 10th, then the 5 minimum", () => {
    expect([1, 5, 10, 11].map((place) => placementPoints({ table: scaled, place }))).toEqual([50, 30, 5, 5]);
  });

  it("is 0 for a scaling without a table", () => {
    expect(placementPoints({ table: foundations, place: 1 })).toBe(0);
  });
});

describe("computePlacements", () => {
  it("ranks men and women separately, gym-wide", () => {
    const result = run({
      entries: [
        { id: "m1", teamId: "a", gender: MALE },
        { id: "m2", teamId: "b", gender: MALE },
        { id: "f1", teamId: "a", gender: FEMALE },
      ],
      scores: [score({ entryId: "m1", value: 10 }), score({ entryId: "m2", value: 20 }), score({ entryId: "f1", value: 5 })],
    });
    expect(result).toEqual({ m2: [1, 100], m1: [2, 95], f1: [1, 100] });
  });

  it("pays only each team's top N per gender; the rest keep their place", () => {
    const entries = ["a1", "a2", "a3", "a4", "b1"].map((id) => ({ id, teamId: id[0]!, gender: MALE }));
    const result = run({
      entries,
      scores: [
        score({ entryId: "a1", value: 50 }),
        score({ entryId: "a2", value: 40 }),
        score({ entryId: "b1", value: 35 }),
        score({ entryId: "a3", value: 30 }),
        score({ entryId: "a4", value: 20 }),
      ],
    });
    expect(result).toEqual({ a1: [1, 100], a2: [2, 95], b1: [3, 90], a3: [4, 85], a4: [5, 0] });
  });

  it("counts every athlete tied at the team cutoff", () => {
    const entries = ["a1", "a2", "a3"].map((id) => ({ id, teamId: "a", gender: FEMALE }));
    const result = run({
      entries,
      scores: [
        score({ entryId: "a1", value: 30, scalingId: scaled.id }),
        score({ entryId: "a2", value: 20, scalingId: scaled.id }),
        score({ entryId: "a3", value: 20, scalingId: scaled.id }),
      ],
    });
    expect(result).toEqual({ a1: [1, 50], a2: [2, 45], a3: [2, 45] });
  });

  it("keeps Rx and Scaled leaderboards apart; skips scalings without a table", () => {
    const entries = ["r", "s", "f"].map((id) => ({ id, teamId: "a", gender: MALE }));
    const result = run({
      entries,
      scores: [
        score({ entryId: "r", value: 1 }),
        score({ entryId: "s", value: 99, scalingId: scaled.id }),
        score({ entryId: "f", value: 99, scalingId: foundations.id }),
      ],
    });
    expect(result).toEqual({ r: [1, 100], s: [1, 50] });
  });

  it("skips athletes without a gender; ranks team-less athletes without paying them", () => {
    const result = run({
      entries: [
        { id: "x", teamId: "a", gender: null },
        { id: "solo", teamId: null, gender: MALE },
        { id: "m", teamId: "a", gender: MALE },
      ],
      scores: [score({ entryId: "x", value: 99 }), score({ entryId: "solo", value: 50 }), score({ entryId: "m", value: 40 })],
    });
    expect(result).toEqual({ solo: [1, 0], m: [2, 95] });
  });

  it("carries the workout's week", () => {
    const [placement] = computePlacements({
      workouts: [workout],
      scalings: [rx],
      entries: [{ id: "m", teamId: "a", gender: MALE }],
      scores: [score({ entryId: "m", value: 1 })],
    });
    expect(placement).toMatchObject({ workoutId: "w1", weekId: "wk1", scalingId: "rx" });
  });
});

describe("placement display", () => {
  it("summarizes a table", () => {
    expect(placementSummary(rx)).toBe("100, 95, 90 … −5 per place, min 5 · top 3 men & women per team");
  });
});
