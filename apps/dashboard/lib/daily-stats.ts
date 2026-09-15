export type DailyPublicStat = {
  date: string;
  accounts: number;
  trackedEmails: number;
};

type DailyStatsRow = {
  day: string;
  account_count: number | string | null;
  tracked_email_count: number | string | null;
};

export function normalizeDailyStats(rows: DailyStatsRow[]): DailyPublicStat[] {
  return rows.map((row) => ({
    date: row.day,
    accounts: Number(row.account_count ?? 0),
    trackedEmails: Number(row.tracked_email_count ?? 0),
  }));
}

