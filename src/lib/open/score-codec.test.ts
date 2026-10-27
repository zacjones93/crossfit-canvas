import { describe, expect, it } from "vitest";
import {
  compareScores,
  formatScore,
  formatTiebreak,
  parseScore,
  parseTiebreak,
  rankScores,
  type RankableScore,
  type ScoreWorkout,
} from "./score-codec";

const timeWorkout: ScoreWorkout = { scoreType: "time", timeCapSeconds: 15 * 60, repsPerRound: null };
const uncappedTime: ScoreWorkout = { scoreType: "time", timeCapSeconds: null, repsPerRound: null };
const repsWorkout: ScoreWorkout = { scoreType: "reps", timeCapSeconds: null, repsPerRound: null };
const amrap: ScoreWorkout = { scoreType: "rounds_reps", timeCapSeconds: null, repsPerRound: 30 };
const amrapNoRound: ScoreWorkout = { scoreType: "rounds_reps", timeCapSeconds: null, repsPerRound: null };
const loadWorkout: ScoreWorkout = { scoreType: "load", timeCapSeconds: null, repsPerRound: null };
const pointsWorkout: ScoreWorkout = { scoreType: "points", timeCapSeconds: null, repsPerRound: null };

describe("parseScore: time", () => {
  it.each([
    ["12:34", 754_000],
    ["0:45", 45_000],
    ["1:02:03", 3_723_000],
    ["12:34.5", 754_500],
    ["12:34.56", 754_560],
    [" 9:05 ", 545_000],
  ])("%s → %d ms", (input, value) => {
    expect(parseScore({ input, workout: uncappedTime })).toEqual({ ok: true, value, capped: false });
  });

  it.each(["", "abc", "12", "12:3", "12:60", "1:60:00", "-1:00", "0:00", "12:34:56:78", "12.34"])(
    "rejects %j",
    (input) => {
      expect(parseScore({ input, workout: uncappedTime }).ok).toBe(false);
    },
  );

  it("accepts a time exactly at the cap and rejects over it", () => {
    expect(parseScore({ input: "15:00", workout: timeWorkout })).toEqual({ ok: true, value: 900_000, capped: false });
    expect(parseScore({ input: "15:00.1", workout: timeWorkout }).ok).toBe(false);
  });

  it.each(["CAP+187", "cap 187", "Cap + 187", "cap187", "CAP+187 reps"])("parses capped %j", (input) => {
    expect(parseScore({ input, workout: timeWorkout })).toEqual({ ok: true, value: 187, capped: true });
  });

  it("parses reps with explicit capped flag", () => {
    expect(parseScore({ input: "187", workout: timeWorkout, capped: true })).toEqual({ ok: true, value: 187, capped: true });
  });

  it("rejects capped on a workout without a cap", () => {
    expect(parseScore({ input: "CAP+10", workout: uncappedTime }).ok).toBe(false);
    expect(parseScore({ input: "10", workout: uncappedTime, capped: true }).ok).toBe(false);
  });

  it("rejects capped flag with non-integer reps or on non-time workouts", () => {
    expect(parseScore({ input: "12:00", workout: timeWorkout, capped: true }).ok).toBe(false);
    expect(parseScore({ input: "100", workout: repsWorkout, capped: true }).ok).toBe(false);
  });
});

describe("parseScore: other types", () => {
  it("parses reps", () => {
    expect(parseScore({ input: "245", workout: repsWorkout })).toEqual({ ok: true, value: 245, capped: false });
    expect(parseScore({ input: "245 reps", workout: repsWorkout })).toEqual({ ok: true, value: 245, capped: false });
    expect(parseScore({ input: "0", workout: repsWorkout })).toEqual({ ok: true, value: 0, capped: false });
  });

  it.each(["-5", "12.5", "abc", "1e3"])("rejects reps %j", (input) => {
    expect(parseScore({ input, workout: repsWorkout }).ok).toBe(false);
  });

  it("parses rounds+reps into total reps", () => {
    expect(parseScore({ input: "8+12", workout: amrap })).toEqual({ ok: true, value: 252, capped: false });
    expect(parseScore({ input: "8 + 0", workout: amrap })).toEqual({ ok: true, value: 240, capped: false });
    expect(parseScore({ input: "252", workout: amrap })).toEqual({ ok: true, value: 252, capped: false });
  });

  it("rejects rounds+reps with reps >= repsPerRound or no repsPerRound", () => {
    expect(parseScore({ input: "8+30", workout: amrap }).ok).toBe(false);
    expect(parseScore({ input: "8+12", workout: amrapNoRound }).ok).toBe(false);
    expect(parseScore({ input: "252", workout: amrapNoRound })).toEqual({ ok: true, value: 252, capped: false });
  });

  it("parses load into grams in the given unit", () => {
    expect(parseScore({ input: "135", workout: loadWorkout, weightUnit: "lb" })).toEqual({ ok: true, value: 61_235, capped: false });
    expect(parseScore({ input: "60", workout: loadWorkout, weightUnit: "kg" })).toEqual({ ok: true, value: 60_000, capped: false });
    expect(parseScore({ input: "62.5", workout: loadWorkout, weightUnit: "kg" })).toEqual({ ok: true, value: 62_500, capped: false });
    expect(parseScore({ input: "60kg", workout: loadWorkout, weightUnit: "lb" })).toEqual({ ok: true, value: 60_000, capped: false });
  });

  it.each(["0", "-135", "heavy", "135 stone"])("rejects load %j", (input) => {
    expect(parseScore({ input, workout: loadWorkout }).ok).toBe(false);
  });

  it("parses points", () => {
    expect(parseScore({ input: "42", workout: pointsWorkout })).toEqual({ ok: true, value: 42, capped: false });
    expect(parseScore({ input: "-1", workout: pointsWorkout }).ok).toBe(false);
  });

  it("rejects unknown score types", () => {
    expect(parseScore({ input: "1", workout: { ...repsWorkout, scoreType: "vibes" } }).ok).toBe(false);
  });
});

describe("parseScore: bounds", () => {
  it("rejects values past the sanity maxima", () => {
    expect(parseScore({ input: "24:00:00", workout: uncappedTime }).ok).toBe(true);
    expect(parseScore({ input: "24:00:01", workout: uncappedTime }).ok).toBe(false);
    expect(parseScore({ input: "1000000", workout: repsWorkout }).ok).toBe(true);
    expect(parseScore({ input: "1000001", workout: repsWorkout }).ok).toBe(false);
    expect(parseScore({ input: "1000001", workout: pointsWorkout }).ok).toBe(false);
    expect(parseScore({ input: "33334+0", workout: amrap }).ok).toBe(false);
    expect(parseScore({ input: "CAP+1000001", workout: timeWorkout }).ok).toBe(false);
    expect(parseScore({ input: "1000", workout: loadWorkout, weightUnit: "kg" }).ok).toBe(true);
    expect(parseScore({ input: "1000.1", workout: loadWorkout, weightUnit: "kg" }).ok).toBe(false);
    expect(parseScore({ input: "2204", workout: loadWorkout, weightUnit: "lb" }).ok).toBe(true);
    expect(parseScore({ input: "2300", workout: loadWorkout, weightUnit: "lb" }).ok).toBe(false);
  });

  it("rejects values that aren't safe integers", () => {
    expect(parseScore({ input: "99999999999999999999", workout: repsWorkout }).ok).toBe(false);
    expect(parseScore({ input: "99999999999999999999:00", workout: uncappedTime }).ok).toBe(false);
  });
});

describe("formatScore", () => {
  it("formats time with a trimmed fraction only when non-zero", () => {
    expect(formatScore({ score: { value: 754_000, capped: false }, workout: timeWorkout })).toBe("12:34");
    expect(formatScore({ score: { value: 754_500, capped: false }, workout: timeWorkout })).toBe("12:34.5");
    expect(formatScore({ score: { value: 754_050, capped: false }, workout: timeWorkout })).toBe("12:34.05");
    expect(formatScore({ score: { value: 754_910, capped: false }, workout: timeWorkout })).toBe("12:34.91");
    expect(formatScore({ score: { value: 754_001, capped: false }, workout: timeWorkout })).toBe("12:34.001");
    expect(formatScore({ score: { value: 3_723_000, capped: false }, workout: timeWorkout })).toBe("1:02:03");
    expect(formatScore({ score: { value: 45_000, capped: false }, workout: timeWorkout })).toBe("0:45");
  });

  it("formats capped time", () => {
    expect(formatScore({ score: { value: 187, capped: true }, workout: timeWorkout })).toBe("CAP+187");
  });

  it("formats reps, rounds+reps, points", () => {
    expect(formatScore({ score: { value: 245, capped: false }, workout: repsWorkout })).toBe("245 reps");
    expect(formatScore({ score: { value: 252, capped: false }, workout: amrap })).toBe("8+12");
    expect(formatScore({ score: { value: 252, capped: false }, workout: amrapNoRound })).toBe("252 reps");
    expect(formatScore({ score: { value: 42, capped: false }, workout: pointsWorkout })).toBe("42 pts");
  });

  it("formats load with up to 2 decimals in the display unit", () => {
    expect(formatScore({ score: { value: 61_235, capped: false }, workout: loadWorkout, weightUnit: "lb" })).toBe("135 lb");
    expect(formatScore({ score: { value: 60_000, capped: false }, workout: loadWorkout, weightUnit: "kg" })).toBe("60 kg");
    expect(formatScore({ score: { value: 62_500, capped: false }, workout: loadWorkout, weightUnit: "kg" })).toBe("62.5 kg");
    expect(formatScore({ score: { value: 60_000, capped: false }, workout: loadWorkout, weightUnit: "lb" })).toBe("132.28 lb");
    expect(formatScore({ score: { value: 61_250, capped: false }, workout: loadWorkout, weightUnit: "kg" })).toBe("61.25 kg");
  });

  it("round-trips parse → format", () => {
    for (const input of ["12:34", "0:45", "12:34.5", "12:34.91", "CAP+187"]) {
      const parsed = parseScore({ input, workout: timeWorkout });
      if (!parsed.ok) throw new Error(parsed.error);
      expect(formatScore({ score: parsed, workout: timeWorkout })).toBe(input);
    }
  });
});

describe("tiebreak", () => {
  it("reuses time parsing/formatting", () => {
    expect(parseTiebreak("4:05")).toEqual({ ok: true, value: 245_000 });
    expect(parseTiebreak("nope").ok).toBe(false);
    expect(formatTiebreak(245_000)).toBe("4:05");
  });
});

function score(overrides: Partial<RankableScore> & { id: string }): RankableScore & { id: string } {
  return { value: 0, capped: false, tiebreakMs: null, scalingRank: 0, ...overrides };
}

describe("compareScores / rankScores", () => {
  it("ranks Rx above Scaled even with a worse score", () => {
    const rxSlow = score({ id: "rx", value: 800_000, scalingRank: 0 });
    const scaledFast = score({ id: "scaled", value: 300_000, scalingRank: 1 });
    expect(compareScores({ a: rxSlow, b: scaledFast, workout: timeWorkout })).toBeLessThan(0);

    const rxCapped = score({ id: "rxcap", value: 10, capped: true, scalingRank: 0 });
    expect(compareScores({ a: rxCapped, b: scaledFast, workout: timeWorkout })).toBeLessThan(0);
  });

  it("ranks finishers before capped, capped by reps desc", () => {
    const ranked = rankScores({
      workout: timeWorkout,
      scores: [
        score({ id: "cap150", value: 150, capped: true }),
        score({ id: "slow", value: 890_000 }),
        score({ id: "cap187", value: 187, capped: true }),
        score({ id: "fast", value: 500_000 }),
      ],
    });
    expect(ranked.map((s) => s.id)).toEqual(["fast", "slow", "cap187", "cap150"]);
    expect(ranked.map((s) => s.rank)).toEqual([1, 2, 3, 4]);
  });

  it("ranks non-time types by value desc", () => {
    const ranked = rankScores({
      workout: repsWorkout,
      scores: [score({ id: "a", value: 100 }), score({ id: "b", value: 200 })],
    });
    expect(ranked.map((s) => s.id)).toEqual(["b", "a"]);
  });

  it("breaks ties by tiebreak asc, missing tiebreak last", () => {
    const ranked = rankScores({
      workout: repsWorkout,
      scores: [
        score({ id: "none", value: 200 }),
        score({ id: "late", value: 200, tiebreakMs: 300_000 }),
        score({ id: "early", value: 200, tiebreakMs: 200_000 }),
      ],
    });
    expect(ranked.map((s) => s.id)).toEqual(["early", "late", "none"]);
    expect(ranked.map((s) => s.rank)).toEqual([1, 2, 3]);
  });

  it("shares rank on exact ties (1, 2, 2, 4)", () => {
    const ranked = rankScores({
      workout: repsWorkout,
      scores: [
        score({ id: "d", value: 50 }),
        score({ id: "b", value: 100 }),
        score({ id: "a", value: 200 }),
        score({ id: "c", value: 100 }),
      ],
    });
    expect(ranked.map((s) => s.rank)).toEqual([1, 2, 2, 4]);
    expect(ranked[3].id).toBe("d");
  });

  it("handles empty input and preserves extra fields", () => {
    expect(rankScores({ workout: repsWorkout, scores: [] })).toEqual([]);
    const [only] = rankScores({ workout: repsWorkout, scores: [score({ id: "x", value: 1 })] });
    expect(only).toMatchObject({ id: "x", rank: 1 });
  });
});
