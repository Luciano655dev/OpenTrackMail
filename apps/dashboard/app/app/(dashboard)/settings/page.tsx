import { createClient } from "@/lib/supabase/server";
import { SettingRow } from "@/components/setting-row";
import { DangerAction } from "@/components/danger-action";
import { deleteAccount, deleteHistory } from "../../actions";

export const metadata = { title: "Settings" };
export default async function SettingsPage() {
  const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser();
  const { data: settings } = await supabase.from("settings").select("default_tracking,open_notifications").single();
  return <div className="settings-page"><div className="page-title"><div><h1>Settings</h1><p>Account and tracking preferences.</p></div></div>
    <section className="settings-section"><h2>Account</h2><div className="setting-row static"><div><h3>Email</h3><p>{user?.email}</p></div></div></section>
    <section className="settings-section"><h2>Tracking</h2><SettingRow label="Default tracking" description="Turn tracking on for new compose windows." settingKey="default_tracking" enabled={settings?.default_tracking ?? true}/><SettingRow label="Browser notifications" description="Show a local browser notification after a new open syncs." settingKey="open_notifications" enabled={settings?.open_notifications ?? false}/></section>
    <section className="settings-section"><h2>Extension</h2><div className="setting-row static"><div><h3>Connection status</h3><p>Open the extension popup to verify this browser is connected.</p></div><span className="neutral-status">Browser-specific</span></div></section>
    <section className="settings-section danger-section"><h2>Data</h2><div className="setting-row"><div><h3>Delete tracking history</h3><p>Permanently delete tracked emails and all open events.</p></div><DangerAction label="Delete history" title="Delete all tracking history?" description="This cannot be undone. Your account and settings will remain." action={deleteHistory}/></div><div className="setting-row"><div><h3>Delete account</h3><p>Permanently delete the account and all associated data.</p></div><DangerAction label="Delete account" title="Delete your OpenTrackMail account?" description="Your account, tracking history, and settings will be permanently deleted." action={deleteAccount}/></div></section>
  </div>;
}
