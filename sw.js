const CACHE_NAME = "study-with-keshab-cache-v3";
const urlsToCache = [
  "/Study-With-Keshab/",
  "/Study-With-Keshab/index.html",
  "/Study-With-Keshab/about.html",
  "/Study-With-Keshab/contact.html",
  "/Study-With-Keshab/login.html",
  "/Study-With-Keshab/signup.html",
  "/Study-With-Keshab/notifications.html",
  // CSS Files
  "/Study-With-Keshab/css/style.css",
  "/Study-With-Keshab/css/notification.css",
  // JS Files
  "/Study-With-Keshab/js/script.js",
  "/Study-With-Keshab/js/auth.js",
  // Images / Icons
  "/Study-With-Keshab/images/icons/icon-192x192.png",
  "/Study-With-Keshab/images/icons/icon-512x512.png"
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
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request).then((fetchResponse) => {
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, fetchResponse.clone());
          return fetchResponse;
        });
      }).catch(() => {
        // Offline fallback
        if (event.request.mode === "navigate") {
          return caches.match("/Study-With-Keshab/index.html");
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