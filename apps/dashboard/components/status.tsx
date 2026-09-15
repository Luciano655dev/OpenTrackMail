export function Status({ openCount }: { openCount: number }) {
  return <span className={openCount ? "email-status opened" : "email-status sent"}><span aria-hidden="true">{openCount ? "✓✓" : "✓"}</span>{openCount ? "Opened" : "Sent"}</span>;
}
