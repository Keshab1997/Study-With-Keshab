// js/firebase-config.js

const firebaseConfig = {
  apiKey: "আপনার-API-KEY", // এখানে আপনার আসল কী থাকবে
  authDomain: "study-with-keshab.firebaseapp.com",
  projectId: "study-with-keshab",
  storageBucket: "study-with-keshab.firebasestorage.app",
  messagingSenderId: "752692165545",
  appId: "1:752692165545:web:219ff482874717c3ab22b8",
  measurementId: "G-QH5ELRG2DE"
};

// Firebase শুরু করা হচ্ছে
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
