import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ insert: vi.fn() }));

vi.mock("@/lib/api", () => ({
  authenticateApiRequest: vi.fn().mockResolvedValue({ user: { id: "test-user" } }),
  corsHeaders: () => ({}),
  json: (data: unknown, init?: ResponseInit) => Response.json(data, init),
  options: () => new Response(null, { status: 204 }),
}));
vi.mock("@/lib/env", () => ({ serverEnv: () => ({ TRACKING_PIXEL_ORIGIN: "https://dead.example" }) }));
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({ from: () => ({ insert: mocks.insert }) }),
}));

import { POST } from "../app/api/v1/tracked-emails/route";

describe("tracked email registration", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("does not create a tracking record when the pixel host is unavailable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("unavailable", { status: 502 })));
    const request = new Request("https://app.example/api/v1/tracked-emails", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject: "Test", recipients: ["recipient@example.com"] }),
    });
    const response = await POST(request as never);
    expect(response.status).toBe(503);
    expect((await response.json()).error.code).toBe("pixel_unavailable");
    expect(mocks.insert).not.toHaveBeenCalled();
  });
});
