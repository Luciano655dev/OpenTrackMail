import { NextRequest } from "next/server";
import { authenticateApiRequest, corsHeaders, json, options } from "@/lib/api";
import { createAdminClient } from "@/lib/supabase/admin";

export function OPTIONS(request: NextRequest) { return options(request); }
export async function DELETE(request: NextRequest) {
  const auth = await authenticateApiRequest(request); if ("response" in auth) return auth.response;
  const { error } = await createAdminClient().from("tracked_emails").delete().eq("user_id", auth.user.id);
  if (error) return json({ error: { code: "internal_error", message: "Could not delete history" } }, { status: 500, headers: corsHeaders(request) });
  return new Response(null, { status: 204, headers: corsHeaders(request) });
}
