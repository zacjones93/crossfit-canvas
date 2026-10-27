import { describe, expect, it } from "vitest";
import { awardLabel, describeAward, diffRow, formatPoints, toAuditJson } from "./audit";

describe("toAuditJson", () => {
  it("drops timestamps and updateCounter, keeps the rest (incl. nulls)", () => {
    const json = toAuditJson({
      id: "otm_1",
      name: "Red",
      color: null,
      createdAt: new Date(0),
      updatedAt: new Date(0),
      updateCounter: 3,
    });
    expect(JSON.parse(json!)).toEqual({ id: "otm_1", name: "Red", color: null });
  });

  it("returns null for a missing row", () => {
    expect(toAuditJson(null)).toBeNull();
    expect(toAuditJson(undefined)).toBeNull();
  });
});

describe("formatPoints / awardLabel", () => {
  it("pluralises points", () => {
    expect(formatPoints(1)).toBe("1 pt");
    expect(formatPoints(3)).toBe("3 pts");
    expect(formatPoints(0)).toBe("0 pts");
  });

  it("includes the week when present", () => {
    expect(awardLabel({ ruleName: "Costume", weekLabel: "Week 2" })).toBe("Costume (Week 2)");
    expect(awardLabel({ ruleName: "Judges Course", weekLabel: null })).toBe("Judges Course");
  });
});

describe("diffRow", () => {
  const before = { id: "w1", label: "Week 1", startsAt: new Date(1000), lockedAt: null as Date | null };

  it("returns only fields that change", () => {
    const result = diffRow({ before, updates: { label: "Week One", startsAt: new Date(1000), lockedAt: undefined } });
    expect(result.changedKeys).toEqual(["label"]);
    expect(result.changes).toEqual({ label: "Week One" });
    expect(result.after).toEqual({ ...before, label: "Week One" });
  });

  it("treats null as a real value (clearing a field)", () => {
    const result = diffRow({ before: { ...before, lockedAt: new Date(5) as Date | null }, updates: { lockedAt: null } });
    expect(result.changedKeys).toEqual(["lockedAt"]);
  });

  it("is empty for a no-op update", () => {
    expect(diffRow({ before, updates: {} }).changedKeys).toEqual([]);
  });
});

describe("describeAward", () => {
  it("formats award and removal summaries", () => {
    expect(describeAward({ verb: "Awarded", ruleName: "Costume", weekLabel: "Week 2", athlete: "Jane Doe", points: 1 })).toBe(
      "Awarded Costume (Week 2) to Jane Doe — 1 pt",
    );
    expect(
      describeAward({ verb: "Removed", ruleName: "Judges Course", athlete: "Jane Doe", points: 3, reason: "athlete removed" }),
    ).toBe("Removed Judges Course from Jane Doe — 3 pts (athlete removed)");
  });
});
