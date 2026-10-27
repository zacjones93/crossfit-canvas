import { describe, expect, it } from "vitest";
import { planAwardDelta } from "./award-diff";

const existingAwards = [
  { id: "a1", entryId: "e1" },
  { id: "a2", entryId: "e2" },
  { id: "a3", entryId: "e3" },
];

describe("planAwardDelta", () => {
  it("awards only the listed entries that lack the award (deduped)", () => {
    const result = planAwardDelta({ entryIds: ["e1", "e4", "e4"], existingAwards, awarded: true });
    expect(result).toEqual({ toAdd: ["e4"], toRemove: [] });
  });

  it("removes only the listed entries' awards, never anyone else's", () => {
    const result = planAwardDelta({ entryIds: ["e2", "e9"], existingAwards, awarded: false });
    expect(result.toAdd).toEqual([]);
    expect(result.toRemove.map((award) => award.id)).toEqual(["a2"]);
  });

  it("is a no-op when the listed entries already match", () => {
    expect(planAwardDelta({ entryIds: ["e1", "e2"], existingAwards, awarded: true })).toEqual({ toAdd: [], toRemove: [] });
    expect(planAwardDelta({ entryIds: ["e4"], existingAwards, awarded: false })).toEqual({ toAdd: [], toRemove: [] });
  });
});
