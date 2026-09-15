import { createClient as createSupabaseClient, type User } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { publicEnv } from "@/lib/env";

export const noStoreHeaders = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };

export function json(data: unknown, init: ResponseInit = {}) {
  return NextResponse.json(data, { ...init, headers: { ...noStoreHeaders, ...init.headers } });
}

export async function authenticateApiRequest(request: NextRequest): Promise<{ user: User } | { response: NextResponse }> {
  const token = request.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return { response: json({ error: { code: "unauthorized", message: "Authentication required" } }, { status: 401, headers: corsHeaders(request) }) };
  const env = publicEnv();
  const client = createSupabaseClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { auth: { persistSession: false } });
  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user) return { response: json({ error: { code: "unauthorized", message: "Session is invalid or expired" } }, { status: 401, headers: corsHeaders(request) }) };
  try {
    const { consumeRateLimit } = await import("@/lib/rate-limit");
    const allowed = await consumeRateLimit(data.user.id, "authenticated-api", 300, 60);
    if (!allowed) return { response: json({ error: { code: "rate_limited", message: "Too many requests" } }, { status: 429, headers: { ...corsHeaders(request), "Retry-After": "60" } }) };
  } catch (rateLimitError) {
    console.error("OpenTrackMail rate limit check failed", rateLimitError);
    return { response: json({ error: { code: "internal_error", message: "Request protection is temporarily unavailable" } }, { status: 503, headers: corsHeaders(request) }) };
  }
  return { user: data.user };
}

export function corsHeaders(request: NextRequest) {
  const origin = request.headers.get("origin");
  const configured = (process.env.ALLOWED_EXTENSION_ORIGINS || "").split(",").map((v) => v.trim()).filter(Boolean);
  const allowUnconfiguredDevelopmentOrigin = process.env.NODE_ENV !== "production" && configured.length === 0;
  if (!origin || !origin.startsWith("chrome-extension://") || (!allowUnconfiguredDevelopmentOrigin && !configured.includes(origin))) return {};
  return { "Access-Control-Allow-Origin": origin, "Access-Control-Allow-Headers": "authorization, content-type", "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS", Vary: "Origin" };
}

export function options(request: NextRequest) { return new NextResponse(null, { status: 204, headers: corsHeaders(request) }); }
