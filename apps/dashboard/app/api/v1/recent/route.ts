import { NextRequest } from "next/server";
import { authenticateApiRequest, corsHeaders, json, options } from "@/lib/api";
import { createAdminClient } from "@/lib/supabase/admin";
import { summarizeEmail } from "@/lib/serialize";

export const dynamic = "force-dynamic";
export function OPTIONS(request: NextRequest) { return options(request); }
export async function GET(request: NextRequest) {
  const auth = await authenticateApiRequest(request); if ("response" in auth) return auth.response;
  const { data, error } = await createAdminClient().from("tracked_emails").select("*").eq("user_id", auth.user.id).order("sent_at", { ascending: false }).limit(5);
  if (error) return json({ error: { code: "internal_error", message: "Could not load recent emails" } }, { status: 500, headers: corsHeaders(request) });
  return json({ emails: data.map(summarizeEmail) }, { headers: corsHeaders(request) });
}
