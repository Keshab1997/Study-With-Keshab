// ===============================
// Service Worker for Study with Keshab
// ===============================

// সংস্করণ নম্বর বদলালেই নতুন cache তৈরি হবে
const CACHE_NAME = "study-with-keshab-cache-v35";

// যেসব ফাইল আগেই ক্যাশে রাখা দরকার
const urlsToCache = [
  "./",
  "index.html",
  "images/icons/icon-512x512.png"
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
      return self.skipWaiting();
    })
  );
  
  // নতুন আপডেট এসেছে notification পাঠানো
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'UPDATE_AVAILABLE',
        message: 'নতুন ফিচার: Chapter Page Full Screen, Dark Mode Improved, Profile Section!'
      });
    });
  });
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


// ===============================
// Push Notification Handlers
// ===============================
self.addEventListener('push', function(event) {
  console.log('Push received:', event);
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Study With Keshab';
  const options = {
    body: data.body || 'নতুন বিজ্ঞপ্তি এসেছে',
    icon: '/images/icons/icon-512x512.png',
    badge: '/images/icons/icon-192x192.png',
    vibrate: [200, 100, 200],
    data: { url: data.url || '/' },
    requireInteraction: false,
    tag: 'notification-' + Date.now()
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});


// ===============================
// Skip Waiting Handler
// ===============================
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
