// firebase-messaging-sw.js

// Firebase SDK স্ক্রিপ্ট ইম্পোর্ট করা হচ্ছে
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js');

// আপনার প্রজেক্টের কনফিগারেশন (এখানে আপনার নতুন কী ব্যবহার করবেন)
const firebaseConfig = {
  apiKey: "এখানে আপনার নতুন জেনারেট করা API Key বসান",
  authDomain: "study-with-keshab.firebaseapp.com",
  projectId: "study-with-keshab",
  storageBucket: "study-with-keshab.appspot.com", // সাধারণত .appspot.com হয়
  messagingSenderId: "752692165545",
  appId: "1:752692165545:web:219ff482874717c3ab22b8"
};

// Firebase অ্যাপ শুরু করা
firebase.initializeApp(firebaseConfig);

// মেসেজিং সার্ভিস পাওয়া
const messaging = firebase.messaging();

// ব্যাকগ্রাউন্ডে নোটিফিকেশন হ্যান্ডেল করার জন্য
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/Study-With-Keshab/images/logo.jpg' // আপনার সাইটের লোগোর সঠিক পাথ
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});