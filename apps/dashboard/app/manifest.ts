import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "OpenTrackMail",
    short_name: "OpenTrackMail",
    description: "Open-source email tracking for modern inboxes.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#5f83c5",
    icons: [{ src: "/icon.png", sizes: "512x512", type: "image/png" }],
  };
}
