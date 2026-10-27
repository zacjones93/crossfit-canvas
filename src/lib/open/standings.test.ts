import { describe, expect, it } from "vitest";
import { computeStandings, NO_WEEK_KEY, type StandingsTeam } from "./standings";

const teams: StandingsTeam[] = [
  { id: "t1", name: "Red", slug: "red", color: "#f00", sortOrder: 0 },
  { id: "t2", name: "Blue", slug: "blue", color: null, sortOrder: 1 },
  { id: "t3", name: "Empty", slug: "empty", color: null, sortOrder: 2 },
];

const entries = [
  { id: "e1", teamId: "t1", participantName: "Ann" },
  { id: "e2", teamId: "t1", participantName: "Bob" },
  { id: "e3", teamId: "t2", participantName: "Cat" },
  { id: "e4", teamId: null, participantName: "Dan" },
  { id: "e5", teamId: "gone", participantName: "Eve" },
];

const awards = [
  { entryId: "e1", ruleId: "r1", weekId: "w1", points: 1 },
  { entryId: "e1", ruleId: "r2", weekId: "w1", points: 5 },
  { entryId: "e2", ruleId: "r1", weekId: "w2", points: 1 },
  { entryId: "e2", ruleId: "r3", weekId: null, points: 3 },
  { entryId: "e3", ruleId: "r2", weekId: "w1", points: 5 },
  { entryId: "e4", ruleId: "r1", weekId: "w1", points: 1 },
  { entryId: "e5", ruleId: "r1", weekId: "w1", points: 2 },
  { entryId: "missing", ruleId: "r1", weekId: "w1", points: 100 },
];

describe("computeStandings", () => {
  const result = computeStandings({ teams, entries, awards });

  it("totals per team, sorted by total desc", () => {
    expect(result.teams.map((t) => [t.id, t.total])).toEqual([
      ["t1", 10],
      ["t2", 5],
      ["t3", 0],
    ]);
  });

  it("counts members and averages per member (0 when empty)", () => {
    const [red, blue, empty] = result.teams;
    expect(red.memberCount).toBe(2);
    expect(red.avgPerMember).toBe(5);
    expect(blue.avgPerMember).toBe(5);
    expect(empty.memberCount).toBe(0);
    expect(empty.avgPerMember).toBe(0);
  });

  it("breaks down by week and rule", () => {
    const red = result.teams[0];
    expect(red.byWeek).toEqual({ w1: 6, w2: 1, [NO_WEEK_KEY]: 3 });
    expect(red.byRule).toEqual({ r1: 2, r2: 5, r3: 3 });
    expect(result.teams[2].byWeek).toEqual({});
  });

  it("puts points of team-less or unknown-team entries into unassigned", () => {
    expect(result.unassigned).toBe(3);
  });

  it("ignores awards for unknown entries", () => {
    const grand = result.teams.reduce((sum, t) => sum + t.total, 0) + result.unassigned;
    expect(grand).toBe(18);
  });

  it("lists individuals sorted by total desc then name", () => {
    expect(result.individuals.map((i) => [i.entryId, i.total])).toEqual([
      ["e1", 6],
      ["e3", 5],
      ["e2", 4],
      ["e5", 2],
      ["e4", 1],
    ]);
    expect(result.individuals[0]).toEqual({ entryId: "e1", name: "Ann", teamId: "t1", total: 6 });
  });

  it("breaks team ties by name", () => {
    const tied = computeStandings({
      teams,
      entries: [],
      awards: [],
    });
    expect(tied.teams.map((t) => t.name)).toEqual(["Blue", "Empty", "Red"]);
    expect(tied.unassigned).toBe(0);
    expect(tied.individuals).toEqual([]);
  });

  it("does not mutate inputs", () => {
    expect(teams[0]).toEqual({ id: "t1", name: "Red", slug: "red", color: "#f00", sortOrder: 0 });
  });
});
