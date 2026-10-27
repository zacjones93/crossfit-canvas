import { describe, expect, it } from "vitest";
import {
  isServableMediaKey,
  sniffTeamPhotoType,
  TEAM_PHOTO_MAX_BYTES,
  teamPhotoKey,
  teamPhotoUrl,
  validateTeamPhoto,
} from "./team-photo";

describe("validateTeamPhoto", () => {
  it("accepts jpeg, png, and webp up to 5 MB", () => {
    expect(validateTeamPhoto({ contentType: "image/jpeg", size: 1 })).toEqual({ ok: true, contentType: "image/jpeg", ext: "jpg" });
    expect(validateTeamPhoto({ contentType: "image/png", size: TEAM_PHOTO_MAX_BYTES })).toMatchObject({ ok: true, ext: "png" });
    expect(validateTeamPhoto({ contentType: "image/webp", size: 1000 })).toMatchObject({ ok: true, ext: "webp" });
  });

  it("normalizes case and parameters", () => {
    expect(validateTeamPhoto({ contentType: "IMAGE/PNG; charset=binary", size: 10 })).toMatchObject({ ok: true, contentType: "image/png" });
  });

  it("rejects other types", () => {
    for (const contentType of ["image/gif", "image/svg+xml", "text/html", "", "application/octet-stream"]) {
      expect(validateTeamPhoto({ contentType, size: 10 }).ok).toBe(false);
    }
  });

  it("rejects empty and oversized files", () => {
    expect(validateTeamPhoto({ contentType: "image/png", size: 0 }).ok).toBe(false);
    expect(validateTeamPhoto({ contentType: "image/png", size: TEAM_PHOTO_MAX_BYTES + 1 }).ok).toBe(false);
  });
});

describe("sniffTeamPhotoType", () => {
  it("detects jpeg, png, webp by magic bytes", () => {
    expect(sniffTeamPhotoType(new Uint8Array([0xff, 0xd8, 0xff, 0xe0]))).toBe("image/jpeg");
    expect(sniffTeamPhotoType(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0]))).toBe("image/png");
    const webp = new Uint8Array([0x52, 0x49, 0x46, 0x46, 1, 2, 3, 4, 0x57, 0x45, 0x42, 0x50]);
    expect(sniffTeamPhotoType(webp)).toBe("image/webp");
  });

  it("returns null for anything else", () => {
    expect(sniffTeamPhotoType(new TextEncoder().encode("<html>"))).toBeNull();
    expect(sniffTeamPhotoType(new Uint8Array([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x41, 0x56, 0x45]))).toBeNull();
    expect(sniffTeamPhotoType(new Uint8Array([0xff, 0xd8]))).toBeNull();
  });
});

describe("teamPhotoKey / teamPhotoUrl", () => {
  it("builds the key and url", () => {
    const key = teamPhotoKey({ teamId: "otm_abc", ext: "webp", random: "r1" });
    expect(key).toBe("open/teams/otm_abc/r1.webp");
    expect(teamPhotoUrl(key)).toBe("/open/media/open/teams/otm_abc/r1.webp");
  });

  it("has no url without a key", () => {
    expect(teamPhotoUrl(null)).toBeNull();
    expect(teamPhotoUrl(undefined)).toBeNull();
    expect(teamPhotoUrl("")).toBeNull();
  });

  it("produces servable keys", () => {
    expect(isServableMediaKey(teamPhotoKey({ teamId: "otm_abc", ext: "jpg", random: "x9" }))).toBe(true);
  });
});

describe("isServableMediaKey", () => {
  it("only serves plain keys under open/", () => {
    expect(isServableMediaKey("open/teams/t/a.png")).toBe(true);
    expect(isServableMediaKey("other/a.png")).toBe(false);
    expect(isServableMediaKey("open/../secret")).toBe(false);
    expect(isServableMediaKey("open/teams/..hidden")).toBe(false);
    expect(isServableMediaKey("open//a.png")).toBe(false);
    expect(isServableMediaKey("open/")).toBe(false);
    expect(isServableMediaKey("open/teams/.env")).toBe(false);
    expect(isServableMediaKey("open/teams/a b.png")).toBe(false);
  });
});
