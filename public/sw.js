/**
 * Service Worker for Bali Report PWA
 * Handles offline caching, background sync, and push notifications
 */

const CACHE_NAME = 'bali-report-v1';
const STATIC_CACHE = 'bali-report-static-v1';
const DYNAMIC_CACHE = 'bali-report-dynamic-v1';
const ARTICLES_CACHE = 'bali-report-articles-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/brics',
  '/indonesia', 
  '/bali',
  '/search',
  '/offline',
  '/manifest.json',
  // Add critical CSS and JS files here
];

// Articles cache limit
const ARTICLES_CACHE_LIMIT = 50;

/**
 * Install event - cache static assets
 */
self.addEventListener('install', (event) => {
  console.log('🌺 Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('🏝️ Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('✅ Service Worker: Installation complete');
        return self.skipWaiting();
      })
  );
});

/**
 * Activate event - cleanup old caches
 */
self.addEventListener('activate', (event) => {
  console.log('🌊 Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        const deletePromises = cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && 
              cacheName !== DYNAMIC_CACHE && 
              cacheName !== ARTICLES_CACHE) {
            console.log('🧹 Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        });
        
        return Promise.all(deletePromises);
      })
      .then(() => {
        console.log('✅ Service Worker: Activation complete');
        return self.clients.claim();
      })
  );
});

/**
 * Fetch event - handle network requests
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-HTTP requests
  if (!request.url.startsWith('http')) {
    return;
  }

  // Handle different types of requests
  if (isNavigationRequest(request)) {
    event.respondWith(handleNavigationRequest(request));
  } else if (isArticleAPIRequest(url)) {
    event.respondWith(handleArticleRequest(request));
  } else if (isImageRequest(request)) {
    event.respondWith(handleImageRequest(request));
  } else {
    event.respondWith(handleGenericRequest(request));
  }
});

/**
 * Handle navigation requests (HTML pages)
 */
async function handleNavigationRequest(request) {
  try {
    // Try network first for navigation
    const networkResponse = await fetch(request);
    
    // Cache successful navigation responses
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('🌴 Serving from cache for navigation:', request.url);
    
    // Fallback to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback to offline page
    return caches.match('/offline');
  }
}

/**
 * Handle article API requests
 */
async function handleArticleRequest(request) {
  try {
    // Network first for fresh content
    const networkResponse = await fetch(request);
    
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(ARTICLES_CACHE);
      
      // Limit article cache size
      const cachedRequests = await cache.keys();
      if (cachedRequests.length >= ARTICLES_CACHE_LIMIT) {
        // Remove oldest cached article
        await cache.delete(cachedRequests[0]);
      }
      
      cache.put(request, networkResponse.clone());
      
      // Notify clients about new content
      notifyClientsAboutNewContent();
    }
    
    return networkResponse;
  } catch (error) {
    console.log('🌊 Serving article from cache:', request.url);
    
    // Fallback to cached articles
    return caches.match(request);
  }
}

/**
 * Handle image requests
 */
async function handleImageRequest(request) {
  try {
    // Try cache first for images
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fetch from network and cache
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('🦋 Image failed to load:', request.url);
    
    // Return a placeholder or fallback image
    return new Response(
      '<svg width="300" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#0d9488"/><text x="50%" y="50%" text-anchor="middle" fill="white" font-size="16">🌺 Image Offline</text></svg>',
      {
        headers: { 'Content-Type': 'image/svg+xml' }
      }
    );
  }
}

/**
 * Handle generic requests
 */
async function handleGenericRequest(request) {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fetch from network
    const networkResponse = await fetch(request);
    
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('⛩️ Request failed:', request.url);
    return new Response('Offline', { status: 503 });
  }
}

/**
 * Background sync for saved articles
 */
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync-saved-articles') {
    console.log('🔄 Background sync: Syncing saved articles');
    event.waitUntil(syncSavedArticles());
  }
});

/**
 * Push notification handler
 */
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body || 'New articles available from paradise sources!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    data: data.url || '/',
    actions: [
      {
        action: 'open',
        title: '🌺 Read Now',
        icon: '/icons/icon-96x96.png'
      },
      {
        action: 'save',
        title: '💾 Save for Later',
        icon: '/icons/icon-96x96.png'
      }
    ],
    tag: 'bali-report-news',
    renotify: true,
    requireInteraction: false,
    vibrate: [200, 100, 200],
  };

  event.waitUntil(
    self.registration.showNotification(
      data.title || '🏝️ Bali Report - New Content!',
      options
    )
  );
});

/**
 * Notification click handler
 */
self.addEventListener('notificationclick', (event) => {
  const { action, data } = event;
  
  event.notification.close();

  if (action === 'open') {
    event.waitUntil(
      clients.openWindow(event.notification.data || '/')
    );
  } else if (action === 'save') {
    event.waitUntil(saveArticleForLater(event.notification.data));
  } else {
    // Default action - open app
    event.waitUntil(
      clients.openWindow(event.notification.data || '/')
    );
  }
});

/**
 * Message handler for client communication
 */
self.addEventListener('message', (event) => {
  const { type, payload } = event.data;

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'GET_CACHE_STATUS':
      getCacheStatus().then(status => {
        event.ports[0].postMessage(status);
      });
      break;
      
    case 'SAVE_ARTICLE':
      saveArticleToCache(payload).then(() => {
        event.ports[0].postMessage({ success: true });
      });
      break;
      
    case 'SYNC_SAVED_ARTICLES':
      syncSavedArticles().then(() => {
        event.ports[0].postMessage({ success: true });
      }).catch((error) => {
        event.ports[0].postMessage({ success: false, error: error.message });
      });
      break;
      
    case 'PRELOAD_SAVED_ARTICLES':
      preloadSavedArticles(payload).then(() => {
        event.ports[0].postMessage({ success: true });
      });
      break;
      
    case 'CLEAR_CACHE':
      clearCache().then(() => {
        event.ports[0].postMessage({ success: true });
      });
      break;
  }
});

// Helper functions

function isNavigationRequest(request) {
  return request.mode === 'navigate' || 
         (request.method === 'GET' && 
          request.headers.get('accept').includes('text/html'));
}

function isArticleAPIRequest(url) {
  return url.pathname.includes('/api/') && 
         (url.pathname.includes('articles') || url.pathname.includes('rss'));
}

function isImageRequest(request) {
  return request.destination === 'image' ||
         request.url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i);
}

async function notifyClientsAboutNewContent() {
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage({
      type: 'NEW_CONTENT_AVAILABLE',
      timestamp: Date.now()
    });
  });
}

async function syncSavedArticles() {
  try {
    // Get saved articles from IndexedDB
    const savedArticles = await getSavedArticlesFromDB();
    
    // Sync with server if needed
    // Implementation depends on your backend
    console.log('🔄 Synced', savedArticles.length, 'saved articles');
    
    return Promise.resolve();
  } catch (error) {
    console.error('❌ Background sync failed:', error);
    return Promise.reject(error);
  }
}

async function saveArticleForLater(articleUrl) {
  try {
    // Get article data from cache or fetch
    const articleResponse = await caches.match(articleUrl);
    if (articleResponse) {
      const article = await articleResponse.json();
      
      // Save to Save for Later system via localStorage (accessible from main thread)
      const savedArticles = JSON.parse(localStorage.getItem('bali-report-saved-articles') || '{}');
      const articleData = {
        ...article,
        savedAt: new Date().toISOString(),
        readStatus: 'unread',
        readingProgress: 0,
        tags: [],
        notes: '',
        estimatedReadTime: Math.max(1, Math.round(article.description?.split(/\s+/).length / 200) || 1),
        priority: 'normal'
      };
      
      if (!savedArticles.articles) {
        savedArticles.articles = [];
        savedArticles.version = '1.0';
        savedArticles.lastUpdated = new Date().toISOString();
      }
      
      savedArticles.articles.unshift(articleData);
      localStorage.setItem('bali-report-saved-articles', JSON.stringify(savedArticles));
      
      console.log('💾 Saved article for later:', article.title);
      
      // Notify client about successful save
      const clients = await self.clients.matchAll();
      clients.forEach(client => {
        client.postMessage({
          type: 'ARTICLE_SAVED_FOR_LATER',
          article: articleData
        });
      });
    }
  } catch (error) {
    console.error('❌ Failed to save article for later:', error);
  }
}

async function saveArticleToCache(article) {
  const cache = await caches.open(ARTICLES_CACHE);
  const response = new Response(JSON.stringify(article), {
    headers: { 'Content-Type': 'application/json' }
  });
  
  return cache.put(`/cached-article/${article.id}`, response);
}

async function getCacheStatus() {
  const caches_list = await caches.keys();
  const cache_sizes = await Promise.all(
    caches_list.map(async (name) => {
      const cache = await caches.open(name);
      const keys = await cache.keys();
      return { name, size: keys.length };
    })
  );
  
  return {
    caches: cache_sizes,
    total: cache_sizes.reduce((sum, cache) => sum + cache.size, 0)
  };
}

async function clearCache() {
  const caches_list = await caches.keys();
  return Promise.all(
    caches_list.map(cache_name => {
      if (cache_name !== STATIC_CACHE) {
        return caches.delete(cache_name);
      }
    })
  );
}

async function getSavedArticlesFromDB() {
  try {
    // Get saved articles from localStorage (main thread storage)
    const savedData = localStorage.getItem('bali-report-saved-articles');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      return parsed.articles || [];
    }
    return [];
  } catch (error) {
    console.error('❌ Failed to get saved articles:', error);
    return [];
  }
}

async function preloadSavedArticles(articles) {
  try {
    const cache = await caches.open(ARTICLES_CACHE);
    const preloadPromises = articles.map(async (article) => {
      try {
        // Create a cache entry for the article content
        const response = new Response(JSON.stringify(article), {
          headers: { 
            'Content-Type': 'application/json',
            'Cache-Control': 'max-age=86400' // 24 hours
          }
        });
        
        await cache.put(`/saved-article/${article.id}`, response);
        
        // Also try to cache the original article URL if available
        if (article.link) {
          try {
            const originalResponse = await fetch(article.link);
            if (originalResponse.ok) {
              await cache.put(article.link, originalResponse);
            }
          } catch (linkError) {
            // Ignore errors when preloading original links
            console.warn('⚠️ Could not preload original article:', article.link);
          }
        }
      } catch (articleError) {
        console.warn('⚠️ Failed to preload article:', article.title, articleError);
      }
    });
    
    await Promise.allSettled(preloadPromises);
    console.log('📦 Preloaded', articles.length, 'saved articles for offline access');
    
  } catch (error) {
    console.error('❌ Failed to preload saved articles:', error);
    throw error;
  }
}

console.log('🌺 Bali Report Service Worker loaded successfully!');