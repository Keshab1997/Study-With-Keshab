// সংস্করণ নম্বর আপডেট করা হয়েছে, যাতে ব্রাউজার নতুন করে ক্যাশে করে
const CACHE_NAME = "study-with-keshab-cache-v7";

// GitHub Pages-এর জন্য সব পাথ থেকে সামনের '/' সরিয়ে দেওয়া হয়েছে
const urlsToCache = [
  "./", // "/" এর পরিবর্তে "./" ব্যবহার করা হয়েছে, যা বর্তমান ডিরেক্টরি বোঝায়
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

// Install Event: নতুন Service Worker ইনস্টল হলে ফাইলগুলো ক্যাশে করবে
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Opened cache and caching files");
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        // পুরনো worker-এর জন্য অপেক্ষা না করে সাথে সাথে activate হবে
        return self.skipWaiting();
      }),
  );
});

// Activate Event: পুরনো ক্যাশে পরিষ্কার করবে
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!cacheWhitelist.includes(cacheName)) {
              console.log("Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          }),
        );
      })
      .then(() => {
        // নতুন service worker-কে সব client-এর নিয়ন্ত্রণ নিতে বলা হচ্ছে
        return self.clients.claim();
      }),
  );
});

// Fetch Event: নেটওয়ার্ক রিকোয়েস্ট নিয়ন্ত্রণ করবে
self.addEventListener("fetch", (event) => {
  // শুধুমাত্র GET রিকোয়েস্ট এবং একই ডোমেইনের রিকোয়েস্ট ক্যাশে করা হবে
  if (
    event.request.method !== "GET" ||
    !event.request.url.startsWith(self.location.origin)
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // যদি ক্যাশে পাওয়া যায়, তবে ক্যাশে থেকে দেওয়া হবে
      if (cachedResponse) {
        return cachedResponse;
      }

      // যদি ক্যাশে না পাওয়া যায়, তবে নেটওয়ার্ক থেকে আনা হবে
      return fetch(event.request)
        .then((networkResponse) => {
          // শুধুমাত্র সফল (status 200) রেসপন্স ক্যাশে করা হবে
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // ইন্টারনেট সংযোগ না থাকলে অফলাইন পেজ দেখানো হবে
          // শুধুমাত্র পেজ নেভিগেশনের জন্য এটি কাজ করবে
          if (event.request.mode === "navigate") {
            // অফলাইন ফলব্যাকের পাথও ঠিক করা হয়েছে
            return caches.match("index.html");
          }
        });
    }),
  );
});
