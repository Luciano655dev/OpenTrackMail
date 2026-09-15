import { createHash, createHmac, randomBytes } from "node:crypto";

export const TRANSPARENT_GIF = Buffer.from("R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==", "base64");

export function createTrackingId() { return randomBytes(24).toString("base64url"); }

export function isValidTrackingId(value: string) { return /^[A-Za-z0-9_-]{32}$/.test(value); }

export function normalizeUserAgent(value: string | null) { return (value || "unknown").replace(/[\u0000-\u001f\u007f]/g, "").slice(0, 512); }

export function sourceHash(ip: string | null, userAgent: string, secret: string) {
  const ipPrefix = (ip || "unknown").split(",")[0]?.trim().slice(0, 64) || "unknown";
  const uaFamily = userAgent.toLowerCase().replace(/[0-9.]+/g, "#").slice(0, 160);
  return createHmac("sha256", secret).update(`${ipPrefix}|${uaFamily}`).digest("hex");
}

export function etagForTrackingId(trackingId: string) { return `\"${createHash("sha256").update(trackingId).digest("base64url").slice(0, 16)}\"`; }
