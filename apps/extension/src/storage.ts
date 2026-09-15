import type { ExtensionSession } from "@opentrackmail/shared";
import type { ExtensionState, StoredEmail } from "./types";

const defaults: ExtensionState = { defaultTracking: true, openNotifications: false, recent: [] };

export async function getState(): Promise<ExtensionState> {
  const value = await chrome.storage.local.get(["session", "defaultTracking", "openNotifications", "recent"]);
  return { ...defaults, ...value } as ExtensionState;
}
export async function setSession(session?: ExtensionSession) { if (session) await chrome.storage.local.set({ session }); else await chrome.storage.local.remove("session"); }
export async function setDefaultTracking(value: boolean) { await chrome.storage.local.set({ defaultTracking: value }); }
export async function setPreferences(defaultTracking: boolean, openNotifications: boolean) { await chrome.storage.local.set({ defaultTracking, openNotifications }); }
export async function setRecent(recent: StoredEmail[]) { await chrome.storage.local.set({ recent: recent.slice(0, 100) }); }
