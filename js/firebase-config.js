// js/firebase-config.js

// 1. মডিউল ইম্পোর্ট করা (নতুন সিস্টেমের জন্য)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// 2. তোমার কনফিগারেশন
const firebaseConfig = {
  apiKey: "AIzaSyBEhbEWRfuCh_wuXPiQdG8l5TW6L5Ssi1Y",
  authDomain: "study-with-keshab.firebaseapp.com",
  projectId: "study-with-keshab",
  storageBucket: "study-with-keshab.firebasestorage.app",
  messagingSenderId: "752692165545",
  appId: "1:752692165545:web:219ff482874717c3ab22b8",
  measurementId: "G-QH5ELRG2DE"
};

// 3. অ্যাপ ইনিশিয়ালাইজ করা
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// 4. পুরনো ফাইলের জন্য গ্লোবাল ভেরিয়েবল সেট করা (যাতে auth.js বা admin.js এরর না দেয়)
window.db = db;
window.auth = auth;
window.firebase = { auth: () => auth, firestore: () => db }; // Fake compatibility

// 5. নতুন মডিউলের জন্য এক্সপোর্ট করা
export { app, db, auth };