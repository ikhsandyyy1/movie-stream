import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org"
      },
      {
        protocol: "https",
        hostname: "qcbtbbajmvailfolkqoq.supabase.co"
      }
    ]
  },
  // For Three.js (Ethereal component)
  transpilePackages: ["three"],
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://image.tmdb.org https://*.supabase.co https://*.unsplash.com https://*.wikipedia.org https://archive.org",
              "media-src 'self' https://*.supabase.co https://archive.org",
              "frame-src 'self' https://web.nxsha.app https://archive.org",
              "connect-src 'self' https://*.supabase.co https://vitals.vercel-insights.com https://o450000.ingest.sentry.io",
              "font-src 'self' data:",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: process.env.NODE_ENV !== "production",
  widenClientFileUpload: true,
  sourcemaps: { deleteSourcemapsAfterUpload: true },
  disableLogger: true,
  automaticVercelMonitors: false,
});
