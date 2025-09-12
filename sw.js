// ===============================
// Service Worker for Study with Keshab
// ===============================

// সংস্করণ নম্বর বদলালেই নতুন cache তৈরি হবে
const CACHE_NAME = "study-with-keshab-cache-v8";

// যেসব ফাইল আগেই ক্যাশে রাখা দরকার
const urlsToCache = [
  "./",
  "index.html",
  "about.html",
  "contact.html",
  "login.html",
  "signup.html",
  "notifications.html",
  "admin.html",
  // CSS Files
  "css/style.css",
  "css/notification.css",
  "css/cbt-styles.css",
  "css/login-style.css",
  "css/admin.css",
  // JS Files
  "js/script.js",
  "js/firebase-config.js",
  "js/notification.js",
  "js/notification-data.js",
  "auth.js",
  // Images / Icons
  "images/icons/icon-192x192.png",
  "images/icons/icon-512x512.png",
  "images/logo.jpg",
];

// ===============================
// Install Event → cache এ প্রি-লোড
// ===============================
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Cache opened, adding files...");
      return cache.addAll(urlsToCache);
    }).then(() => {
      return self.skipWaiting(); // সাথে সাথে activate
    })
  );
});

// ===============================
// Activate Event → পুরোনো cache ডিলিট
// ===============================
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

// ===============================
// Fetch Event → Network First, তারপর Cache
// ===============================
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Network response success হলে cache এ রেখে দেবে
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Network fail → cache থেকে serve করবে
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Navigation fallback
          if (event.request.mode === "navigate") {
            return caches.match("index.html");
          }
        });
      })
  );
});