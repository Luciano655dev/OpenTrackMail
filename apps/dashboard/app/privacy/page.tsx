import { Footer, Header } from "@/components/site-chrome";

export const metadata = { title: "Privacy Policy", description: "How OpenTrackMail handles account, message metadata, and email-open events.", alternates: { canonical: "/privacy" } };

export default function PrivacyPage() {
  return <><Header /><main className="legal container"><p className="eyebrow">Last updated September 14, 2026</p><h1>Privacy Policy</h1><p className="legal-notice"><strong>Legal review required before public launch.</strong> This policy describes the intended MVP behavior and is not legal advice.</p>
    <section><h2>What OpenTrackMail does</h2><p>OpenTrackMail adds a small, invisible remote image to emails that a user chooses to track. When an email client requests that image, OpenTrackMail records an open event and returns a transparent image.</p></section>
    <section><h2>Information we collect</h2><p>For account holders, we store account identity, email address, preferences, tracked-email subject, recipients, provider metadata, and timestamps. We do not store the full email body.</p><p>When a recipient&apos;s email client loads a tracking image, we record the opaque tracking identifier, time, limited user-agent metadata, and a one-way short-lived request signature used for duplicate handling and abuse prevention. Raw IP addresses are not exposed to senders and are not stored by the application.</p></section>
    <section><h2>How information is used</h2><p>We use this information only to provide open-status history, secure the service, prevent abuse, and improve duplicate-detection logic. We do not use tracking events for advertising, contact enrichment, fingerprinting, location tracking, or cross-site tracking.</p></section>
    <section><h2>Retention and deletion</h2><p>Tracked-email and event data is retained until the account holder deletes individual history, all tracking history, or the account. Operational logs maintained by infrastructure providers may have separate limited retention periods. Before launch, OpenTrackMail must document those exact provider retention periods here.</p></section>
    <section><h2>Your responsibilities</h2><p>Users are responsible for complying with applicable law and obtaining any disclosure or consent required before tracking recipients. Do not use OpenTrackMail for unlawful surveillance, harassment, or sensitive profiling.</p></section>
    <section><h2>Service providers and contact</h2><p>The MVP uses Supabase for authentication and database hosting and Vercel for application hosting. Their processing is governed by their own terms and data-processing agreements. Privacy questions can be sent to <a href="mailto:privacy@opentrackmail.com">privacy@opentrackmail.com</a>.</p></section>
  </main><Footer /></>;
}
