import Link from "next/link";
import { Search } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/format";
import { Status } from "@/components/status";
import { DeleteEmailAction } from "@/components/delete-email-action";
import { RefreshEmailsButton } from "@/components/refresh-emails-button";

type SearchParams = Promise<{ search?: string; status?: string }>;
export const metadata = { title: "Tracked emails" };
export default async function EmailsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams; const search = (params.search || "").trim().slice(0, 200); const status = params.status || "all";
  const supabase = await createClient();
  let query = supabase.from("tracked_emails").select("id,subject,recipients,sent_at,open_count,last_opened_at", { count: "exact" }).order("sent_at", { ascending: false }).limit(100);
  if (search) query = query.or(`subject.ilike.%${search.replace(/[%_,()]/g, "")}%,recipients_text.ilike.%${search.replace(/[%_,()]/g, "")}%`);
  if (status === "opened") query = query.gt("open_count", 0); if (status === "sent") query = query.eq("open_count", 0);
  const [{ data: emails, count }, { count: total }, { count: opened }] = await Promise.all([
    query,
    supabase.from("tracked_emails").select("id", { count: "exact", head: true }),
    supabase.from("tracked_emails").select("id", { count: "exact", head: true }).gt("open_count", 0),
  ]);
  const rate = total ? ((opened || 0) / total * 100).toFixed(1) : "0.0";
  return <div><div className="page-title"><div><h1>Tracked emails</h1><p>Open activity from messages sent with the extension.</p></div><dl className="metrics"><div><dt>Tracked</dt><dd>{total || 0}</dd></div><div><dt>Opened</dt><dd>{opened || 0}</dd></div><div><dt>Open rate</dt><dd>{rate}%</dd></div></dl></div>
    <div className="table-controls"><form className="search-form"><Search size={16}/><input name="search" defaultValue={search} placeholder="Search recipient or subject" aria-label="Search tracked emails"/><input type="hidden" name="status" value={status}/></form><div className="table-actions"><div className="filters" aria-label="Status filter">{[["all","All"],["opened","Opened"],["sent","Not opened"]].map(([value,label])=><Link className={status===value?"active":""} key={value} href={`/app/emails?status=${value}${search?`&search=${encodeURIComponent(search)}`:""}`}>{label}</Link>)}</div><RefreshEmailsButton/></div></div>
    <div className="email-table-wrap"><table className="email-table"><thead><tr><th>Recipient</th><th>Subject</th><th>Sent</th><th>Status</th><th>Opens</th><th>Last opened</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{emails?.map((email)=><tr key={email.id}><td><a href={`mailto:${email.recipients[0]}`}>{email.recipients.join(", ")}</a></td><td><Link className="subject-link" href={`/app/emails/${email.id}`}>{email.subject}</Link></td><td>{formatDate(email.sent_at)}</td><td><Status openCount={email.open_count}/></td><td>{email.open_count}</td><td>{formatDate(email.last_opened_at)}</td><td className="email-actions"><DeleteEmailAction emailId={email.id} subject={email.subject}/></td></tr>)}</tbody></table>{!count&&<div className="empty-state"><h2>No tracked emails</h2><p>{search||status!=="all"?"Try changing your search or filter.":"Send a tracked message from your inbox and it will appear here."}</p></div>}</div>
    <p className="reliability-note">Open tracking is a signal, not proof of reading. Email apps may preload, proxy, cache, or block tracking images.</p>
  </div>;
}
