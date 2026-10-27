import { describe, expect, it } from "vitest";
import { awardDedupeKey } from "./awards";

describe("awardDedupeKey", () => {
  it("maps cadence to dedupe key", () => {
    expect(awardDedupeKey({ cadence: "per_week", weekId: "w1" })).toBe("w1");
    expect(awardDedupeKey({ cadence: "once_per_event", weekId: null })).toBe("event");
    expect(awardDedupeKey({ cadence: "unlimited", weekId: "w1" })).toBeNull();
    expect(awardDedupeKey({ cadence: "unlimited", weekId: null })).toBeNull();
  });

  it("throws for weekly rules without a week and unknown cadences", () => {
    expect(() => awardDedupeKey({ cadence: "per_week", weekId: null })).toThrow();
    expect(() => awardDedupeKey({ cadence: "hourly", weekId: null })).toThrow();
  });
});
