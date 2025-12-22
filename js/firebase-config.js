// js/firebase-config.js

// === সঠিক ফায়ারবেস কনফিগারেশন ===
// এই সম্পূর্ণ কোডটি কপি করুন
const firebaseConfig = {
  apiKey: "AIzaSyBEhbEWRfuCh_wuXPiQdG8l5TW6L5Ssi1Y",
  authDomain: "study-with-keshab.firebaseapp.com",
  projectId: "study-with-keshab",
  storageBucket: "study-with-keshab.firebasestorage.app",
  messagingSenderId: "752692165545",
  appId: "1:752692165545:web:219ff482874717c3ab22b8",
  measurementId: "G-QH5ELRG2DE"
};

// Firebase শুরু করা হচ্ছে (এই লাইনটি যেমন আছে তেমনই থাকবে)
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
