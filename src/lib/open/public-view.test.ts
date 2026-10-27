import { describe, expect, it } from "vitest";
import {
  buildTeamRosters,
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

describe("buildTeamRosters ordering", () => {
  const entries = [
    { entryId: "e1", teamId: "t", name: "Cy", coachId: null, total: 5 },
    { entryId: "e2", teamId: "t", name: "Al", coachId: "c1", total: 5 },
    { entryId: "e3", teamId: "t", name: "Bo", coachId: "c2", total: 9 },
    { entryId: "e4", teamId: "t", name: "Di", coachId: null, total: 0 },
  ];
  const teamCoaches = [
    { teamId: "t", coachId: "c1", name: "Al", slug: "al" },
    { teamId: "other", coachId: "c2", name: "Bo", slug: "bo" },
  ];

  it("sorts by points desc, ties by name, and flags only this team's coaches", () => {
    const members = buildTeamRosters({ entries, teamCoaches, showIndividuals: true }).get("t")!.members;
    expect(members.map((member) => [member.name, member.isCoach, member.entryId])).toEqual([
      ["Bo", false, "e3"], // coaches another team: a regular member here
      ["Al", true, "e2"],
      ["Cy", false, "e1"],
      ["Di", false, "e4"],
    ]);
  });

  it("sorts alphabetically when individuals are hidden", () => {
    const members = buildTeamRosters({ entries, teamCoaches, showIndividuals: false }).get("t")!.members;
    expect(members.map((member) => member.name)).toEqual(["Al", "Bo", "Cy", "Di"]);
  });
});

describe("buildTeamRosters", () => {
  const entries = [
    { entryId: "zed", teamId: "t1", name: "Zed", coachId: null, total: 3 },
    { entryId: "kim", teamId: "t1", name: "Coach Kim", coachId: "k", total: 7 },
    { entryId: "amy", teamId: "t1", name: "Amy", coachId: null, total: 3 },
    { entryId: "lee", teamId: "t2", name: "Coach Lee", coachId: "l", total: 4 },
    { entryId: "free", teamId: null, name: "Free Agent", coachId: null, total: 1 },
  ];
  const teamCoaches = [
    { teamId: "t1", coachId: "k", name: "Coach Kim", slug: "kim" },
    { teamId: "t1", coachId: "l", name: "Coach Lee", slug: "lee" },
    { teamId: "t3", coachId: "m", name: "Coach Mo", slug: "mo" },
  ];

  it("groups members per team with points, coach flags, and coach roster status", () => {
    const rosters = buildTeamRosters({ entries, teamCoaches, showIndividuals: true });
    expect(rosters.get("t1")).toEqual({
      coaches: [
        { name: "Coach Kim", slug: "kim", onRoster: true, points: 7 },
        { name: "Coach Lee", slug: "lee", onRoster: false },
      ],
      members: [
        { entryId: "kim", name: "Coach Kim", isCoach: true, points: 7 },
        { entryId: "amy", name: "Amy", isCoach: false, points: 3 },
        { entryId: "zed", name: "Zed", isCoach: false, points: 3 },
      ],
    });
    // Lee coaches t1 but competes on t2: a regular member there
    expect(rosters.get("t2")?.members).toEqual([{ entryId: "lee", name: "Coach Lee", isCoach: false, points: 4 }]);
    expect(rosters.get("t3")).toEqual({ coaches: [{ name: "Coach Mo", slug: "mo", onRoster: false }], members: [] });
  });

  it("omits per-person points and sorts alphabetically when individuals are hidden", () => {
    const rosters = buildTeamRosters({ entries, teamCoaches, showIndividuals: false });
    expect(rosters.get("t1")).toEqual({
      coaches: [
        { name: "Coach Kim", slug: "kim", onRoster: true },
        { name: "Coach Lee", slug: "lee", onRoster: false },
      ],
      members: [
        { entryId: "amy", name: "Amy", isCoach: false },
        { entryId: "kim", name: "Coach Kim", isCoach: true },
        { entryId: "zed", name: "Zed", isCoach: false },
      ],
    });
  });
});
