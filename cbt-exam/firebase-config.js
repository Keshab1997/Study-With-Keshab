// আপনার দেওয়া Firebase কনফিগারেশন
const firebaseConfig = {
  apiKey: "AIzaSyBEhbEWRfuCh_wuXPiQdG8l5TW6L5Ssi1Y",
  authDomain: "study-with-keshab.firebaseapp.com",
  projectId: "study-with-keshab",
  storageBucket: "study-with-keshab.appspot.com",
  messagingSenderId: "752692165545",
  appId: "1:752692165545:web:219ff482874717c3ab22b8",
  measurementId: "G-QH5ELRG2DE"
};

// Firebase ইনিশিয়ালাইজ করা হচ্ছে
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();