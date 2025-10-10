/**
 * Service Worker for Bali Report
 *
 * Provides:
 * - Offline support for core pages
 * - Article caching for Save for Later
 * - Static asset caching
 * - Background sync for saved articles
 */

const CACHE_VERSION = "v1.0.0";
const STATIC_CACHE = `bali-report-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `bali-report-dynamic-${CACHE_VERSION}`;
const ARTICLE_CACHE = `bali-report-articles-${CACHE_VERSION}`;

// Static assets to cache immediately
const STATIC_ASSETS = [
  "/",
  "/manifest.json"
];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("[SW] Installing service worker...");

  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then(async (cache) => {
        console.log("[SW] Caching static assets");
        try {
          await cache.addAll(STATIC_ASSETS);
          console.log("[SW] Static assets cached successfully");
        } catch (err) {
          console.error("[SW] Failed to cache static assets:", err);
          // Try to cache assets individually to avoid failing entire cache
          for (const asset of STATIC_ASSETS) {
            try {
              await cache.add(asset);
              console.log(`[SW] Cached asset: ${asset}`);
            } catch (assetErr) {
              console.warn(`[SW] Failed to cache ${asset}:`, assetErr);
            }
          }
        }
      })
      .then(() => {
        return self.skipWaiting();
      }),
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating service worker...");

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (
              cacheName !== STATIC_CACHE &&
              cacheName !== DYNAMIC_CACHE &&
              cacheName !== ARTICLE_CACHE
            ) {
              console.log("[SW] Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          }),
        );
      })
      .then(() => {
        return self.clients.claim();
      }),
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // Skip external requests
  if (url.origin !== location.origin) {
    return;
  }

  // API routes - network first, cache fallback
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(networkFirst(request, DYNAMIC_CACHE));
    return;
  }

  // Static assets - cache first, network fallback
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".jpg") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".woff2")
  ) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // Pages - network first, cache fallback
  event.respondWith(networkFirst(request, DYNAMIC_CACHE));
});

// Cache first strategy
async function cacheFirst(request, cacheName) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      try {
        const cache = await caches.open(cacheName);
        await cache.put(request, networkResponse.clone());
      } catch (cacheError) {
        console.warn("[SW] Failed to cache response:", cacheError.message);
      }
    }
    return networkResponse;
  } catch (error) {
    console.error("[SW] Cache first failed:", error);
    return new Response("Offline", { status: 503 });
  }
}

// Network first strategy
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      try {
        const cache = await caches.open(cacheName);
        await cache.put(request, networkResponse.clone());
      } catch (cacheError) {
        console.warn("[SW] Failed to cache response:", cacheError.message);
      }
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline page for navigation requests
    if (request.mode === "navigate") {
      return new Response(
        `<!DOCTYPE html>
        <html>
          <head>
            <title>Offline - Bali Report</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body {
                font-family: system-ui, -apple-system, sans-serif;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                margin: 0;
                background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%);
                color: white;
              }
              .container {
                text-align: center;
                padding: 2rem;
              }
              h1 { font-size: 3rem; margin: 0; }
              p { font-size: 1.25rem; opacity: 0.9; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>🏝️ You're Offline</h1>
              <p>No internet connection. Check your saved articles or try again later.</p>
            </div>
          </body>
        </html>`,
        {
          headers: { "Content-Type": "text/html" },
          status: 503,
        },
      );
    }

    return new Response("Offline", { status: 503 });
  }
}

// Cache article for offline reading
async function cacheArticle(url, content) {
  try {
    const cache = await caches.open(ARTICLE_CACHE);
    const response = new Response(JSON.stringify(content), {
      headers: { "Content-Type": "application/json" },
    });
    await cache.put(url, response);
    console.log("[SW] Cached article:", url);
  } catch (error) {
    console.error("[SW] Failed to cache article:", error);
  }
}

// Background sync for offline actions
self.addEventListener("sync", (event) => {
  if (event.tag === "background-sync") {
    event.waitUntil(doBackgroundSync());
  }
  if (event.tag === "sync-saved-articles") {
    event.waitUntil(syncSavedArticles());
  }
});

async function doBackgroundSync() {
  console.log("[SW] Background sync triggered");
  // Sync any pending offline actions
  try {
    // Send any queued actions to the server
    const queuedActions = await getQueuedActions();
    for (const action of queuedActions) {
      await sendActionToServer(action);
    }
  } catch (error) {
    console.error("[SW] Background sync failed:", error);
  }
}

async function syncSavedArticles() {
  console.log("[SW] Syncing saved articles");
  // Implementation for syncing saved articles across devices
}

async function getQueuedActions() {
  // Get queued actions from IndexedDB or localStorage
  return [];
}

async function sendActionToServer(action) {
  // Send action to server
  console.log("[SW] Sending action:", action);
}

// Push notification handling
self.addEventListener("push", (event) => {
  console.log("[SW] Push message received");
  
  let notificationData = {
    title: "🏝️ Bali Report",
    body: "New articles available",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-72x72.png",
    tag: "bali-report-news",
    data: {
      url: "/",
      timestamp: Date.now(),
    },
  };

  if (event.data) {
    try {
      const pushData = event.data.json();
      notificationData = {
        ...notificationData,
        ...pushData,
      };
    } catch (error) {
      console.error("[SW] Error parsing push data:", error);
    }
  }

  const options = {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    tag: notificationData.tag,
    data: notificationData.data,
    requireInteraction: false,
    silent: false,
    actions: [
      {
        action: "open",
        title: "Read Now",
        icon: "/icons/icon-96x96.png",
      },
      {
        action: "save",
        title: "Save for Later",
        icon: "/icons/icon-96x96.png",
      },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
  );
});

// Notification click handling
self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification click received");
  
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || "/";
  
  if (event.action === "save") {
    // Handle save for later action
    event.waitUntil(
      self.registration.showNotification("🌺 Article Saved", {
        body: "Article saved for offline reading",
        icon: "/icons/icon-192x192.png",
        tag: "save-confirmation",
        requireInteraction: false,
      })
    );
    return;
  }
  
  // Open the app
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      // If a window is already open, focus it
      for (const client of clientList) {
        if (client.url === urlToOpen && "focus" in client) {
          return client.focus();
        }
      }
      
      // Otherwise, open a new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Notification close handling
self.addEventListener("notificationclose", (event) => {
  console.log("[SW] Notification closed:", event.notification.tag);
  // Track notification dismissal for analytics
});

// Message event - handle commands from the app
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "CACHE_ARTICLE") {
    const { url, content } = event.data;
    cacheArticle(url, content);
  }

  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === "SHOW_NOTIFICATION") {
    const { title, body, url, icon } = event.data;
    showNotification(title, body, url, icon);
  }
});

// Helper function to show notifications
async function showNotification(title, body, url = "/", icon = "/icons/icon-192x192.png") {
  const options = {
    body,
    icon,
    badge: "/icons/icon-72x72.png",
    tag: "bali-report-manual",
    data: { url },
    requireInteraction: false,
  };
  
  await self.registration.showNotification(title, options);
}

// Cache article content for offline reading
async function cacheArticle(url, content) {
  try {
    const cache = await caches.open(ARTICLE_CACHE);
    const response = new Response(JSON.stringify(content), {
      headers: { "Content-Type": "application/json" },
    });
    await cache.put(url, response);
    console.log("[SW] Cached article:", url);
  } catch (error) {
    console.error("[SW] Failed to cache article:", error);
  }
}

console.log("[SW] Service worker loaded");
