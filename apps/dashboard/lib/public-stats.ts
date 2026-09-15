import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export type PublicStats = {
  accountCount: number;
  trackedEmailCount: number;
};

export async function getPublicStats(): Promise<PublicStats | null> {
  try {
    const supabase = createAdminClient();
    const [accounts, trackedEmails] = await Promise.all([
      supabase.from("profiles").select("user_id", { count: "exact", head: true }),
      supabase.from("tracked_emails").select("id", { count: "exact", head: true }),
    ]);

    if (accounts.error || trackedEmails.error) return null;

    return {
      accountCount: accounts.count ?? 0,
      trackedEmailCount: trackedEmails.count ?? 0,
    };
  } catch {
    return null;
  }
}

export function shouldShowSocialProof(stats: PublicStats | null) {
  return stats !== null && stats.accountCount > 10;
}

export function formatStat(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}
