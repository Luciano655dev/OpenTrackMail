import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "../actions";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: { user } } = await (await createClient()).auth.getUser();
  if (!user) redirect("/app/login");
  const initials = user.email?.slice(0, 2).toUpperCase() || "OT";
  return <div className="app-shell"><header className="app-header"><div className="app-header-inner"><Logo href="/app/emails"/><nav aria-label="Dashboard"><Link href="/app/emails">Emails</Link><Link href="/app/settings">Settings</Link></nav><ThemeToggle className="app-theme-toggle"/><details className="account-menu"><summary aria-label="Account menu">{initials}</summary><div><span>{user.email}</span><form action={signOut}><button type="submit">Sign out</button></form></div></details></div></header><main className="app-main">{children}</main></div>;
}
