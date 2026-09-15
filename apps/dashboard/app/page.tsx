import Link from "next/link";
import type { Metadata } from "next";
import Script from "next/script";
import {
  ArrowRight,
  BadgeCheck,
  CheckCheck,
  Clock3,
  Download,
  Github,
  History,
  Inbox,
  MailPlus,
  Send,
  Users,
} from "lucide-react";
import { DashboardMockup, GmailMockup } from "@/components/product-mockups";
import { Footer, Header } from "@/components/site-chrome";
import { formatStat, getPublicStats, shouldShowSocialProof } from "@/lib/public-stats";
import { GITHUB_URL, SITE_URL } from "@/lib/site";

export const revalidate = 300;

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "OpenTrackMail",
      url: SITE_URL,
      logo: `${SITE_URL}/opentrackmail-logo.png`,
      sameAs: [GITHUB_URL],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "OpenTrackMail",
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE_URL}/#software`,
      name: "OpenTrackMail",
      url: SITE_URL,
      description: "Free, open-source email tracking for Gmail and modern inboxes.",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Google Chrome, Chromium",
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      license: "https://opensource.org/license/mit",
      codeRepository: GITHUB_URL,
      featureList: ["Email open tracking", "Inbox status indicators", "Open history", "Private dashboard", "Self-hosting"],
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
  ],
};

export default async function Home() {
  const stats = await getPublicStats();

  return (
    <>
      <Script
        id="opentrackmail-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
      />
      <Header />
      <main>
        <section className="hero container">
          <div className="hero-copy">
            <p className="eyebrow">Built for modern inboxes</p>
            <h1>Know when your emails are opened.</h1>
            <p className="hero-text">Simple, open-source email tracking across the platforms you already use. Send normally and OpenTrackMail quietly tells you when an open is detected—without turning your inbox into a CRM.</p>
            <div className="hero-actions">
              <Link className="button" href="#install">Get OpenTrackMail <ArrowRight size={17} /></Link>
              <Link className="button button-secondary" href="#how-it-works">View how it works</Link>
            </div>
            <p className="hero-note">No CRM. No writing assistant. Just open tracking.</p>
          </div>
          <div className="hero-product"><GmailMockup /></div>
        </section>

        {shouldShowSocialProof(stats) && stats ? (
          <section className="social-proof" aria-label="OpenTrackMail usage">
            <div className="container social-proof-inner">
              <p>Trusted by a growing community of focused senders</p>
              <dl>
                <div><dt><Users size={17} /> Accounts</dt><dd>{formatStat(stats.accountCount)}+</dd></div>
                <div><dt><MailPlus size={17} /> Emails tracked</dt><dd>{formatStat(stats.trackedEmailCount)}+</dd></div>
              </dl>
              <Link href="/status">View live status <ArrowRight size={15} /></Link>
            </div>
          </section>
        ) : null}

        <section className="section how" id="how-it-works">
          <div className="container">
            <p className="section-kicker">How it works</p>
            <h2>Three small steps. Then it gets out of your way.</h2>
            <p className="section-intro">OpenTrackMail adds one focused layer to your email workflow. There is no new sending process to learn and no pipeline to maintain.</p>
            <div className="steps">
              <article><div className="step-heading"><span>01</span><Download aria-hidden="true" /></div><h3>Install and connect</h3><p>Add the Chrome extension, sign in securely with Google through Supabase, and choose whether tracking should be on by default.</p></article>
              <article><div className="step-heading"><span>02</span><Send aria-hidden="true" /></div><h3>Write and send normally</h3><p>Compose in your inbox exactly as you already do. When tracking is enabled, OpenTrackMail adds a tiny invisible tracking image before send.</p></article>
              <article><div className="step-heading"><span>03</span><BadgeCheck aria-hidden="true" /></div><h3>See the signal in context</h3><p>Check the status beside your sent message, hover for useful timing details, or open the dashboard for the complete activity history.</p></article>
            </div>
          </div>
        </section>

        <section className="section product-section">
          <div className="container product-grid">
            <div className="product-copy"><p className="section-kicker">Inside your inbox</p><h2>Status where you already work.</h2><p>A gray check means tracking is active. Two blue checks mean a tracking image was loaded. Hover for the first open, latest open, and detected open count.</p></div>
            <GmailMockup compact />
            <DashboardMockup />
            <div className="product-copy dashboard-copy"><p className="section-kicker">Simple history</p><h2>Review tracking without a CRM.</h2><p>Search tracked messages, filter by status, and open a clear activity timeline. OpenTrackMail stores metadata, not the body of your email.</p></div>
          </div>
        </section>

        <section className="section features" id="features">
          <div className="container">
            <p className="section-kicker">Focused by design</p><h2>Only what open tracking needs.</h2>
            <div className="feature-grid">
              <article><Clock3 /><h3>Open tracking</h3><p>See when an open is detected.</p></article>
              <article><Inbox /><h3>Inbox integration</h3><p>Tracking appears directly where you send email.</p></article>
              <article><History /><h3>Open history</h3><p>See first, latest, and detected open count.</p></article>
              <article><CheckCheck /><h3>Simple dashboard</h3><p>View tracked emails without turning your inbox into a CRM.</p></article>
            </div>
          </div>
        </section>

        <section className="section open-source" id="open-source">
          <div className="container open-source-inner">
            <div className="open-source-heading">
              <p className="section-kicker"><Github size={15} aria-hidden="true" /> Open source</p>
              <h2>The code is public.</h2>
            </div>
            <div className="open-source-copy">
              <p>OpenTrackMail is MIT licensed. Read the source, contribute, or run it with your own Supabase project.</p>
              <a className="source-link" href="https://github.com/luciano655dev/OpenTrackMail" target="_blank" rel="noreferrer">View repository <ArrowRight size={16} aria-hidden="true" /></a>
            </div>
          </div>
        </section>

        <section className="section reliability">
          <div className="container reliability-inner">
            <div><p className="section-kicker">A useful signal, not a guarantee</p><h2>Email tracking isn&apos;t perfect.</h2></div>
            <p>Gmail, Apple Mail, Outlook, security scanners, privacy tools, image blocking, proxying, and caching can all influence results. “Opened” means the tracking image loaded. It does not prove the recipient read the email.</p>
          </div>
        </section>

        <section className="cta" id="install"><div className="container cta-inner"><div><h2>Track your next email.</h2><p>Install locally today. Chrome Web Store release is coming after review.</p></div><Link className="button" href="/app/login">Get OpenTrackMail <ArrowRight size={17} /></Link></div></section>
      </main>
      <Footer />
    </>
  );
}
