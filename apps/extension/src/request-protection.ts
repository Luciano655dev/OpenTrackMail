const CLEANUP_ALARM_PREFIX = "otm-pixel-protection:";
const PROTECTION_DURATION_MS = 60_000;

export async function protectPixelRequest(pixelUrl: string, tabId: number): Promise<number> {
  if (!Number.isInteger(tabId) || tabId < 0) throw new Error("The Gmail tab could not be identified");

  const url = new URL(pixelUrl);
  const isLocalHttp = url.protocol === "http:" && ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  if (url.protocol !== "https:" && !isLocalHttp) throw new Error("The tracking endpoint must use HTTPS");

  const existingRules = await chrome.declarativeNetRequest.getSessionRules();
  const ruleId = createRuleId(new Set(existingRules.map((rule) => rule.id)));
  let installed = false;

  try {
    await chrome.declarativeNetRequest.updateSessionRules({
      addRules: [{
        id: ruleId,
        priority: 1,
        action: { type: chrome.declarativeNetRequest.RuleActionType.BLOCK },
        condition: {
          urlFilter: `|${url.href}|`,
          initiatorDomains: ["mail.google.com"],
          resourceTypes: [chrome.declarativeNetRequest.ResourceType.IMAGE],
          tabIds: [tabId],
        },
      }],
    });
    installed = true;
    await chrome.alarms.create(cleanupAlarmName(ruleId), { when: Date.now() + PROTECTION_DURATION_MS });
    return ruleId;
  } catch (error) {
    if (installed) await releasePixelProtection(ruleId).catch(() => undefined);
    throw new Error("Could not protect this message from a sender-side false open", { cause: error });
  }
}

export async function releasePixelProtection(ruleId: number): Promise<void> {
  await chrome.declarativeNetRequest.updateSessionRules({ removeRuleIds: [ruleId] });
}

export function cleanupRuleId(alarmName: string): number | undefined {
  if (!alarmName.startsWith(CLEANUP_ALARM_PREFIX)) return undefined;
  const ruleId = Number(alarmName.slice(CLEANUP_ALARM_PREFIX.length));
  return Number.isInteger(ruleId) && ruleId > 0 ? ruleId : undefined;
}

function cleanupAlarmName(ruleId: number) {
  return `${CLEANUP_ALARM_PREFIX}${ruleId}`;
}

function createRuleId(existing: Set<number>) {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const candidate = (crypto.getRandomValues(new Uint32Array(1))[0]! & 0x7fffffff) || 1;
    if (!existing.has(candidate)) return candidate;
  }
  throw new Error("Could not allocate a temporary request protection rule");
}
