// Gmail is a dynamic application. Keep every fragile selector in this module so
// a Gmail DOM change can be repaired without touching tracking or API logic.
export const gmailSelectors={
  compose:"[role='dialog']",
  body:"div[contenteditable='true'][role='textbox'], div[contenteditable='true'][aria-label*='Message Body']",
  subject:"input[name='subjectbox']",
  recipients:"[email]",
  send:"[role='button'][data-tooltip^='Send'], [role='button'][aria-label^='Send']",
  rows:"[role='main'] tr",
  subjectInRow:"[data-thread-id] span, .bog, [role='link'] span",
  threadLink:"a[href*='#sent/'], a[href*='/sent/']",
} as const;
