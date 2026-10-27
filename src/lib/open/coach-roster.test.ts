import { describe, expect, it } from "vitest";
import { backfillCoachRequests, planCoachRoster, type CoachRosterState } from "./coach-roster";

const teams = [
  { id: "t1", name: "Rhinos", sortOrder: 1 },
  { id: "t2", name: "Bears", sortOrder: 0 },
];

function stateWith(overrides: Partial<CoachRosterState> = {}): CoachRosterState {
  return {
    teams,
    coaches: [
      { id: "kim", name: "Kim" },
      { id: "lee", name: "Lee" },
      { id: "mo", name: "Mo" },
    ],
    linkedParticipants: [],
    entries: [],
    ...overrides,
  };
}

describe("planCoachRoster", () => {
  it("creates an entry with a new linked participant when the coach has none", () => {
    const plan = planCoachRoster({ requests: [{ coachId: "kim", teamId: "t1" }], state: stateWith(), move: false });
    expect(plan).toEqual({
      steps: [{ kind: "create", coachId: "kim", coachName: "Kim", teamId: "t1", participantId: null }],
      notes: [],
    });
  });

  it("reuses the coach's linked participant from an earlier event", () => {
    const state = stateWith({ linkedParticipants: [{ id: "p-kim", name: "Kimberly", coachId: "kim" }] });
    const plan = planCoachRoster({ requests: [{ coachId: "kim", teamId: "t1" }], state, move: false });
    expect(plan.steps).toEqual([{ kind: "create", coachId: "kim", coachName: "Kim", teamId: "t1", participantId: "p-kim" }]);
  });

  it("does nothing when the coach is already on the team", () => {
    const state = stateWith({
      linkedParticipants: [{ id: "p-kim", name: "Kim", coachId: "kim" }],
      entries: [{ id: "e1", participantId: "p-kim", teamId: "t1", participantName: "Kim", participantCoachId: "kim" }],
    });
    expect(planCoachRoster({ requests: [{ coachId: "kim", teamId: "t1" }], state, move: true })).toEqual({ steps: [], notes: [] });
  });

  it("leaves an entry on another team with a note unless moving", () => {
    const state = stateWith({
      linkedParticipants: [{ id: "p-kim", name: "Kim", coachId: "kim" }],
      entries: [{ id: "e1", participantId: "p-kim", teamId: "t2", participantName: "Kim", participantCoachId: "kim" }],
    });
    expect(planCoachRoster({ requests: [{ coachId: "kim", teamId: "t1" }], state, move: false })).toEqual({
      steps: [],
      notes: ["Kim is already on Bears's roster"],
    });
    expect(planCoachRoster({ requests: [{ coachId: "kim", teamId: "t1" }], state, move: true }).steps).toEqual([
      { kind: "move", coachId: "kim", coachName: "Kim", entryId: "e1", fromTeamId: "t2", teamId: "t1" },
    ]);
  });

  it("puts a team-less entry on the team even without move", () => {
    const state = stateWith({
      linkedParticipants: [{ id: "p-kim", name: "Kim", coachId: "kim" }],
      entries: [{ id: "e1", participantId: "p-kim", teamId: null, participantName: "Kim", participantCoachId: "kim" }],
    });
    expect(planCoachRoster({ requests: [{ coachId: "kim", teamId: "t1" }], state, move: false }).steps).toEqual([
      { kind: "move", coachId: "kim", coachName: "Kim", entryId: "e1", fromTeamId: null, teamId: "t1" },
    ]);
  });

  it("skips (with a note) when an unlinked athlete with the coach's name is in the event", () => {
    const state = stateWith({
      entries: [{ id: "e1", participantId: "p-x", teamId: "t1", participantName: " lee ", participantCoachId: null }],
    });
    const plan = planCoachRoster({ requests: [{ coachId: "lee", teamId: "t1" }], state, move: true });
    expect(plan.steps).toEqual([]);
    expect(plan.notes).toEqual([" lee  is already in this event but not linked to coach Lee; link them on the Participants page"]);
  });

  it("plans each coach once (first request wins)", () => {
    const plan = planCoachRoster({
      requests: [
        { coachId: "mo", teamId: "t2" },
        { coachId: "mo", teamId: "t1" },
      ],
      state: stateWith(),
      move: false,
    });
    expect(plan.steps).toEqual([{ kind: "create", coachId: "mo", coachName: "Mo", teamId: "t2", participantId: null }]);
  });
});

describe("backfillCoachRequests", () => {
  it("puts each coach on their first team (by sortOrder) and ignores teams outside the event", () => {
    const state = stateWith();
    const requests = backfillCoachRequests({
      assignments: [
        { coachId: "kim", teamId: "t1" },
        { coachId: "kim", teamId: "t2" },
        { coachId: "lee", teamId: "t1" },
        { coachId: "mo", teamId: "gone" },
      ],
      state,
    });
    expect(requests).toEqual([
      { coachId: "kim", teamId: "t2" },
      { coachId: "lee", teamId: "t1" },
    ]);
    expect(planCoachRoster({ requests, state, move: false }).steps.map((step) => [step.coachId, step.teamId])).toEqual([
      ["kim", "t2"],
      ["lee", "t1"],
    ]);
  });

  it("skips silently when the coach is entered on any team they coach; notes other teams", () => {
    const state = stateWith({
      linkedParticipants: [
        { id: "p-kim", name: "Kim", coachId: "kim" },
        { id: "p-lee", name: "Lee", coachId: "lee" },
      ],
      entries: [
        { id: "e1", participantId: "p-kim", teamId: "t1", participantName: "Kim", participantCoachId: "kim" },
        { id: "e2", participantId: "p-lee", teamId: "t2", participantName: "Lee", participantCoachId: "lee" },
      ],
    });
    const requests = backfillCoachRequests({
      assignments: [
        { coachId: "kim", teamId: "t1" },
        { coachId: "kim", teamId: "t2" },
        { coachId: "lee", teamId: "t1" },
      ],
      state,
    });
    expect(planCoachRoster({ requests, state, move: false })).toEqual({
      steps: [],
      notes: ["Lee is already on Bears's roster"],
    });
  });
});
