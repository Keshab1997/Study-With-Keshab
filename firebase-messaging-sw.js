importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js');

const firebaseConfig = {
  apiKey: "AIzaSyCHueqLK-KCMZw0dQRm6dAHS-ttTuIBNyo",
  authDomain: "study-with-keshab-42f57.firebaseapp.com",
  projectId: "study-with-keshab-42f57",
  storageBucket: "study-with-keshab-42f57.firebasestorage.app",
  messagingSenderId: "794788745747",
  appId: "1:794788745747:web:8eccedb3591230fb3ae5e6",
  measurementId: "G-Q5082RNS6H"
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
