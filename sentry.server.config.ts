// This file configures the initialization of Sentry on the server side.
// The DSN is optional — if not set, Sentry will be disabled.

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Add optional configuration for performance monitoring
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 0,
});
