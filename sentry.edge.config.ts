// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://6fb0aff052efa7640eb93d8582564bb0@o4510510299611137.ingest.de.sentry.io/4510510302036048",

  // Adjust sample rate for production
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Enable logs
  enableLogs: true,

  // Enable sending user PII
  sendDefaultPii: true,

  // Set environment
  environment: process.env.NODE_ENV || "development",
});
