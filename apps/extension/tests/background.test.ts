import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createTrackedEmail: vi.fn(),
  deleteTrackedEmail: vi.fn(),
  protectPixelRequest: vi.fn(),
  getState: vi.fn(),
  setRecent: vi.fn(),
}));

vi.mock("../src/api", () => ({
  createTrackedEmail: mocks.createTrackedEmail,
  deleteTrackedEmail: mocks.deleteTrackedEmail,
  getSettings: vi.fn(),
  getTracked: vi.fn(),
  updateSettings: vi.fn(),
  updateTrackedEmail: vi.fn(),
}));
vi.mock("../src/auth", () => ({ signIn: vi.fn() }));
vi.mock("../src/request-protection", () => ({
  cleanupRuleId: vi.fn(),
  protectPixelRequest: mocks.protectPixelRequest,
  releasePixelProtection: vi.fn(),
}));
vi.mock("../src/storage", () => ({
  getState: mocks.getState,
  setDefaultTracking: vi.fn(),
  setPreferences: vi.fn(),
  setRecent: mocks.setRecent,
  setSession: vi.fn(),
}));

import { handleMessage } from "../src/background";

const email = {
  id: "email-1",
  subject: "Hello",
  recipients: ["a@example.com"],
  sentAt: "2026-09-14T16:00:00Z",
  providerMessageId: null,
  providerThreadId: null,
  openCount: 0,
  firstOpenedAt: null,
  lastOpenedAt: null,
  status: "sent" as const,
};
const message = { type: "CREATE_TRACKED_EMAIL" as const, payload: { subject: "Hello", recipients: ["a@example.com"], clientMessageId: "client-1" } };

describe("tracked send coordination", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createTrackedEmail.mockResolvedValue({ email, pixelUrl: "https://api.example/t/abc.gif" });
    mocks.protectPixelRequest.mockResolvedValue(123);
    mocks.deleteTrackedEmail.mockResolvedValue(undefined);
    mocks.getState.mockResolvedValue({ defaultTracking: true, openNotifications: false, recent: [] });
    mocks.setRecent.mockResolvedValue(undefined);
  });

  it("requires the initiating Gmail tab before creating a record", async () => {
    await expect(handleMessage(message, {})).rejects.toThrow("Gmail tab could not be identified");
    expect(mocks.createTrackedEmail).not.toHaveBeenCalled();
  });

  it("protects the pixel before making the tracked email available to Gmail", async () => {
    await handleMessage(message, { tab: { id: 42 } as chrome.tabs.Tab });
    expect(mocks.protectPixelRequest).toHaveBeenCalledWith("https://api.example/t/abc.gif", 42);
    expect(mocks.protectPixelRequest.mock.invocationCallOrder[0]).toBeLessThan(mocks.setRecent.mock.invocationCallOrder[0]!);
  });

  it("deletes the record when sender-side protection fails", async () => {
    mocks.protectPixelRequest.mockRejectedValueOnce(new Error("protection failed"));
    await expect(handleMessage(message, { tab: { id: 42 } as chrome.tabs.Tab })).rejects.toThrow("protection failed");
    expect(mocks.deleteTrackedEmail).toHaveBeenCalledWith("email-1");
    expect(mocks.setRecent).not.toHaveBeenCalled();
  });
});
