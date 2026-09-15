import { CheckCheck, Search, SlidersHorizontal } from "lucide-react";

const rows = [
  { recipient: "Scott", subject: "Partnership opportunity", state: "opened" },
  { recipient: "Jane", subject: "Recommendation request", state: "sent" },
  { recipient: "Morgan", subject: "Project introduction", state: "opened" },
];

function Checks({ opened }: { opened: boolean }) {
  return <span className={opened ? "checks opened" : "checks"} aria-label={opened ? "Opened" : "Tracked, not opened"}>{opened ? "✓✓" : "✓"}</span>;
}

export function GmailMockup({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`mail-window ${compact ? "compact" : ""}`} aria-label="Example sent messages">
      <div className="window-bar"><span /><span /><span /><b>Sent</b></div>
      <div className="mail-toolbar"><Search size={16} /><span>Search mail</span><SlidersHorizontal size={15} /></div>
      <div className="mail-list">
        {rows.map((row) => (
          <div className="mail-row" key={row.subject}>
            <span className="mail-avatar">{row.recipient.slice(0, 1)}</span>
            <span className="mail-recipient">{row.recipient}</span>
            <span className="mail-subject">{row.subject}</span>
            <Checks opened={row.state === "opened"} />
          </div>
        ))}
      </div>
      {!compact && (
        <div className="tracking-popover">
          <div className="popover-title"><CheckCheck size={16} /> Opened 2 times</div>
          <dl><div><dt>First</dt><dd>Sep 14, 4:32 PM</dd></div><div><dt>Last</dt><dd>Sep 14, 4:47 PM</dd></div></dl>
        </div>
      )}
    </div>
  );
}

export function DashboardMockup() {
  return (
    <div className="dashboard-mockup" aria-label="Example OpenTrackMail dashboard">
      <div className="mock-header"><span className="mini-mark">✓✓</span><b>OpenTrackMail</b><span className="mock-user">LM</span></div>
      <div className="mock-heading"><div><span>Tracked emails</span><b>48</b></div><div><span>Opened</span><b>31</b></div><div><span>Open rate</span><b>64.6%</b></div></div>
      <div className="mock-table">
        <div className="mock-table-head"><span>Recipient</span><span>Subject</span><span>Status</span><span>Opens</span></div>
        <div><span>scott@example.com</span><span>Creator invitation</span><span className="status-open">Opened</span><span>2</span></div>
        <div><span>jane@example.com</span><span>Recommendation request</span><span>Sent</span><span>0</span></div>
      </div>
    </div>
  );
}
