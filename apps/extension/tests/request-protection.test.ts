import { beforeEach, describe, expect, it, vi } from "vitest";
import { cleanupRuleId, protectPixelRequest, releasePixelProtection } from "../src/request-protection";

describe("sender-side pixel protection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const getSessionRules = chrome.declarativeNetRequest.getSessionRules as () => Promise<chrome.declarativeNetRequest.Rule[]>;
    vi.mocked(getSessionRules).mockResolvedValue([]);
    vi.mocked(chrome.declarativeNetRequest.updateSessionRules).mockResolvedValue();
    vi.mocked(chrome.alarms.create).mockResolvedValue();
  });

  it("blocks only the exact image URL in the initiating Gmail tab", async () => {
    const ruleId = await protectPixelRequest("https://api.example/t/abc.gif", 42);

    expect(ruleId).toBeGreaterThan(0);
    expect(chrome.declarativeNetRequest.updateSessionRules).toHaveBeenCalledWith({
      addRules: [{
        id: ruleId,
        priority: 1,
        action: { type: "block" },
        condition: {
          urlFilter: "|https://api.example/t/abc.gif|",
          initiatorDomains: ["mail.google.com"],
          resourceTypes: ["image"],
          tabIds: [42],
        },
      }],
    });
    expect(chrome.alarms.create).toHaveBeenCalledWith(`otm-pixel-protection:${ruleId}`, { when: expect.any(Number) });
  });

  it("rejects an insecure remote tracking origin", async () => {
    await expect(protectPixelRequest("http://api.example/t/abc.gif", 42)).rejects.toThrow("must use HTTPS");
    expect(chrome.declarativeNetRequest.updateSessionRules).not.toHaveBeenCalled();
  });

  it("removes an installed rule if cleanup scheduling fails", async () => {
    vi.mocked(chrome.alarms.create).mockRejectedValueOnce(new Error("alarm unavailable"));
    await expect(protectPixelRequest("https://api.example/t/abc.gif", 42)).rejects.toThrow("sender-side false open");
    const installedRule = vi.mocked(chrome.declarativeNetRequest.updateSessionRules).mock.calls[0]?.[0].addRules?.[0];
    expect(chrome.declarativeNetRequest.updateSessionRules).toHaveBeenLastCalledWith({ removeRuleIds: [installedRule?.id] });
  });

  it("parses only OpenTrackMail cleanup alarms", async () => {
    expect(cleanupRuleId("otm-pixel-protection:123")).toBe(123);
    expect(cleanupRuleId("other:123")).toBeUndefined();
    await releasePixelProtection(123);
    expect(chrome.declarativeNetRequest.updateSessionRules).toHaveBeenCalledWith({ removeRuleIds: [123] });
  });
});
