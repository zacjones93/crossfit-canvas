import { describe, expect, it } from "vitest";
import { classifyDbError } from "./db-errors";

describe("classifyDbError", () => {
  it("recognises D1 constraint messages", () => {
    expect(classifyDbError(new Error("D1_ERROR: FOREIGN KEY constraint failed: SQLITE_CONSTRAINT"))).toBe("foreign_key");
    expect(classifyDbError(new Error("UNIQUE constraint failed: open_team.event_id, open_team.slug"))).toBe("unique");
    expect(classifyDbError(new Error("CHECK constraint failed: open_award_dedupe_key_check"))).toBe("check");
  });

  it("walks the cause chain (drizzle wraps driver errors)", () => {
    const wrapped = new Error("Failed query: insert into ...", {
      cause: new Error("D1_ERROR: UNIQUE constraint failed: open_award.entry_id"),
    });
    expect(classifyDbError(wrapped)).toBe("unique");
  });

  it("returns null for anything else", () => {
    expect(classifyDbError(new Error("network down"))).toBeNull();
    expect(classifyDbError(undefined)).toBeNull();
  });
});
