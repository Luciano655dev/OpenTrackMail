import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  deferred: [] as Array<() => Promise<void>>,
  after: vi.fn((callback: () => Promise<void>) => { mocks.deferred.push(callback); }),
  rpc: vi.fn().mockResolvedValue({ error: null }),
}));

vi.mock("next/server", () => ({ after: mocks.after }));
vi.mock("@/lib/env", () => ({ serverEnv: () => ({ EVENT_HASH_SECRET: "a secure event hash secret for the test suite" }) }));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => ({ rpc: mocks.rpc }) }));

import { GET } from "../app/t/[trackingId]/route";

describe("tracking pixel route", () => {
  beforeEach(() => { mocks.after.mockClear(); mocks.rpc.mockClear(); mocks.deferred.length = 0; });

  it("returns the GIF before scheduling a valid event write", async () => {
    const trackingId = "a".repeat(32);
    const response = await GET(new Request(`https://api.example/t/${trackingId}.gif`, { headers: { "user-agent": "Test Mail Client", "x-forwarded-for": "203.0.113.9" } }) as never, { params: Promise.resolve({ trackingId }) });
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/gif");
    expect((await response.arrayBuffer()).byteLength).toBe(34);
    expect(mocks.rpc).not.toHaveBeenCalled();
    expect(mocks.deferred).toHaveLength(1);
    await mocks.deferred[0]?.();
    expect(mocks.rpc).toHaveBeenCalledWith("record_open_event", expect.objectContaining({ p_tracking_id: trackingId }));
  });

  it("returns the same GIF without a write for malformed identifiers", async () => {
    const response = await GET(new Request("https://api.example/t/42.gif") as never, { params: Promise.resolve({ trackingId: "42" }) });
    expect(response.status).toBe(200);
    expect((await response.arrayBuffer()).byteLength).toBe(34);
    expect(mocks.after).not.toHaveBeenCalled();
  });
});
