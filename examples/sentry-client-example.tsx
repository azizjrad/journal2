/**
 * Example: How to track errors in Client Components
 *
 * Use this pattern in your React components
 */

"use client";

import { useState } from "react";
import * as Sentry from "@sentry/nextjs";
import { addBreadcrumb, trackEvent } from "@/lib/sentry";

export function ExampleComponent() {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    try {
      setLoading(true);

      // Add breadcrumb for debugging
      addBreadcrumb("User clicked subscribe", "user_action", {
        plan: "annual",
      });

      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "annual" }),
      });

      if (!response.ok) {
        throw new Error("Subscription failed");
      }

      const data = await response.json();

      // Track successful event
      trackEvent(
        "Subscription successful",
        {
          plan: "annual",
          userId: data.userId,
        },
        "info"
      );

      addBreadcrumb("Subscription created", "payment", {
        subscriptionId: data.subscriptionId,
      });
    } catch (error) {
      console.error("Subscription error:", error);

      // Manually capture error with context
      Sentry.captureException(error, {
        tags: {
          component: "ExampleComponent",
          action: "subscribe",
        },
        extra: {
          plan: "annual",
        },
      });

      alert("Subscription failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleSubscribe} disabled={loading}>
      {loading ? "Processing..." : "Subscribe Now"}
    </button>
  );
}

// Example: Error Boundary with Sentry
export function ErrorBoundaryExample() {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="error">
        <h2>Something went wrong</h2>
        <p>We've been notified and are looking into it.</p>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => {
          try {
            // Simulate an error
            throw new Error("Test error from button click");
          } catch (error) {
            // Capture the error
            Sentry.captureException(error);
            setHasError(true);
          }
        }}
      >
        Trigger Error
      </button>
    </div>
  );
}

// Example: Track user actions
export function TrackUserActions() {
  const handleArticleView = (articleId: string) => {
    // Add breadcrumb
    addBreadcrumb("User viewed article", "navigation", {
      articleId,
      timestamp: new Date().toISOString(),
    });

    // Your navigation logic
    window.location.href = `/article/${articleId}`;
  };

  const handleShareArticle = (articleId: string, platform: string) => {
    // Track sharing event
    trackEvent(
      "Article shared",
      {
        articleId,
        platform,
        timestamp: new Date().toISOString(),
      },
      "info"
    );

    // Your sharing logic
  };

  return (
    <div>
      <button onClick={() => handleArticleView("123")}>Read Article</button>
      <button onClick={() => handleShareArticle("123", "twitter")}>
        Share on Twitter
      </button>
    </div>
  );
}
