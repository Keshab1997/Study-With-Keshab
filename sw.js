const CACHE_NAME = "study-with-keshab-cache-v2";
const urlsToCache = [
  "/",
  "index.html",
  "about.html",
  "contact.html",
  "login.html",
  "signup.html",
  "notifications.html",
  // CSS Files
  "css/style.css",
  "css/notification.css",
  // JS Files
  "js/script.js", // তোমার প্রধান JS ফাইলের নাম যদি ভিন্ন হয়, পরিবর্তন করে নিও
  "js/auth.js",
  // Images / Icons
  "images/icons/icon-192x192.png",
  "images/icons/icon-512x512.png",
];

// Install a service worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache");
      return cache.addAll(urlsToCache);
    }),
  );
});

// Cache and return requests
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Cache hit - return response
      if (response) {
        return response;
      }
      return fetch(event.request);
    }),
  );
});

// Update a service worker
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        }),
      );
    }),
  );
});
