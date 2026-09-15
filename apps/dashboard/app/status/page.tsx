import type { Metadata } from "next";
import Link from "next/link";
import { Activity, ArrowRight, Github, MailPlus, Radio, ShieldCheck, Users } from "lucide-react";
import { Footer, Header } from "@/components/site-chrome";
import { DailyMetricChart } from "@/components/daily-metric-chart";
import { formatStat, getPublicStats } from "@/lib/public-stats";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Status",
  description: "Live OpenTrackMail community usage: accounts created and emails tracked.",
  alternates: { canonical: "/status" },
};

export default async function StatusPage() {
  const stats = await getPublicStats();
  const updatedAt = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date());

  return (
    <>
      <Header />
      <main className="status-page">
        <section className="status-hero container">
          <div>
            <p className="eyebrow"><Radio size={14} aria-hidden="true" /> Live community status</p>
            <h1>OpenTrackMail, by the numbers.</h1>
            <p>Transparent, aggregate usage numbers from the OpenTrackMail community. No email addresses, subjects, recipients, or message content are exposed here.</p>
          </div>
          <span className={`status-availability ${stats ? "available" : "unavailable"}`}>
            <span aria-hidden="true" /> {stats ? "Metrics online" : "Metrics unavailable"}
          </span>
        </section>

        <section className="container status-metrics" aria-label="Usage totals">
          <article>
            <div className="metric-icon"><Users aria-hidden="true" /></div>
            <p>Accounts created</p>
            <strong>{stats ? formatStat(stats.accountCount) : "—"}</strong>
            <span>People who have connected an OpenTrackMail account.</span>
          </article>
          <article>
            <div className="metric-icon"><MailPlus aria-hidden="true" /></div>
            <p>Emails tracked</p>
            <strong>{stats ? formatStat(stats.trackedEmailCount) : "—"}</strong>
            <span>Messages registered for open tracking across all accounts.</span>
          </article>
        </section>

        {stats?.history.length ? <section className="container status-charts" aria-label="Daily activity over the last 30 days">
          <DailyMetricChart title="Account growth" description="New accounts created each day, last 30 days" points={stats.history.map((day) => ({ date: day.date, value: day.accounts }))} singular="account" plural="accounts" />
          <DailyMetricChart title="Email activity" description="Emails registered for tracking each day, last 30 days" points={stats.history.map((day) => ({ date: day.date, value: day.trackedEmails }))} singular="email" plural="emails" />
        </section> : null}

        <section className="container status-details">
          <div>
            <p className="section-kicker">What these numbers mean</p>
            <h2>Useful totals, with privacy intact.</h2>
          </div>
          <div className="status-notes">
            <article><Activity aria-hidden="true" /><div><h3>Updated regularly</h3><p>The totals refresh from the live database at least every five minutes. Last checked {updatedAt} UTC.</p></div></article>
            <article><ShieldCheck aria-hidden="true" /><div><h3>Aggregate only</h3><p>This page counts accounts and tracked messages. It never returns identities or the metadata belonging to any individual message.</p></div></article>
            <article><Github aria-hidden="true" /><div><h3>Verifiable and open source</h3><p>The implementation is public, from the database schema to the code that renders these counters.</p><a href="https://github.com/luciano655dev/OpenTrackMail" target="_blank" rel="noreferrer">Inspect the repository <ArrowRight size={15} /></a></div></article>
          </div>
        </section>

        <section className="status-cta">
          <div className="container status-cta-inner">
            <div><p className="section-kicker">Join the community</p><h2>Track emails on your terms.</h2></div>
            <div><Link className="button" href="/app/login">Get OpenTrackMail <ArrowRight size={17} /></Link><a href="https://github.com/luciano655dev/OpenTrackMail" target="_blank" rel="noreferrer">Or self-host your own copy</a></div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
