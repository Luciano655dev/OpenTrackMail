import { NextRequest } from "next/server";
import { z } from "zod";
import { corsHeaders, json, options } from "@/lib/api";
import { publicEnv } from "@/lib/env";
import { serverEnv } from "@/lib/env";
import { consumeRateLimit } from "@/lib/rate-limit";
import { sourceHash } from "@/lib/tracking";

const schema = z.discriminatedUnion("grantType", [
  z.object({ grantType: z.literal("pkce"), authCode: z.string().min(8).max(2048), codeVerifier: z.string().min(43).max(128) }),
  z.object({ grantType: z.literal("refresh_token"), refreshToken: z.string().min(8).max(4096) }),
]);

export function OPTIONS(request: NextRequest) { return options(request); }
export async function POST(request: NextRequest) {
  const headers = corsHeaders(request);
  const origin = request.headers.get("origin");
  if (origin?.startsWith("chrome-extension://") && !("Access-Control-Allow-Origin" in headers)) return json({ error: { code: "forbidden", message: "Extension origin is not allowed" } }, { status: 403 });
  const ua = request.headers.get("user-agent") || "extension-token";
  const key = sourceHash(request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"), `${origin || "no-origin"}|${ua}`, serverEnv().EVENT_HASH_SECRET);
  try {
    if (!(await consumeRateLimit(key, "extension-token", 30, 60))) return json({ error: { code: "rate_limited", message: "Too many token requests" } }, { status: 429, headers: { ...headers, "Retry-After": "60" } });
  } catch (error) {
    console.error("OpenTrackMail token rate limit failed", error);
    return json({ error: { code: "internal_error", message: "Request protection is temporarily unavailable" } }, { status: 503, headers });
  }
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return json({ error: { code: "invalid_input", message: "Invalid token request" } }, { status: 400, headers });
  const env = publicEnv();
  const body = parsed.data.grantType === "pkce"
    ? { auth_code: parsed.data.authCode, code_verifier: parsed.data.codeVerifier }
    : { refresh_token: parsed.data.refreshToken };
  const response = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/token?grant_type=${parsed.data.grantType}`, {
    method: "POST", headers: { apikey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY, "Content-Type": "application/json" }, body: JSON.stringify(body), cache: "no-store",
  });
  const data = await response.json();
  if (!response.ok) return json({ error: { code: "unauthorized", message: "Could not complete extension sign-in" } }, { status: 401, headers });
  return json({ accessToken: data.access_token, refreshToken: data.refresh_token, expiresAt: Math.floor(Date.now() / 1000) + data.expires_in, user: { id: data.user.id, email: data.user.email } }, { headers });
}
