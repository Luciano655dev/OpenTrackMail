import { NextRequest } from "next/server";
import { createTrackedEmailSchema } from "@opentrackmail/shared";
import { authenticateApiRequest, corsHeaders, json, options } from "@/lib/api";
import { createAdminClient } from "@/lib/supabase/admin";
import { createTrackingId } from "@/lib/tracking";
import { summarizeEmail } from "@/lib/serialize";
import { serverEnv } from "@/lib/env";

export const dynamic = "force-dynamic";
export function OPTIONS(request: NextRequest) { return options(request); }

export async function POST(request: NextRequest) {
  const auth = await authenticateApiRequest(request); if ("response" in auth) return auth.response;
  const parsed = createTrackedEmailSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return json({ error: { code: "invalid_input", message: "Invalid tracked email", details: parsed.error.flatten() } }, { status: 400, headers: corsHeaders(request) });
  const admin = createAdminClient();
  const payload = parsed.data;
  const pixelOrigin = serverEnv().TRACKING_PIXEL_ORIGIN;
  try {
    const health = await fetch(`${pixelOrigin}/api/health`, { cache: "no-store", signal: AbortSignal.timeout(4000) });
    if (!health.ok || !(await health.json()).ok) throw new Error(`Pixel origin health check returned ${health.status}`);
  } catch (error) {
    console.error("OpenTrackMail pixel origin unavailable", { origin: pixelOrigin, error: String(error) });
    return json({ error: { code: "pixel_unavailable", message: "Tracking is unavailable right now. Your email was not sent; try again shortly." } }, { status: 503, headers: corsHeaders(request) });
  }
  if (payload.clientMessageId) {
    const { data: existing } = await admin.from("tracked_emails").select("*").eq("user_id", auth.user.id).eq("client_message_id", payload.clientMessageId).maybeSingle();
    if (existing) return json({ email: summarizeEmail(existing), pixelUrl: `${pixelOrigin}/t/${existing.tracking_id}.gif` }, { headers: corsHeaders(request) });
  }
  const trackingId = createTrackingId();
  const { data, error } = await admin.from("tracked_emails").insert({
    user_id: auth.user.id,
    tracking_id: trackingId,
    provider: payload.provider,
    provider_message_id: payload.providerMessageId ?? null,
    provider_thread_id: payload.providerThreadId ?? null,
    client_message_id: payload.clientMessageId ?? null,
    subject: payload.subject || "(no subject)",
    recipients: payload.recipients,
    recipients_text: payload.recipients.join(", "),
    sent_at: payload.sentAt || new Date().toISOString(),
  }).select("*").single();
  if (error) return json({ error: { code: "internal_error", message: "Could not create tracking record" } }, { status: 500, headers: corsHeaders(request) });
  return json({ email: summarizeEmail(data), pixelUrl: `${pixelOrigin}/t/${trackingId}.gif` }, { status: 201, headers: corsHeaders(request) });
}

export async function GET(request: NextRequest) {
  const auth = await authenticateApiRequest(request); if ("response" in auth) return auth.response;
  const params = request.nextUrl.searchParams;
  const limit = Math.min(Math.max(Number(params.get("limit")) || 50, 1), 100);
  const offset = Math.max(Number(params.get("offset")) || 0, 0);
  const search = (params.get("search") || "").trim().slice(0, 200);
  const status = params.get("status");
  let query = createAdminClient().from("tracked_emails").select("*").eq("user_id", auth.user.id).order("sent_at", { ascending: false }).range(offset, offset + limit - 1);
  if (search) query = query.or(`subject.ilike.%${search.replace(/[%_,()]/g, "") }%,recipients_text.ilike.%${search.replace(/[%_,()]/g, "")}%`);
  if (status === "opened") query = query.gt("open_count", 0);
  if (status === "sent") query = query.eq("open_count", 0);
  const { data, error } = await query;
  if (error) return json({ error: { code: "internal_error", message: "Could not load tracked emails" } }, { status: 500, headers: corsHeaders(request) });
  return json({ emails: data.map(summarizeEmail), nextOffset: data.length === limit ? offset + limit : null }, { headers: corsHeaders(request) });
}
