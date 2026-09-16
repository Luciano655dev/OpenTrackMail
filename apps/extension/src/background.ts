import { createTrackedEmail, deleteTrackedEmail, getSettings, getTracked, updateSettings, updateTrackedEmail } from "./api";
import { signIn } from "./auth";
import { cleanupRuleId, protectPixelRequest, releasePixelProtection } from "./request-protection";
import { getState, setDefaultTracking, setPreferences, setRecent, setSession } from "./storage";
import type { BackgroundMessage, StoredEmail } from "./types";

const appUrl = import.meta.env.VITE_APP_URL || "http://localhost:3001/app";

chrome.runtime.onInstalled.addListener(async () => {
  const state = await getState();
  await chrome.storage.local.set({ defaultTracking: state.defaultTracking, openNotifications: state.openNotifications, recent: state.recent });
});

chrome.runtime.onMessage.addListener((message: BackgroundMessage, sender, sendResponse) => {
  handleMessage(message, sender)
    .then((value) => sendResponse({ ok: true, value }))
    .catch((error: unknown) => sendResponse({ ok: false, error: error instanceof Error ? error.message : "Unexpected extension error" }));
  return true;
});

chrome.alarms.onAlarm.addListener((alarm) => {
  const ruleId = cleanupRuleId(alarm.name);
  if (ruleId) void releasePixelProtection(ruleId).catch(() => undefined);
});

export async function handleMessage(message: BackgroundMessage, sender: chrome.runtime.MessageSender = {}) {
  if (message.type === "AUTH_SIGN_IN") {
    const session = await signIn();
    await syncStatus(true);
    return session;
  }
  if (message.type === "AUTH_SIGN_OUT") {
    await setSession(undefined);
    await setRecent([]);
    return null;
  }
  if (message.type === "GET_STATE") return getState();
  if (message.type === "SET_DEFAULT_TRACKING") {
    const session = (await getState()).session;
    if (session) {
      const result = await updateSettings({ defaultTracking: message.value });
      await setPreferences(result.settings.defaultTracking, result.settings.openNotifications);
    } else await setDefaultTracking(message.value);
    return getState();
  }
  if (message.type === "CREATE_TRACKED_EMAIL") {
    const tabId = sender.tab?.id;
    if (tabId === undefined) throw new Error("The Gmail tab could not be identified");
    const result = await createTrackedEmail(message.payload);
    try {
      const expectedPixelOrigin = new URL(import.meta.env.VITE_PIXEL_ORIGIN).origin;
      if (new URL(result.pixelUrl).origin !== expectedPixelOrigin) throw new Error("The tracking pixel points to the wrong server. Reload the extension and try again.");
      await protectPixelRequest(result.pixelUrl, tabId);
    } catch (error) {
      await deleteTrackedEmail(result.email.id).catch(() => undefined);
      throw error;
    }
    const state = await getState();
    await setRecent([result.email, ...state.recent.filter((item) => item.id !== result.email.id)].slice(0, 100));
    return result;
  }
  if (message.type === "UPDATE_TRACKED_EMAIL") {
    const result = await updateTrackedEmail(message.id, message.payload);
    const state = await getState();
    await setRecent([result.email, ...state.recent.filter((item) => item.id !== result.email.id)].sort((a, b) => b.sentAt.localeCompare(a.sentAt)).slice(0, 100));
    return result;
  }
  if (message.type === "SYNC_STATUS") return syncStatus(Boolean(message.force));
}

let lastSync = 0;
async function syncStatus(force = false) {
  if (!force && Date.now() - lastSync < 45_000) return (await getState()).recent;
  lastSync = Date.now();
  const before = (await getState()).recent;
  const [{ emails }, { settings }] = await Promise.all([getTracked(), getSettings()]);
  await Promise.all([setRecent(emails as StoredEmail[]), setPreferences(settings.defaultTracking, settings.openNotifications)]);
  if (settings.openNotifications) {
    for (const email of emails) {
      const prior = before.find((item) => item.id === email.id);
      if (prior && prior.openCount < email.openCount) {
        await chrome.notifications?.create?.({ type: "basic", iconUrl: "icons/icon-128.png", title: "Open detected", message: `${email.subject} was opened` }).catch(() => undefined);
      }
    }
  }
  return emails;
}

chrome.action.onClicked?.addListener?.(() => chrome.tabs.create({ url: `${appUrl}/emails` }));
