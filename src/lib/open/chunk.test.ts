import { describe, expect, it } from "vitest";
import { chunk, MAX_BOUND_PARAMS, rowsPerInsert } from "./chunk";

describe("chunk", () => {
  it("splits into fixed-size pieces with a short tail", () => {
    expect(chunk({ items: [1, 2, 3, 4, 5], size: 2 })).toEqual([[1, 2], [3, 4], [5]]);
  });

  it("returns no chunks for an empty list", () => {
    expect(chunk({ items: [], size: 3 })).toEqual([]);
  });

  it("rejects non-positive sizes", () => {
    expect(() => chunk({ items: [1], size: 0 })).toThrow();
  });
});

describe("rowsPerInsert", () => {
  it("keeps rows × columns within the bound-param cap", () => {
    expect(rowsPerInsert(12) * 12).toBeLessThanOrEqual(MAX_BOUND_PARAMS);
    expect(rowsPerInsert(12)).toBe(7);
  });

  it("always allows at least one row", () => {
    expect(rowsPerInsert(500)).toBe(1);
  });
});
