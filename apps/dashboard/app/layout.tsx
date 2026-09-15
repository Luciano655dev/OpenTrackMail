import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { SITE_URL } from "@/lib/site";
import "./globals.css";
import "./site.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: "OpenTrackMail",
  title: { default: "OpenTrackMail – Open-Source Email Tracking", template: "%s | OpenTrackMail" },
  description: "Free, open-source email tracking for Gmail and modern inboxes. Get private open notifications without adding a CRM to your workflow.",
  keywords: ["email tracking", "open source email tracker", "Gmail email tracker", "email open tracking", "Chrome extension"],
  authors: [{ name: "OpenTrackMail", url: SITE_URL }],
  creator: "OpenTrackMail",
  publisher: "OpenTrackMail",
  category: "technology",
  referrer: "origin-when-cross-origin",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
  openGraph: {
    type: "website",
    url: "/",
    siteName: "OpenTrackMail",
    title: "OpenTrackMail – Open-Source Email Tracking",
    description: "Know when emails are opened with a focused, privacy-conscious Chrome extension—no CRM required.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "OpenTrackMail open-source email tracking" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "OpenTrackMail – Open-Source Email Tracking",
    description: "Know when emails are opened—without turning your inbox into a CRM.",
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geist.variable} ${mono.variable}`}>
        <Script id="theme-bootstrap" strategy="beforeInteractive">{`(function(){try{var saved=localStorage.getItem("opentrackmail-theme");var theme=saved==="light"||saved==="dark"?saved:(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");document.documentElement.dataset.theme=theme;document.documentElement.style.colorScheme=theme}catch(e){}})()`}</Script>
        {children}
      </body>
    </html>
  );
}
