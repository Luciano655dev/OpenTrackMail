import { defineManifest } from "@crxjs/vite-plugin";

export default defineManifest(({ mode }) => ({
  manifest_version: 3,
  name: mode === "development" ? "OpenTrackMail (Development)" : "OpenTrackMail",
  version: "0.1.2",
  description: "Simple, open-source email tracking for the inboxes you already use.",
  minimum_chrome_version: "116",
  permissions: ["identity", "storage", "notifications", "alarms", "declarativeNetRequestWithHostAccess"],
  host_permissions: [`${new URL(process.env.OTM_API_URL_FOR_MANIFEST || "http://localhost:3001").origin}/*`],
  background: { service_worker: "src/background.ts", type: "module" },
  action: { default_popup: "src/popup/index.html", default_title: "OpenTrackMail", default_icon: { "16": "icons/icon-16.png", "32": "icons/icon-32.png" } },
  icons: { "16": "icons/icon-16.png", "32": "icons/icon-32.png", "48": "icons/icon-48.png", "128": "icons/icon-128.png" },
  content_scripts: [{ matches: ["https://mail.google.com/*"], js: ["src/content.ts"], css: ["src/content.css"], run_at: "document_idle" }],
  content_security_policy: { extension_pages: "script-src 'self'; object-src 'self'" },
}));
