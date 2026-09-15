import { NextRequest } from "next/server";
import { updateTrackedEmailSchema } from "@opentrackmail/shared";
import { authenticateApiRequest, corsHeaders, json, options } from "@/lib/api";
import { createAdminClient } from "@/lib/supabase/admin";
import { summarizeEmail } from "@/lib/serialize";

export const dynamic = "force-dynamic";
export function OPTIONS(request: NextRequest) { return options(request); }

type Context = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: Context) {
  const auth = await authenticateApiRequest(request); if ("response" in auth) return auth.response;
  const { id } = await context.params;
  const admin = createAdminClient();
  const [{ data, error }, { data: events }] = await Promise.all([
    admin.from("tracked_emails").select("*").eq("id", id).eq("user_id", auth.user.id).maybeSingle(),
    admin.from("open_events").select("id,detected_at,is_duplicate,classification,user_agent_class").eq("tracked_email_id", id).order("detected_at", { ascending: true }).limit(500),
  ]);
  if (error || !data) return json({ error: { code: "not_found", message: "Tracked email not found" } }, { status: 404, headers: corsHeaders(request) });
  return json({ email: summarizeEmail(data), activity: [{ type: "sent", at: data.sent_at }, ...(events || []).filter((e) => e.classification === "counted").map((e) => ({ type: "opened", at: e.detected_at, id: e.id }))] }, { headers: corsHeaders(request) });
}

export async function PATCH(request: NextRequest, context: Context) {
  const auth = await authenticateApiRequest(request); if ("response" in auth) return auth.response;
  const parsed = updateTrackedEmailSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return json({ error: { code: "invalid_input", message: "Invalid update" } }, { status: 400, headers: corsHeaders(request) });
  const { id } = await context.params;
  const update: Record<string, string | null> = {};
  if ("providerMessageId" in parsed.data) update.provider_message_id = parsed.data.providerMessageId ?? null;
  if ("providerThreadId" in parsed.data) update.provider_thread_id = parsed.data.providerThreadId ?? null;
  if (parsed.data.sentAt) update.sent_at = parsed.data.sentAt;
  const { data, error } = await createAdminClient().from("tracked_emails").update(update).eq("id", id).eq("user_id", auth.user.id).select("*").maybeSingle();
  if (error || !data) return json({ error: { code: "not_found", message: "Tracked email not found" } }, { status: 404, headers: corsHeaders(request) });
  return json({ email: summarizeEmail(data) }, { headers: corsHeaders(request) });
}

export async function DELETE(request: NextRequest, context: Context) {
  const auth = await authenticateApiRequest(request); if ("response" in auth) return auth.response;
  const { id } = await context.params;
  const { count, error } = await createAdminClient().from("tracked_emails").delete({ count: "exact" }).eq("id", id).eq("user_id", auth.user.id);
  if (error) return json({ error: { code: "internal_error", message: "Could not delete tracking record" } }, { status: 500, headers: corsHeaders(request) });
  if (!count) return json({ error: { code: "not_found", message: "Tracked email not found" } }, { status: 404, headers: corsHeaders(request) });
  return new Response(null, { status: 204, headers: corsHeaders(request) });
}
