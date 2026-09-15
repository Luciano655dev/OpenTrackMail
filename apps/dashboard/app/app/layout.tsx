import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "OpenTrackMail App", template: "%s | OpenTrackMail" },
  description: "Your tracked email history.",
  robots: { index: false, follow: false },
};

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return children;
}
