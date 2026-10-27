import { describe, expect, it } from "vitest";
import { diffAwards } from "./award-diff";

const existingAwards = [
  { id: "a1", entryId: "e1" },
  { id: "a2", entryId: "e2" },
  { id: "a3", entryId: "e3" },
];

describe("diffAwards", () => {
  it("adds missing and removes undesired awards within scope", () => {
    const result = diffAwards({
      desiredEntryIds: ["e1", "e4"],
      existingAwards,
      scopeEntryIds: new Set(["e1", "e2", "e3", "e4"]),
    });
    expect(result.toAdd).toEqual(["e4"]);
    expect(result.toRemove.map((award) => award.id)).toEqual(["a2", "a3"]);
  });

  it("never removes awards outside scope (other teams)", () => {
    const result = diffAwards({
      desiredEntryIds: [],
      existingAwards,
      scopeEntryIds: new Set(["e1"]),
    });
    expect(result.toAdd).toEqual([]);
    expect(result.toRemove.map((award) => award.id)).toEqual(["a1"]);
  });

  it("is a no-op when state already matches, and dedupes desired ids", () => {
    const result = diffAwards({
      desiredEntryIds: ["e1", "e2", "e3", "e1"],
      existingAwards,
      scopeEntryIds: new Set(["e1", "e2", "e3"]),
    });
    expect(result).toEqual({ toAdd: [], toRemove: [] });
  });
});
