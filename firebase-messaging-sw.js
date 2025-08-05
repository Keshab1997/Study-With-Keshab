// firebase-messaging-sw.js (সংশোধিত কোড)

importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js');

// এখানে আপনার আসল Firebase কনফিগারেশন কী ব্যবহার করুন
const firebaseConfig = {
  apiKey: "YOUR_API_KEY", // এই লাইনটি অবশ্যই আপনার কী দিয়ে পরিবর্তন করবেন
  authDomain: "study-with-keshab.firebaseapp.com",
  projectId: "study-with-keshab",
  storageBucket: "study-with-keshab.appspot.com",
  messagingSenderId: "752692165545",
  appId: "1:752692165545:web:219ff482874717c3ab22b8"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  // payload.notification এর পরিবর্তে payload.data থেকে তথ্য নিন
  const notificationTitle = payload.data.title;
  const notificationOptions = {
    body: payload.data.body,
    icon: payload.data.icon,
    // নোটিফিকেশনে ক্লিক করলে কোন পেজ খুলবে তা এখানে সেট করুন
    data: {
        url: payload.data.link
    }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// নোটিফিকেশনে ক্লিক ইভেন্ট হ্যান্ডেল করার জন্য
self.addEventListener('notificationclick', (event) => {
    event.notification.close(); // নোটিফিকেশনটি বন্ধ করুন
    const urlToOpen = event.notification.data.url;
    event.waitUntil(clients.openWindow(urlToOpen));
});