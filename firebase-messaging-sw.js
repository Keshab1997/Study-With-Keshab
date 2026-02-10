importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js');

const firebaseConfig = {
  apiKey: "AIzaSyBEhbEWRfuCh_wuXPiQdG8l5TW6L5Ssi1Y",
  authDomain: "study-with-keshab.firebaseapp.com",
  projectId: "study-with-keshab",
  storageBucket: "study-with-keshab.appspot.com",
  messagingSenderId: "752692165545",
  appId: "1:752692165545:web:219ff482874717c3ab22b8",
  measurementId: "G-QH5ELRG2DE"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/images/logo.jpg',
    badge: '/images/logo.jpg',
    data: {
        url: payload.notification.click_action || '/'
    }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(clients.openWindow(event.notification.data.url));
});
