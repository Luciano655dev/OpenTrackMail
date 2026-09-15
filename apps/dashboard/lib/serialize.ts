type EmailRow = {
  id: string; tracking_id: string; provider: "gmail" | "outlook" | "generic"; provider_message_id: string | null; provider_thread_id: string | null;
  subject: string; recipients: string[]; sent_at: string; open_count?: number; first_opened_at?: string | null; last_opened_at?: string | null;
  open_events?: { id: string; detected_at: string; is_duplicate: boolean; classification?: "counted" | "rapid_duplicate" | "early_automatic" }[];
};

export function summarizeEmail(row: EmailRow) {
  const events = (row.open_events || []).filter((event) => event.classification ? event.classification === "counted" : !event.is_duplicate).sort((a, b) => a.detected_at.localeCompare(b.detected_at));
  const openCount = row.open_count ?? events.length;
  const firstOpenedAt = row.first_opened_at ?? events[0]?.detected_at ?? null;
  const lastOpenedAt = row.last_opened_at ?? events.at(-1)?.detected_at ?? null;
  return {
    id: row.id,
    trackingId: row.tracking_id,
    provider: row.provider,
    providerMessageId: row.provider_message_id,
    providerThreadId: row.provider_thread_id,
    subject: row.subject,
    recipients: row.recipients,
    sentAt: row.sent_at,
    status: openCount > 0 ? "opened" as const : "sent" as const,
    openCount,
    firstOpenedAt,
    lastOpenedAt,
  };
}
