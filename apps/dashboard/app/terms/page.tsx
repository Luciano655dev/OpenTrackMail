import { Footer, Header } from "@/components/site-chrome";

export const metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return <><Header /><main className="legal container"><p className="eyebrow">Last updated September 14, 2026</p><h1>Terms of Service</h1><p className="legal-notice"><strong>Legal review required before public launch.</strong> These draft terms describe the intended MVP and are not legal advice.</p>
    <section><h2>Using the service</h2><p>You may use OpenTrackMail only for lawful email you are authorized to send. You are responsible for required notices, consent, and compliance with privacy, communications, employment, and marketing laws that apply to you and your recipients.</p></section>
    <section><h2>Prohibited use</h2><p>Do not use the service for spam, harassment, stalking, discrimination, sensitive profiling, bypassing security controls, unlawful surveillance, or attempts to identify or locate recipients beyond information they already provided.</p></section>
    <section><h2>Tracking limitations</h2><p>An “open” means a remote tracking image was requested. It does not prove an email was read by a person. Image proxying, preloading, caching, blocking, security scanners, and privacy features may create missed or false signals.</p></section>
    <section><h2>Availability and changes</h2><p>The MVP is provided without a guarantee of uninterrupted operation. We may change or discontinue features when needed for reliability, security, legal compliance, or maintainability.</p></section>
    <section><h2>Account and deletion</h2><p>You are responsible for your account security. You may delete tracking history or your account from Settings. We may suspend accounts that abuse the service or create security risk.</p></section>
    <section><h2>Liability and governing terms</h2><p>Warranty disclaimers, liability limits, governing law, dispute terms, and the legal entity operating OpenTrackMail must be completed by qualified counsel before launch. Contact <a href="mailto:legal@opentrackmail.com">legal@opentrackmail.com</a>.</p></section>
  </main><Footer /></>;
}
