import { describe, expect, it } from "vitest";
import { createTrackingId, isValidTrackingId, normalizeUserAgent, sourceHash, TRANSPARENT_GIF } from "../lib/tracking";

describe("tracking primitives", () => {
  it("creates opaque 192-bit URL-safe identifiers", () => {
    const ids = new Set(Array.from({ length: 100 }, createTrackingId));
    expect(ids.size).toBe(100);
    for (const id of ids) expect(isValidTrackingId(id)).toBe(true);
  });
  it("rejects enumerable or malformed identifiers", () => {
    expect(isValidTrackingId("42")).toBe(false);
    expect(isValidTrackingId("a".repeat(31))).toBe(false);
    expect(isValidTrackingId("a".repeat(32))).toBe(true);
  });
  it("returns the standard transparent one-pixel GIF payload", () => {
    expect(TRANSPARENT_GIF.subarray(0, 6).toString()).toBe("GIF89a");
    expect(TRANSPARENT_GIF.length).toBe(34);
  });
  it("minimizes and hashes request metadata without storing an IP", () => {
    const secret = "a secure test secret that is at least 32 bytes";
    const a = sourceHash("203.0.113.5", "Mozilla/5.0 Chrome/140.0", secret);
    const b = sourceHash("203.0.113.5", "Mozilla/5.0 Chrome/141.0", secret);
    const c = sourceHash("203.0.113.6", "Mozilla/5.0 Chrome/141.0", secret);
    expect(a).toBe(b);
    expect(c).not.toBe(a);
    expect(a).toMatch(/^[a-f0-9]{64}$/);
  });
  it("removes control characters and caps user-agent length", () => {
    expect(normalizeUserAgent(`Agent\u0000${"x".repeat(700)}`)).toHaveLength(512);
    expect(normalizeUserAgent(null)).toBe("unknown");
  });
});
