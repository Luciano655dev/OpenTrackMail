# SEO and launch runbook

The application already serves canonical metadata, Schema.org JSON-LD, `sitemap.xml`, `robots.txt`, `llms.txt`, a web manifest, and a 1200×630 social image. Public stats use five-minute ISR; private app, API, auth, and tracking routes are excluded from indexing.

## Production and Google Search Console

1. Point `opentrackmail.com` to the production deployment and set `NEXT_PUBLIC_SITE_URL=https://opentrackmail.com`.
2. Create a Search Console **Domain property** and verify it with the DNS TXT record Google provides. DNS verification is preferred because it covers every protocol and subdomain.
3. Alternatively, copy only the HTML-tag `content` token into `GOOGLE_SITE_VERIFICATION` and redeploy.
4. Submit `https://opentrackmail.com/sitemap.xml`, inspect `/`, and request indexing after the domain resolves.
5. Check Page indexing and Core Web Vitals weekly for the first month. Do not index `/app`, `/api`, `/auth`, or `/t`.
6. Ensure CDN/firewall rules allow Googlebot plus GPTBot, ChatGPT-User, OAI-SearchBot, ClaudeBot, Claude-User, PerplexityBot, Google-Extended, and Applebot-Extended to access public pages.

## GitHub discovery

Set the repository website to `https://opentrackmail.com`, upload `apps/dashboard/public/preview-image.png` as the social preview, and use these topics:

`email-tracking`, `gmail`, `chrome-extension`, `open-source`, `nextjs`, `supabase`, `typescript`, `manifest-v3`, `self-hosted`, `privacy`

## Ready-to-edit launch posts

### Hacker News

**Title:** Show HN: OpenTrackMail – open-source email tracking without a CRM

I built OpenTrackMail because I wanted one signal—whether a message was opened—inside the inbox I already use, without adopting a sales CRM. It is an MIT-licensed Chrome extension plus a Next.js/Supabase dashboard. It stores message metadata rather than bodies and can be self-hosted. Open tracking is imperfect: proxies, scanners, caching, and image blocking affect results, so the UI treats it as a signal rather than proof. Source: https://github.com/Luciano655dev/OpenTrackMail · Demo: https://opentrackmail.com

### Product Hunt

**Tagline:** Open-source email tracking, without the CRM

OpenTrackMail adds focused open-status signals to your inbox and keeps a private activity history. It is free, MIT licensed, transparent about tracking limitations, and fully self-hostable.

### Reddit / community post

I built an open-source email tracker that stays focused on one job: showing when a tracking image was loaded. It adds status checks inside the inbox and provides a small private dashboard—no pipeline or writing assistant. The implementation and self-hosting guide are public. I would especially value feedback on privacy defaults, false-open handling, and inbox UX: https://github.com/Luciano655dev/OpenTrackMail

## Earned backlinks

- Publish only after the live URL, install path, privacy policy, screenshots, and demo work.
- Submit a useful, non-duplicated launch to Hacker News, Product Hunt, Indie Hackers, relevant browser-extension communities, and self-hosted/open-source directories whose rules permit it.
- Ask early users and contributors to link to the canonical website when writing about the project.
- Create technical posts about duplicate-open filtering, Gmail DOM integration, Supabase RLS, and privacy tradeoffs; link to the relevant source and docs.
- Avoid paid link schemes, mass directory submissions, and copy-pasted community posts.
