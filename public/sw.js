const CACHE_NAME = "maghreb-orbit-v1";
const STATIC_CACHE = "maghreb-orbit-static-v1";
const DYNAMIC_CACHE = "maghreb-orbit-dynamic-v1";

// Cache static assets
const STATIC_ASSETS = [
  "/",
  "/offline",
  "/favicon.svg",
  "/manifest.json",
  // Add critical CSS and JS files
];

// Cache strategies
const CACHE_STRATEGIES = {
  // Cache first for static assets
  CACHE_FIRST: "cache-first",
  // Network first for dynamic content
  NETWORK_FIRST: "network-first",
  // Stale while revalidate for articles
  STALE_WHILE_REVALIDATE: "stale-while-revalidate",
};

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("Service Worker: Installing...");
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        console.log("Service Worker: Caching static assets");
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activating...");
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log("Service Worker: Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - implement caching strategies
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Skip Chrome extension requests
  if (url.protocol === "chrome-extension:") return;

  // Handle different types of requests
  if (url.pathname.startsWith("/api/")) {
    // API requests - network first with cache fallback
    event.respondWith(networkFirstStrategy(request));
  } else if (
    url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|webp|avif|svg|ico)$/)
  ) {
    // Static assets - cache first
    event.respondWith(cacheFirstStrategy(request));
  } else if (
    url.pathname.startsWith("/article/") ||
    url.pathname.startsWith("/category/")
  ) {
    // Articles and categories - stale while revalidate
    event.respondWith(staleWhileRevalidateStrategy(request));
  } else {
    // Other pages - network first
    event.respondWith(networkFirstStrategy(request));
  }
});

// Cache First Strategy
async function cacheFirstStrategy(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log("Cache first strategy failed:", error);
    return new Response("Offline content not available", { status: 503 });
  }
}

// Network First Strategy
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log("Network first strategy falling back to cache:", error);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline page for navigation requests
    if (request.mode === "navigate") {
      return caches.match("/offline");
    }

    return new Response("Content not available offline", { status: 503 });
  }
}

// Stale While Revalidate Strategy
async function staleWhileRevalidateStrategy(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);

  // Fetch in background to update cache
  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(() => cachedResponse);

  // Return cached version immediately if available
  return cachedResponse || fetchPromise;
}

// Background sync for analytics
self.addEventListener("sync", (event) => {
  if (event.tag === "analytics-sync") {
    event.waitUntil(syncAnalytics());
  }
});

async function syncAnalytics() {
  // Sync queued analytics data when online
  console.log("Service Worker: Syncing analytics data");
}

// Push notifications (future feature)
self.addEventListener("push", (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: "/favicon.svg",
      badge: "/favicon.svg",
      tag: "maghreb-orbit-news",
      requireInteraction: false,
      actions: [
        {
          action: "read",
          title: "Read Article",
        },
        {
          action: "close",
          title: "Close",
        },
      ],
    };

    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});
