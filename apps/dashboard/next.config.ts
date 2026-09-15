import type { NextConfig } from "next";

const supabaseOrigin = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.invalid").origin;
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  `connect-src 'self' ${supabaseOrigin}`,
  "font-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  transpilePackages: ["@opentrackmail/shared"],
  async redirects() {
    return [
      { source: "/login", destination: "/app/login", permanent: false },
      { source: "/emails", destination: "/app/emails", permanent: false },
      { source: "/emails/:path*", destination: "/app/emails/:path*", permanent: false },
      { source: "/settings", destination: "/app/settings", permanent: false },
    ];
  },
  async rewrites() {
    return [{ source: "/t/:trackingId.gif", destination: "/t/:trackingId" }];
  },
  async headers() {
    return [{
      source: "/:path*",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        { key: "Content-Security-Policy", value: csp },
      ],
    }];
  },
};

export default nextConfig;
