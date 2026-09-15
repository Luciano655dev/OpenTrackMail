import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/format";
import { Status } from "@/components/status";

export const metadata = { title: "Email activity" };
export default async function EmailDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const supabase = await createClient();
  const [{ data: email }, { data: events }] = await Promise.all([
    supabase.from("tracked_emails").select("id,subject,recipients,sent_at,open_count,first_opened_at,last_opened_at").eq("id", id).maybeSingle(),
    supabase.from("open_events").select("id,detected_at,classification").eq("tracked_email_id", id).eq("classification", "counted").order("detected_at", { ascending: true }).limit(500),
  ]);
  if (!email) notFound();
  return <div className="detail-page"><Link href="/app/emails" className="back-link"><ArrowLeft size={16}/>Tracked emails</Link><div className="detail-heading"><div><p>{email.recipients.join(", ")}</p><h1>{email.subject}</h1><span>Sent {formatDate(email.sent_at)}</span></div><Status openCount={email.open_count}/></div>
    <dl className="detail-stats"><div><dt>Current status</dt><dd>{email.open_count?"Opened":"Tracking active"}</dd></div><div><dt>First open</dt><dd>{formatDate(email.first_opened_at)}</dd></div><div><dt>Last open</dt><dd>{formatDate(email.last_opened_at)}</dd></div><div><dt>Detected opens</dt><dd>{email.open_count}</dd></div></dl>
    <section className="activity"><h2>Activity</h2><ol><li><span className="activity-dot sent-dot">✓</span><div><b>Sent</b><time>{formatDate(email.sent_at)}</time></div></li>{events?.map((event)=><li key={event.id}><span className="activity-dot open-dot">✓✓</span><div><b>Open detected</b><time>{formatDate(event.detected_at)}</time></div></li>)}</ol></section>
    <p className="reliability-note">“Opened” means the tracking image loaded. It does not guarantee the recipient read the message.</p>
  </div>;
}
