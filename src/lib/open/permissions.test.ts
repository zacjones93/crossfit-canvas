import { describe, expect, it } from "vitest";
import { decideManageContext, decideManageEntry, type ManageContext, type ManageDecision } from "./permissions";

const event = { id: "ev1", coachPointsEnabled: true, coachScoresEnabled: true };
const weeklyRule = { eventId: "ev1", cadence: "per_week", coachAwardable: true, isActive: true };
const onceRule = { ...weeklyRule, cadence: "once_per_event" };
const unlimitedRule = { ...weeklyRule, cadence: "unlimited" };
const week = { id: "w1", eventId: "ev1", lockedAt: null };
const lockedWeek = { ...week, lockedAt: new Date() };
const workout = { eventId: "ev1", weekId: "w1" };
const scaling = { eventId: "ev1" };
const teams = new Set(["t1"]);

const coachPoints: ManageContext = {
  kind: "points",
  isAdmin: false,
  manageableTeamIds: teams,
  event,
  rule: weeklyRule,
  week,
};
const coachScores: ManageContext = {
  kind: "scores",
  isAdmin: false,
  manageableTeamIds: teams,
  event,
  workout,
  week,
  scaling,
};
const ownEntry = { eventId: "ev1", teamId: "t1" };

function code(decision: ManageDecision) {
  return decision.ok ? "OK" : decision.code;
}

function full({ context, entry = ownEntry }: { context: ManageContext; entry?: typeof ownEntry | { eventId: string; teamId: string | null } }) {
  const contextDecision = decideManageContext(context);
  return contextDecision.ok ? code(decideManageEntry({ context, entry })) : code(contextDecision);
}

describe("decideManageContext", () => {
  it("accepts well-formed points and scores contexts", () => {
    expect(code(decideManageContext(coachPoints))).toBe("OK");
    expect(code(decideManageContext(coachScores))).toBe("OK");
  });

  it("requires a week for weekly rules", () => {
    expect(code(decideManageContext({ ...coachPoints, week: undefined }))).toBe("PRECONDITION_FAILED");
    expect(code(decideManageContext({ ...coachPoints, week: undefined, isAdmin: true }))).toBe("PRECONDITION_FAILED");
  });

  it("rejects a week on once-per-event rules", () => {
    expect(code(decideManageContext({ ...coachPoints, rule: onceRule }))).toBe("PRECONDITION_FAILED");
    expect(code(decideManageContext({ ...coachPoints, rule: onceRule, week: undefined }))).toBe("OK");
  });

  it("allows unlimited rules with or without a week", () => {
    expect(code(decideManageContext({ ...coachPoints, rule: unlimitedRule }))).toBe("OK");
    expect(code(decideManageContext({ ...coachPoints, rule: unlimitedRule, week: undefined }))).toBe("OK");
  });

  it("enforces the same-event invariant even for admins", () => {
    for (const context of [
      { ...coachPoints, rule: { ...weeklyRule, eventId: "ev2" } },
      { ...coachPoints, week: { ...week, eventId: "ev2" } },
      { ...coachScores, workout: { ...workout, eventId: "ev2" } },
      { ...coachScores, scaling: { eventId: "ev2" } },
    ]) {
      expect(code(decideManageContext({ ...context, isAdmin: true }))).toBe("PRECONDITION_FAILED");
    }
  });

  it("returns NOT_FOUND for requested-but-missing refs", () => {
    expect(code(decideManageContext({ ...coachPoints, rule: null, isAdmin: true }))).toBe("NOT_FOUND");
    expect(code(decideManageContext({ ...coachScores, scaling: null }))).toBe("NOT_FOUND");
  });

  it("requires a rule for points and a workout for scores", () => {
    expect(code(decideManageContext({ ...coachPoints, rule: undefined }))).toBe("PRECONDITION_FAILED");
    expect(code(decideManageContext({ ...coachScores, workout: undefined }))).toBe("PRECONDITION_FAILED");
  });

  it("allows scores for workouts with no week", () => {
    expect(code(decideManageContext({ ...coachScores, workout: { eventId: "ev1", weekId: null }, week: undefined }))).toBe("OK");
  });
});

describe("decideManageEntry", () => {
  it("allows a coach on the entry's team", () => {
    expect(full({ context: coachPoints })).toBe("OK");
    expect(full({ context: coachScores })).toBe("OK");
  });

  it("forbids a coach on the wrong team or for team-less entries", () => {
    expect(full({ context: coachPoints, entry: { eventId: "ev1", teamId: "t2" } })).toBe("FORBIDDEN");
    expect(full({ context: coachPoints, entry: { eventId: "ev1", teamId: null } })).toBe("FORBIDDEN");
  });

  it("lets admins bypass team checks but not the entry's event", () => {
    const admin = { ...coachPoints, isAdmin: true, manageableTeamIds: new Set<string>() };
    expect(full({ context: admin, entry: { eventId: "ev1", teamId: "t2" } })).toBe("OK");
    expect(full({ context: admin, entry: { eventId: "ev2", teamId: "t1" } })).toBe("PRECONDITION_FAILED");
    expect(full({ context: coachPoints, entry: { eventId: "ev2", teamId: "t1" } })).toBe("PRECONDITION_FAILED");
  });

  it("respects per-kind event flags for coaches only", () => {
    const noPoints = { ...event, coachPointsEnabled: false };
    const noScores = { ...event, coachScoresEnabled: false };
    expect(full({ context: { ...coachPoints, event: noPoints } })).toBe("FORBIDDEN");
    expect(full({ context: { ...coachScores, event: noPoints } })).toBe("OK");
    expect(full({ context: { ...coachScores, event: noScores } })).toBe("FORBIDDEN");
    expect(full({ context: { ...coachPoints, event: noPoints, isAdmin: true } })).toBe("OK");
  });

  it("blocks coaches on locked weeks, not admins", () => {
    expect(full({ context: { ...coachPoints, week: lockedWeek } })).toBe("PRECONDITION_FAILED");
    expect(full({ context: { ...coachScores, week: lockedWeek } })).toBe("PRECONDITION_FAILED");
    expect(full({ context: { ...coachPoints, week: lockedWeek, isAdmin: true } })).toBe("OK");
  });

  it("requires coachAwardable and active rules for coaches", () => {
    expect(full({ context: { ...coachPoints, rule: { ...weeklyRule, coachAwardable: false } } })).toBe("FORBIDDEN");
    expect(full({ context: { ...coachPoints, rule: { ...weeklyRule, isActive: false } } })).toBe("PRECONDITION_FAILED");
    expect(
      full({ context: { ...coachPoints, rule: { ...weeklyRule, coachAwardable: false, isActive: false }, isAdmin: true } }),
    ).toBe("OK");
  });
});
