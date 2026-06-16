// js/firebase-config.js

// === সঠিক ফায়ারবেস কনফিগারেশন ===
// এই সম্পূর্ণ কোডটি কপি করুন
const firebaseConfig = {
  apiKey: "AIzaSyCHueqLK-KCMZw0dQRm6dAHS-ttTuIBNyo",
  authDomain: "study-with-keshab-42f57.firebaseapp.com",
  projectId: "study-with-keshab-42f57",
  storageBucket: "study-with-keshab-42f57.firebasestorage.app",
  messagingSenderId: "794788745747",
  appId: "1:794788745747:web:8eccedb3591230fb3ae5e6",
  measurementId: "G-Q5082RNS6H"
};

// Firebase শুরু করা হচ্ছে (এই লাইনটি যেমন আছে তেমনই থাকবে)
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
