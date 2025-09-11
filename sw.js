const CACHE_NAME = "study-with-keshab-cache-v5";
const urlsToCache = [
  "/",
  "/index.html",
  "/about.html",
  "/contact.html",
  "/login.html",
  "/signup.html",
  "/notifications.html",
  "/admin.html",
  // CSS Files
  "/css/style.css",
  "/css/notification.css",
  "/css/cbt-styles.css",
  "/css/login-style.css",
  "/css/admin.css",
  // JS Files
  "/js/script.js",
  "/js/firebase-config.js",
  "/js/notification.js",
  "/js/notification-data.js",
  "/auth.js",
  // Images / Icons
  "/images/icons/icon-192x192.png",
  "/images/icons/icon-512x512.png",
  "/images/logo.jpg"
];

// Install SW and cache files
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache");
      return cache.addAll(urlsToCache);
    })
  );
});

// Fetch - cache first, then network + update cache
self.addEventListener("fetch", (event) => {
  // Only cache GET requests from same origin
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return; // Let the request go through normally for non-GET or cross-origin requests
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request).then((fetchResponse) => {
        // Only cache successful responses
        if (fetchResponse.status === 200) {
          try {
            return caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, fetchResponse.clone());
              return fetchResponse;
            });
          } catch (error) {
            console.warn('Failed to cache response:', error);
            return fetchResponse;
          }
        }
        return fetchResponse;
      }).catch(() => {
        // Offline fallback
        if (event.request.mode === "navigate") {
          return caches.match("/index.html");
        }
      });
    })
  );
});

// Activate - clear old cache
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});