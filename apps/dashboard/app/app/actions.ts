"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function signOut() { const supabase = await createClient(); await supabase.auth.signOut(); redirect("/app/login"); }

export async function updateSetting(formData: FormData) {
  const key = formData.get("key"); const value = formData.get("value") === "true";
  if (key !== "default_tracking" && key !== "open_notifications") return;
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) redirect("/app/login");
  const { error } = await supabase.from("settings").update({ [key]: value }).eq("user_id", user.id);
  if (error) throw new Error("Could not update settings");
  revalidatePath("/app/settings");
}

export async function deleteHistory() {
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) redirect("/app/login");
  const { error } = await supabase.from("tracked_emails").delete().eq("user_id", user.id);
  if (error) throw new Error("Could not delete tracking history");
  revalidatePath("/app/emails"); revalidatePath("/app/settings");
}

export async function deleteTrackedEmail(id: string) {
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) redirect("/app/login");
  const { count, error } = await supabase.from("tracked_emails").delete({ count: "exact" }).eq("id", id).eq("user_id", user.id);
  if (error || !count) throw new Error("Could not delete tracked email");
  revalidatePath("/app/emails");
}

export async function deleteAccount() {
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) redirect("/app/login");
  const { error } = await createAdminClient().auth.admin.deleteUser(user.id);
  if (error) throw new Error("Could not delete account");
  await supabase.auth.signOut(); redirect("/app/login?deleted=1");
}
