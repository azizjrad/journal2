// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://6fb0aff052efa7640eb93d8582564bb0@o4510510299611137.ingest.de.sentry.io/4510510302036048",

  // Session Replay for debugging user sessions
  integrations: [
    Sentry.replayIntegration({
      maskAllText: false, // Show text in replays
      blockAllMedia: false, // Show images/videos
    }),
  ],

  // Adjust sample rate for production
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Enable logs
  enableLogs: true,

  // Replay sampling: 10% of normal sessions, 100% of error sessions
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Enable sending user PII for support
  sendDefaultPii: true,

  // Set environment
  environment: process.env.NODE_ENV || "development",

  // Filter sensitive data before sending
  beforeSend(event, hint) {
    // Remove passwords and tokens from breadcrumbs
    if (event.breadcrumbs) {
      event.breadcrumbs = event.breadcrumbs.map((breadcrumb) => {
        if (breadcrumb.data) {
          delete breadcrumb.data.password;
          delete breadcrumb.data.token;
          delete breadcrumb.data.api_key;
        }
        return breadcrumb;
      });
    }
    return event;
  },

  // Ignore common browser errors
  ignoreErrors: [
    "ResizeObserver loop limit exceeded",
    "Non-Error promise rejection captured",
    "ChunkLoadError",
    "Loading chunk",
    "Network request failed",
  ],
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
