import type { ExtensionSession, TrackedEmailSummary } from "@opentrackmail/shared";

export type StoredEmail = Pick<TrackedEmailSummary, "id"|"subject"|"recipients"|"sentAt"|"providerMessageId"|"providerThreadId"|"openCount"|"firstOpenedAt"|"lastOpenedAt"|"status">;
export type ExtensionState = { session?: ExtensionSession; defaultTracking: boolean; openNotifications: boolean; recent: StoredEmail[] };
export type BackgroundMessage =
  | { type: "AUTH_SIGN_IN" }
  | { type: "AUTH_SIGN_OUT" }
  | { type: "GET_STATE" }
  | { type: "SET_DEFAULT_TRACKING"; value: boolean }
  | { type: "CREATE_TRACKED_EMAIL"; payload: { subject: string; recipients: string[]; clientMessageId: string } }
  | { type: "UPDATE_TRACKED_EMAIL"; id: string; payload: { providerMessageId?: string; providerThreadId?: string } }
  | { type: "SYNC_STATUS"; force?: boolean };
