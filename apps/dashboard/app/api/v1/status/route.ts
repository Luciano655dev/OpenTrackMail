import { NextRequest } from "next/server";
import { authenticateApiRequest, corsHeaders, json, options } from "@/lib/api";
import { createAdminClient } from "@/lib/supabase/admin";
import { summarizeEmail } from "@/lib/serialize";

export const dynamic = "force-dynamic";
export function OPTIONS(request: NextRequest) { return options(request); }
export async function GET(request: NextRequest) {
  const auth = await authenticateApiRequest(request); if ("response" in auth) return auth.response;
  const ids = request.nextUrl.searchParams.getAll("providerMessageId").flatMap((value) => value.split(",")).map((v) => v.trim()).filter(validProviderId).slice(0, 100);
  const threadIds = request.nextUrl.searchParams.getAll("providerThreadId").flatMap((value) => value.split(",")).map((v) => v.trim()).filter(validProviderId).slice(0, 100);
  if (!ids.length && !threadIds.length) return json({ emails: [] }, { headers: corsHeaders(request) });
  let query = createAdminClient().from("tracked_emails").select("*").eq("user_id", auth.user.id);
  const clauses = [];
  if (ids.length) clauses.push(`provider_message_id.in.(${ids.map(escapePostgrest).join(",")})`);
  if (threadIds.length) clauses.push(`provider_thread_id.in.(${threadIds.map(escapePostgrest).join(",")})`);
  query = query.or(clauses.join(","));
  const { data, error } = await query.limit(100);
  if (error) return json({ error: { code: "internal_error", message: "Could not load status" } }, { status: 500, headers: corsHeaders(request) });
  return json({ emails: data.map(summarizeEmail) }, { headers: corsHeaders(request) });
}
function escapePostgrest(value: string) { return `\"${value.replace(/[\"\\]/g, "")}\"`; }
function validProviderId(value: string) { return /^[A-Za-z0-9_.:-]{1,500}$/.test(value); }
