/**
 * Sentry Helper Functions
 * Simplified error tracking and monitoring
 */

import * as Sentry from "@sentry/nextjs";

/**
 * Track payment errors with context
 */
export function trackPaymentError(
  error: Error,
  context: {
    userId?: string;
    amount?: number;
    currency?: string;
    paymentMethod?: string;
  }
) {
  Sentry.captureException(error, {
    tags: {
      type: "payment",
      payment_method: context.paymentMethod,
    },
    contexts: {
      payment: {
        amount: context.amount,
        currency: context.currency,
      },
    },
    user: context.userId ? { id: context.userId } : undefined,
  });
}

/**
 * Track database errors
 */
export function trackDatabaseError(
  error: Error,
  operation: string,
  collection?: string
) {
  Sentry.captureException(error, {
    tags: {
      type: "database",
      operation,
      collection,
    },
  });
}

/**
 * Track API errors
 */
export function trackAPIError(
  error: Error,
  endpoint: string,
  method: string,
  statusCode?: number
) {
  Sentry.captureException(error, {
    tags: {
      type: "api",
      endpoint,
      method,
      status_code: statusCode,
    },
  });
}

/**
 * Track authentication errors
 */
export function trackAuthError(error: Error, email?: string) {
  Sentry.captureException(error, {
    tags: {
      type: "authentication",
    },
    user: email ? { email } : undefined,
  });
}

/**
 * Track webhook errors
 */
export function trackWebhookError(
  error: Error,
  webhookType: string,
  eventId?: string
) {
  Sentry.captureException(error, {
    tags: {
      type: "webhook",
      webhook_type: webhookType,
    },
    contexts: {
      webhook: {
        event_id: eventId,
      },
    },
  });
}

/**
 * Set user context for tracking
 */
export function setUserContext(user: {
  id: string;
  email?: string;
  username?: string;
}) {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username,
  });
}

/**
 * Clear user context (on logout)
 */
export function clearUserContext() {
  Sentry.setUser(null);
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(
  message: string,
  category: string,
  data?: Record<string, any>
) {
  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: "info",
  });
}

/**
 * Track custom events/metrics
 */
export function trackEvent(
  name: string,
  data?: Record<string, any>,
  level: "info" | "warning" | "error" = "info"
) {
  Sentry.captureMessage(name, {
    level,
    tags: {
      event_type: "custom",
    },
    extra: data,
  });
}
