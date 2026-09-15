import { NextRequest } from "next/server";
import { updateSettingsSchema } from "@opentrackmail/shared";
import { authenticateApiRequest, corsHeaders, json, options } from "@/lib/api";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export function OPTIONS(request: NextRequest) { return options(request); }
export async function GET(request: NextRequest) {
  const auth = await authenticateApiRequest(request); if ("response" in auth) return auth.response;
  const { data, error } = await createAdminClient().from("settings").select("default_tracking,open_notifications").eq("user_id", auth.user.id).single();
  if (error) return json({ error: { code: "internal_error", message: "Could not load settings" } }, { status: 500, headers: corsHeaders(request) });
  return json({ settings: { defaultTracking: data.default_tracking, openNotifications: data.open_notifications } }, { headers: corsHeaders(request) });
}
export async function PATCH(request: NextRequest) {
  const auth = await authenticateApiRequest(request); if ("response" in auth) return auth.response;
  const parsed = updateSettingsSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return json({ error: { code: "invalid_input", message: "Invalid settings" } }, { status: 400, headers: corsHeaders(request) });
  const update: Record<string, boolean> = {};
  if (parsed.data.defaultTracking !== undefined) update.default_tracking = parsed.data.defaultTracking;
  if (parsed.data.openNotifications !== undefined) update.open_notifications = parsed.data.openNotifications;
  const { data, error } = await createAdminClient().from("settings").update(update).eq("user_id", auth.user.id).select("default_tracking,open_notifications").single();
  if (error) return json({ error: { code: "internal_error", message: "Could not update settings" } }, { status: 500, headers: corsHeaders(request) });
  return json({ settings: { defaultTracking: data.default_tracking, openNotifications: data.open_notifications } }, { headers: corsHeaders(request) });
}
