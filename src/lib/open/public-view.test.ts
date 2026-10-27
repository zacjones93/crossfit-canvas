import { describe, expect, it } from "vitest";
import {
  decideEventVisibility,
  formatAverage,
  initials,
  orderTeams,
  parseStandingsSort,
  rankTeams,
  tiebreakLabel,
  weekColumns,
  withStandingRanks,
} from "./public-view";
import { NO_WEEK_KEY } from "./standings";
import { getCoachPhoto } from "./coach-photo";

describe("decideEventVisibility", () => {
  it("shows live/closed to everyone and drafts to admins only", () => {
    expect(decideEventVisibility({ status: "live", isAdmin: false })).toBe("public");
    expect(decideEventVisibility({ status: "closed", isAdmin: false })).toBe("public");
    expect(decideEventVisibility({ status: "draft", isAdmin: false })).toBe("hidden");
    expect(decideEventVisibility({ status: "draft", isAdmin: true })).toBe("preview");
    expect(decideEventVisibility({ status: "live", isAdmin: true })).toBe("public");
  });
});

describe("rankTeams", () => {
  const teams = [
    { name: "B", total: 10, avgPerMember: 5 },
    { name: "A", total: 10, avgPerMember: 2 },
    { name: "C", total: 4, avgPerMember: 4 },
  ];

  it("ranks by total with shared ranks and name tiebreak", () => {
    expect(rankTeams({ teams }).map((t) => [t.name, t.rank])).toEqual([
      ["A", 1],
      ["B", 1],
      ["C", 3],
    ]);
  });

  it("ranks by average", () => {
    expect(rankTeams({ teams, sort: "avg" }).map((t) => [t.name, t.rank])).toEqual([
      ["B", 1],
      ["C", 2],
      ["A", 3],
    ]);
  });
});

describe("parseStandingsSort / initials / getCoachPhoto", () => {
  it("parses sort", () => {
    expect(parseStandingsSort("avg")).toBe("avg");
    expect(parseStandingsSort(["avg"])).toBe("total");
    expect(parseStandingsSort(undefined)).toBe("total");
  });

  it("builds initials", () => {
    expect(initials("Red Rhinos United")).toBe("RR");
    expect(initials(" zac ")).toBe("Z");
  });

  it("finds coach photos by slug", () => {
    expect(getCoachPhoto({ slug: "abi-williams" })).toBe("/assets/coaches/abi-williams.png");
    expect(getCoachPhoto({ slug: "nobody" })).toBeNull();
  });
});

describe("weekColumns / formatAverage", () => {
  const weeks = [
    { id: "w1", number: 1, label: "Week 1" },
    { id: "w2", number: 2, label: "Week 2" },
  ];

  it("lists weeks and adds the event column only when event-level points exist", () => {
    expect(weekColumns({ weeks, teams: [{ byWeek: { w1: 3 } }] }).map((c) => c.key)).toEqual(["w1", "w2"]);
    expect(weekColumns({ weeks, teams: [{ byWeek: { [NO_WEEK_KEY]: 5 } }] }).map((c) => c.shortLabel)).toEqual([
      "W1",
      "W2",
      "Event",
    ]);
  });

  it("formats averages to one decimal", () => {
    expect(formatAverage(12.345)).toBe("12.3");
    expect(formatAverage(0)).toBe("0.0");
  });
});

describe("withStandingRanks / orderTeams", () => {
  const teams = [
    { id: "b", name: "B", total: 10, avgPerMember: 5 },
    { id: "a", name: "A", total: 10, avgPerMember: 2 },
    { id: "c", name: "C", total: 4, avgPerMember: 4 },
  ];

  it("adds total and average ranks in total order", () => {
    expect(withStandingRanks({ teams }).map((t) => [t.id, t.rank, t.avgRank])).toEqual([
      ["a", 1, 3],
      ["b", 1, 1],
      ["c", 3, 2],
    ]);
  });

  it("orders by the chosen rank without re-ranking", () => {
    const ranked = withStandingRanks({ teams });
    expect(orderTeams({ teams: ranked, sort: "avg" }).map((t) => t.id)).toEqual(["b", "c", "a"]);
    expect(orderTeams({ teams: ranked, sort: "total" }).map((t) => t.id)).toEqual(["a", "b", "c"]);
  });
});

describe("tiebreakLabel", () => {
  it("shows the tiebreak only when the workout uses one and the score has it", () => {
    expect(tiebreakLabel({ workout: { hasTiebreak: true }, tiebreakMs: 301000 })).toBe("TB 5:01");
    expect(tiebreakLabel({ workout: { hasTiebreak: true }, tiebreakMs: null })).toBeNull();
    expect(tiebreakLabel({ workout: { hasTiebreak: false }, tiebreakMs: 301000 })).toBeNull();
  });
});
