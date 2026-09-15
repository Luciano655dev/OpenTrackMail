import { describe, expect, it } from "vitest";
import { normalizeDailyStats } from "../lib/daily-stats";

describe("public daily stats", () => {
  it("normalizes aggregate database values into serializable chart points", () => {
    expect(normalizeDailyStats([
      { day: "2026-09-14", account_count: "2", tracked_email_count: 8 },
      { day: "2026-09-15", account_count: null, tracked_email_count: "3" },
    ])).toEqual([
      { date: "2026-09-14", accounts: 2, trackedEmails: 8 },
      { date: "2026-09-15", accounts: 0, trackedEmails: 3 },
    ]);
  });
});

