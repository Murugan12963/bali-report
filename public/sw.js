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
  "/brics",
  "/indonesia",
  "/bali",
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("[SW] Installing service worker...");

  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        console.log("[SW] Caching static assets");
        return cache.addAll(STATIC_ASSETS).catch((err) => {
          console.error("[SW] Failed to cache static assets:", err);
        });
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
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
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
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
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

// Message event - handle commands from the app
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "CACHE_ARTICLE") {
    const { url, content } = event.data;
    cacheArticle(url, content);
  }

  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

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
