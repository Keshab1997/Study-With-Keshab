// auth.js - (Updated for Modular SDK)
// আপনার পুরনো লজিক ঠিক রেখে নতুন ভার্সনে আপডেট করা হয়েছে

import { auth, db } from './js/firebase-config.js';
import { 
    onAuthStateChanged, 
    signOut, 
    GoogleAuthProvider, 
    signInWithPopup 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
    doc, 
    getDoc, 
    setDoc, 
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', function() {
    
    // ==========================================================
    // বিভাগ ১: ব্যবহারকারীর লগইন স্ট্যাটাস এবং UI আপডেট
    // ==========================================================
    onAuthStateChanged(auth, async (user) => {
        // DOM এলিমেন্টগুলো সিলেক্ট করা
        const desktopGuest = document.getElementById('guest-link-desktop');
        const desktopAdmin = document.getElementById('admin-link-desktop');
        const desktopLogout = document.getElementById('logout-link-desktop');
        
        const mobileGuest = document.getElementById('guest-link-mobile');
        const mobileAdmin = document.getElementById('admin-link-mobile');
        const mobileLogout = document.getElementById('logout-link-mobile');
        
        const userInfoCluster = document.getElementById('user-info-cluster');
        const userNameDisplay = document.getElementById('user-name-display');
        
        const heroTitle = document.getElementById('hero-main-title');
        const heroDescription = document.getElementById('hero-main-description');

        if (user) {
            console.log("User is logged in:", user.displayName);

            // 1. সাধারণ বাটন টগল
            if (desktopGuest) desktopGuest.style.display = 'none';
            if (desktopLogout) desktopLogout.style.display = 'block';
            if (mobileGuest) mobileGuest.style.display = 'none';
            if (mobileLogout) mobileLogout.style.display = 'block';
            
            // 2. ইউজার ইনফো দেখানো
            if (userInfoCluster) userInfoCluster.style.display = 'flex';
            if (userNameDisplay) userNameDisplay.textContent = user.displayName || 'ব্যবহারকারী';
            
            // 3. হিরো সেকশন আপডেট (আপনার পুরনো কোড অনুযায়ী)
            if (heroTitle && heroDescription) {
                heroTitle.innerHTML = `স্বাগতম, <span class="highlight">${user.displayName || 'বন্ধু'}</span>!`;
                heroDescription.innerHTML = "আপনার শেখার পরবর্তী ধাপ কোনটি হবে? পছন্দের একটি বিষয় দিয়ে আজই আপনার যাত্রা শুরু করুন।";
            }
            
            // 4. অ্যাডমিন রোল চেক (মডার্ন সিনট্যাক্স)
            try {
                const userDocRef = doc(db, 'users', user.uid);
                const docSnap = await getDoc(userDocRef);

                if (docSnap.exists() && docSnap.data().role === 'admin') {
                    console.log("Admin privileges confirmed.");
                    if (desktopAdmin) desktopAdmin.style.display = 'block';
                    if (mobileAdmin) mobileAdmin.style.display = 'block';
                } else {
                    if (desktopAdmin) desktopAdmin.style.display = 'none';
                    if (mobileAdmin) mobileAdmin.style.display = 'none';
                }
            } catch (error) {
                console.error("Error checking admin role:", error);
            }

        } else {
            // ব্যবহারকারী লগ আউট অবস্থায়
            console.log("User is signed out.");

            if (desktopGuest) desktopGuest.style.display = 'block';
            if (desktopAdmin) desktopAdmin.style.display = 'none';
            if (desktopLogout) desktopLogout.style.display = 'none';
            
            if (mobileGuest) mobileGuest.style.display = 'block';
            if (mobileAdmin) mobileAdmin.style.display = 'none';
            if (mobileLogout) mobileLogout.style.display = 'none';
            
            if (userInfoCluster) userInfoCluster.style.display = 'none';
            if (userNameDisplay) userNameDisplay.textContent = '';

            // হিরো সেকশন ডিফল্ট অবস্থায় ফিরিয়ে আনা
            if (heroTitle && heroDescription) {
                heroTitle.innerHTML = "শিক্ষা হোক সহজ, প্রযুক্তিতে সমৃদ্ধ";
                heroDescription.innerHTML = `
                    📚 একই প্ল্যাটফর্মে পড়া, প্র্যাকটিস আর প্রস্তুতি<br />
                    ⏰ আপনার রুটিনে ফিট করে এমন পড়াশোনা<br />
                    🚀 পড়াশোনার গতি বাড়ায় ইন্টার‍্যাকটিভ কুইজ ও স্মার্ট নোট<br />
                    🌿 নিজের সময়, নিজের মতো করে শেখার পূর্ণ স্বাধীনতা`;
            }
        }
    });

    // ==========================================================
    // বিভাগ ২: Google দিয়ে লগইন (login.html পেজের জন্য)
    // ==========================================================
    const googleLoginBtn = document.getElementById('google-login-btn');
    if (googleLoginBtn) { 
        const ADMIN_EMAIL = "keshabsarkar2018@gmail.com"; 
        
        googleLoginBtn.addEventListener('click', () => {
            const provider = new GoogleAuthProvider();
            
            signInWithPopup(auth, provider).then(async (result) => {
                const user = result.user;
                const userRef = doc(db, 'users', user.uid);
                
                // ইউজার ডাটা চেক এবং সেভ করা
                const docSnap = await getDoc(userRef);
                
                const userData = {
                    uid: user.uid,
                    displayName: user.displayName,
                    email: user.email,
                    photoURL: user.photoURL,
                    lastLogin: serverTimestamp(),
                };
                
                // নতুন ইউজার হলে রোল সেট করা
                if (!docSnap.exists()) {
                    userData.role = (user.email === ADMIN_EMAIL) ? 'admin' : 'user';
                }
                
                await setDoc(userRef, userData, { merge: true });
                
                // সফল হলে রিডাইরেক্ট
                window.location.href = 'index.html';

            }).catch(error => {
                console.error("Google Login Error:", error);
                alert("লগইন করার সময় সমস্যা হয়েছে: " + error.message);
            });
        });
    }

    // ==========================================================
    // বিভাগ ৩: লগআউট কার্যকারিতা
    // ==========================================================
    const handleLogout = (e) => {
        e.preventDefault();
        signOut(auth).then(() => {
            // লগআউট সফল
            window.location.href = 'index.html';
        }).catch((error) => {
            console.error("Logout Error:", error);
        });
    };

    // ডেস্কটপ এবং মোবাইল লগআউট বাটনে ইভেন্ট লিসেনার
    const logoutBtnDesktop = document.getElementById('logout-btn-desktop');
    const logoutBtnMobile = document.getElementById('logout-btn-mobile');

    if (logoutBtnDesktop) logoutBtnDesktop.addEventListener('click', handleLogout);
    if (logoutBtnMobile) logoutBtnMobile.addEventListener('click', handleLogout);

});