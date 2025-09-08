"use client";

import { useEffect, useRef, useCallback } from "react";

interface ViewTrackerProps {
  articleId: string | undefined;
  title: string;
}

// Optimized global tracking cache with LRU behavior
const trackingCache = new Map<string, number>();
const MAX_CACHE_SIZE = 50;
const TRACKING_COOLDOWN = 5000; // 5 seconds

// Performance-optimized cache management
const cleanCache = () => {
  if (trackingCache.size > MAX_CACHE_SIZE) {
    const now = Date.now();
    const entries = Array.from(trackingCache.entries());

    // Remove expired entries
    entries.forEach(([key, timestamp]) => {
      if (now - timestamp > TRACKING_COOLDOWN * 2) {
        trackingCache.delete(key);
      }
    });

    // If still too large, remove oldest entries
    if (trackingCache.size > MAX_CACHE_SIZE) {
      const sortedEntries = entries.sort((a, b) => a[1] - b[1]);
      const toRemove = sortedEntries.slice(
        0,
        trackingCache.size - MAX_CACHE_SIZE
      );
      toRemove.forEach(([key]) => trackingCache.delete(key));
    }
  }
};

// Debounced tracking with retry mechanism
const createTrackingFunction = (articleId: string, title: string) => {
  let retryCount = 0;
  const maxRetries = 3;

  return async (startTime: number): Promise<void> => {
    try {
      const response = await fetch("/api/track/view", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          articleId,
          title,
          referer: document.referrer,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
        }),
        // Performance optimizations
        keepalive: true,
        signal: AbortSignal.timeout(8000), // 8 second timeout
      });

      if (response.ok) {
        console.log(`✅ View tracked for article ${articleId}`);
        // Setup engagement tracking
        setupEngagementTracking(articleId, startTime);
      } else if (retryCount < maxRetries) {
        retryCount++;
        setTimeout(
          () => createTrackingFunction(articleId, title)(startTime),
          2000 * retryCount
        );
      }
    } catch (error) {
      console.warn(`❌ View tracking failed for article ${articleId}:`, error);
      if (retryCount < maxRetries) {
        retryCount++;
        setTimeout(
          () => createTrackingFunction(articleId, title)(startTime),
          2000 * retryCount
        );
      }
    }
  };
};

// Optimized engagement tracking
const setupEngagementTracking = (articleId: string, startTime: number) => {
  let engagementTracked = false;

  const trackEngagement = (reason: string) => {
    if (engagementTracked) return;

    const readingTime = Math.floor((Date.now() - startTime) / 1000);

    // Only track meaningful engagement (10+ seconds)
    if (readingTime >= 10) {
      engagementTracked = true;

      // Use sendBeacon for better performance on page unload
      const data = JSON.stringify({
        articleId,
        engagementType: "reading_time",
        value: readingTime,
        reason,
      });

      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/track/engagement", data);
      } else {
        // Fallback for older browsers
        fetch("/api/track/engagement", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: data,
          keepalive: true,
        }).catch(() => {}); // Silent fail
      }

      console.log(`📊 Engagement tracked: ${readingTime}s (${reason})`);
    }
  };

  // Optimized event listeners with passive options
  const handleVisibilityChange = () => {
    if (document.visibilityState === "hidden") {
      trackEngagement("visibility_hidden");
    }
  };

  const handleBeforeUnload = () => {
    trackEngagement("page_unload");
  };

  // Track after 30 seconds of viewing
  const engagementTimer = setTimeout(() => {
    trackEngagement("time_threshold");
  }, 30000);

  // Add event listeners with passive options for performance
  document.addEventListener("visibilitychange", handleVisibilityChange, {
    passive: true,
  });
  window.addEventListener("beforeunload", handleBeforeUnload, {
    passive: true,
  });

  // Return cleanup function
  return () => {
    clearTimeout(engagementTimer);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    window.removeEventListener("beforeunload", handleBeforeUnload);
  };
};

export function ViewTracker({ articleId, title }: ViewTrackerProps) {
  const hasTracked = useRef(false);
  const cleanupRef = useRef<(() => void) | null>(null);

  // Optimized tracking logic with useCallback
  const performTracking = useCallback(async () => {
    if (!articleId || hasTracked.current) return;

    const now = Date.now();
    const cacheKey = `${articleId}-${Math.floor(now / TRACKING_COOLDOWN)}`;

    // Check cache with timestamp validation
    const lastTracked = trackingCache.get(articleId);
    if (lastTracked && now - lastTracked < TRACKING_COOLDOWN) {
      console.log(`🔄 Skipping duplicate tracking for article ${articleId}`);
      return;
    }

    // Mark as tracked
    hasTracked.current = true;
    trackingCache.set(articleId, now);
    cleanCache();

    // Start tracking
    console.log(`🔄 Tracking view for article ${articleId}: ${title}`);
    const trackingFunction = createTrackingFunction(articleId, title);
    const startTime = Date.now();

    await trackingFunction(startTime);
  }, [articleId, title]);

  useEffect(() => {
    // Cleanup previous tracking
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }

    if (!articleId) {
      console.log(`⚠️ No article ID provided, skipping tracking`);
      return;
    }

    // Perform tracking with slight delay to ensure component is mounted
    const trackingTimer = setTimeout(performTracking, 1000);

    return () => {
      clearTimeout(trackingTimer);
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, [articleId, performTracking]);

  // This component doesn't render anything
  return null;
}
