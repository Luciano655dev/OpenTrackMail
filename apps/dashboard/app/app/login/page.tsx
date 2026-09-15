import { redirect } from "next/navigation";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "./login-form";

export const metadata = { title: "Sign in" };
export default async function LoginPage() {
  const { data: { user } } = await (await createClient()).auth.getUser();
  if (user) redirect("/app/emails");
  return <main className="login-page"><ThemeToggle className="login-theme-toggle"/><div className="login-panel"><Logo /><h1>Sign in to OpenTrackMail</h1><p>Connect the Google account you use for email.</p><LoginForm /><small>OpenTrackMail requests only the account identity needed to sign you in. Inbox integration is handled locally by the extension.</small></div></main>;
}
