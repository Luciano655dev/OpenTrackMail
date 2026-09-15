import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import "./marketing.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://opentrackmail.com"),
  title: { default: "OpenTrackMail | Open-source email tracking", template: "%s | OpenTrackMail" },
  description: "Simple, privacy-conscious email open tracking for the inboxes you already use.",
  openGraph: {
    type: "website",
    url: "/",
    siteName: "OpenTrackMail",
    title: "OpenTrackMail | Open-source email tracking",
    description: "Simple, privacy-conscious email open tracking for the inboxes you already use.",
    images: [{ url: "/opentrackmail-logo.png", width: 512, height: 512, alt: "OpenTrackMail" }],
  },
  twitter: {
    card: "summary",
    title: "OpenTrackMail | Open-source email tracking",
    description: "Simple, privacy-conscious email open tracking for the inboxes you already use.",
    images: [{ url: "/opentrackmail-logo.png", alt: "OpenTrackMail" }],
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
