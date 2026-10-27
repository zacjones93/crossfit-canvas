import { describe, expect, it } from "vitest";
import { resolveEventSlug } from "./event-slug";

describe("resolveEventSlug", () => {
  it("prefers the explicit slug, else derives from the name", () => {
    expect(resolveEventSlug({ slug: "open-2027", name: "Whatever" })).toEqual({ ok: true, slug: "open-2027" });
    expect(resolveEventSlug({ name: "Open 2027!" })).toEqual({ ok: true, slug: "open-2027" });
  });

  it("rejects reserved slugs, explicit or derived", () => {
    expect(resolveEventSlug({ slug: "media" }).ok).toBe(false);
    expect(resolveEventSlug({ name: "Media" }).ok).toBe(false);
  });

  it("rejects names with no slug characters", () => {
    expect(resolveEventSlug({ name: "!!!" }).ok).toBe(false);
  });
});
