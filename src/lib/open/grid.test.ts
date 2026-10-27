import { describe, expect, it } from "vitest";
import {
  AWARD_EVENT_VIEW,
  decidePointsView,
  decideScoresView,
  editableRuleIds,
  resolveAwardView,
  resolveWorkout,
  rulesForView,
  type ViewerScope,
} from "./grid";

const event = { id: "ev1", coachPointsEnabled: true, coachScoresEnabled: true };
const coach: ViewerScope = { isAdmin: false, manageableTeamIds: new Set(["t1"]), event, teamId: "t1" };
const admin: ViewerScope = { isAdmin: true, manageableTeamIds: new Set(), event, teamId: null };
const week = { id: "w1", eventId: "ev1", lockedAt: null };
const lockedWeek = { ...week, lockedAt: new Date() };

const rule = (id: string, overrides: Partial<{ cadence: string; coachAwardable: boolean; isActive: boolean }> = {}) => ({
  id,
  eventId: "ev1",
  cadence: "per_week",
  coachAwardable: true,
  isActive: true,
  ...overrides,
});

describe("resolveAwardView", () => {
  const weeks = [
    { id: "w1", number: 1, startsAt: new Date("2026-02-01") },
    { id: "w2", number: 2, startsAt: new Date("2026-02-08") },
    { id: "w3", number: 3, startsAt: new Date("2026-02-15") },
  ];

  it("honors an explicit week number or the event view", () => {
    expect(resolveAwardView({ weeks, requested: "3", now: new Date("2026-01-01") }).week?.id).toBe("w3");
    expect(resolveAwardView({ weeks, requested: AWARD_EVENT_VIEW, now: new Date() }).week).toBeNull();
  });

  it("defaults to the latest started week, else the first", () => {
    expect(resolveAwardView({ weeks, requested: null, now: new Date("2026-02-10") }).week?.id).toBe("w2");
    expect(resolveAwardView({ weeks, requested: "9", now: new Date("2026-01-01") }).week?.id).toBe("w1");
  });

  it("falls back to the event view without weeks", () => {
    expect(resolveAwardView({ weeks: [], requested: "1", now: new Date() }).week).toBeNull();
  });
});

describe("resolveWorkout", () => {
  const workouts = [{ slug: "a" }, { slug: "b" }];
  it("picks by slug, defaulting to the first", () => {
    expect(resolveWorkout({ workouts, requested: "b" })?.slug).toBe("b");
    expect(resolveWorkout({ workouts, requested: "zzz" })?.slug).toBe("a");
    expect(resolveWorkout({ workouts: [], requested: null })).toBeNull();
  });
});

describe("rulesForView", () => {
  const rules = [
    rule("weekly"),
    rule("once", { cadence: "once_per_event" }),
    rule("repeat", { cadence: "unlimited" }),
    rule("retired", { isActive: false }),
  ];

  it("shows weekly + repeatable rules for a week, once-per-event + repeatable for the event", () => {
    const none = new Set<string>();
    expect(rulesForView({ rules, isEventView: false, awardedRuleIds: none }).map((r) => r.id)).toEqual(["weekly", "repeat"]);
    expect(rulesForView({ rules, isEventView: true, awardedRuleIds: none }).map((r) => r.id)).toEqual(["once", "repeat"]);
  });

  it("keeps a retired rule only while it holds awards", () => {
    const ids = rulesForView({ rules, isEventView: false, awardedRuleIds: new Set(["retired"]) }).map((r) => r.id);
    expect(ids).toContain("retired");
  });
});

describe("editableRuleIds", () => {
  const rules = [rule("open"), rule("adminOnly", { coachAwardable: false }), rule("retired", { isActive: false })];

  it("admins may edit every rule, even in a locked week", () => {
    expect(editableRuleIds({ scope: admin, rules, week: lockedWeek })).toEqual(["open", "adminOnly", "retired"]);
  });

  it("coaches only get awardable, active rules on their team", () => {
    expect(editableRuleIds({ scope: coach, rules, week })).toEqual(["open"]);
    expect(editableRuleIds({ scope: { ...coach, teamId: "t2" }, rules, week })).toEqual([]);
  });

  it("coaches get nothing when the flag is off or the week is locked", () => {
    const flagOff = { ...coach, event: { ...event, coachPointsEnabled: false } };
    expect(editableRuleIds({ scope: flagOff, rules, week })).toEqual([]);
    expect(editableRuleIds({ scope: coach, rules, week: lockedWeek })).toEqual([]);
  });
});

describe("view decisions", () => {
  it("explains why a coach's points view is read-only", () => {
    const flagOff = { ...coach, event: { ...event, coachPointsEnabled: false } };
    expect(decidePointsView({ scope: coach, week }).ok).toBe(true);
    expect(decidePointsView({ scope: flagOff, week })).toMatchObject({ ok: false, message: expect.stringMatching(/disabled/) });
    expect(decidePointsView({ scope: coach, week: lockedWeek })).toMatchObject({ ok: false, message: "This week is locked" });
  });

  it("checks scores against the workout's week and the scores flag", () => {
    const workout = { eventId: "ev1", weekId: "w1" };
    expect(decideScoresView({ scope: coach, workout, week }).ok).toBe(true);
    expect(decideScoresView({ scope: coach, workout, week: lockedWeek }).ok).toBe(false);
    expect(decideScoresView({ scope: admin, workout, week: lockedWeek }).ok).toBe(true);
    const flagOff = { ...coach, event: { ...event, coachScoresEnabled: false } };
    expect(decideScoresView({ scope: flagOff, workout, week }).ok).toBe(false);
  });
});
