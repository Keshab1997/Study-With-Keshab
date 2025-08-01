// auth.js

// Firebase এর মডিউলগুলো ইম্পোর্ট করা হচ্ছে
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

// !!! এখানে আপনার নিজের Firebase প্রজেক্টের কনফিগারেশন কোড বসান !!!
// যে কোডটি আগের ধাপে কপি করতে বলেছিলাম
// firebase-config.js এর ভেতরের কোড

// আপনার Firebase অ্যাপের কনফিগারেশন
const firebaseConfig = {
  apiKey: "AIzaSyBEhbEWRfuCh_wuXPiQdG8l5TW6L5Ssi1Y",
  authDomain: "study-with-keshab.firebaseapp.com",
  projectId: "study-with-keshab",
  storageBucket: "study-with-keshab.firebasestorage.app",
  messagingSenderId: "752692165545",
  appId: "1:752692165545:web:219ff482874717c3ab22b8",
  measurementId: "G-QH5ELRG2DE"
};

// Firebase শুরু করা হচ্ছে
firebase.initializeApp(firebaseConfig);
// Firebase অ্যাপটি চালু করা হচ্ছে
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // Authentication সার্ভিস চালু করা
const db = getFirestore(app); // Firestore ডেটাবেস চালু করা

// Google লগইন বাটনের জন্য অপেক্ষা করা হচ্ছে
const googleLoginBtn = document.getElementById('google-login-btn');

// বাটনে ক্লিক করলে যা হবে
googleLoginBtn.addEventListener('click', () => {
  const provider = new GoogleAuthProvider(); // Google দিয়ে লগইন করার প্রোভাইডার

  signInWithPopup(auth, provider)
    .then((result) => {
      // সফলভাবে লগইন হলে এই কোড চলবে
      const user = result.user;
      console.log("লগইন সফল হয়েছে:", user);

      // ইউজারের তথ্য Firestore এ সেভ করার জন্য
      // আমরা ইউজারের ইউনিক আইডি (uid) দিয়ে একটি ডকুমেন্ট তৈরি করব
      const userRef = doc(db, "users", user.uid);
      
      setDoc(userRef, {
        name: user.displayName,
        email: user.email,
        profilePic: user.photoURL,
        role: "user" // নতুন সব ইউজারকে 'user' রোল দেওয়া হলো
      }, { merge: true }) // merge: true দিলে যদি আগে থেকে তথ্য থাকে, তাহলে নতুন তথ্যের সাথে মিশে যাবে
      .then(() => {
        console.log("ইউজারের তথ্য Firestore এ সেভ হয়েছে।");
        // লগইন সফল হলে ইউজারকে হোম পেজে (index.html) পাঠিয়ে দেওয়া হবে
        window.location.href = 'index.html';
      })
      .catch((error) => {
        console.error("Firestore এ তথ্য সেভ করতে সমস্যা হয়েছে:", error);
      });

    }).catch((error) => {
      // লগইন করার সময় কোনো সমস্যা হলে এখানে আসবে
      console.error("Google সাইন-ইন এর সময় সমস্যা:", error);
      const errorCode = error.code;
      const errorMessage = error.message;
      alert(`লগইন ব্যর্থ হয়েছে: ${errorMessage}`);
    });
});
