// auth.js (সংস্করণ ৪.০ - FCM ইন্টিগ্রেশন সহ চূড়ান্ত)

document.addEventListener('DOMContentLoaded', function() {
    
    // ==========================================================
    // বিভাগ ১: ব্যবহারকারীর লগইন স্ট্যাটাস চেক করা
    // ==========================================================
    firebase.auth().onAuthStateChanged(function(user) {
        const desktopGuest = document.getElementById('guest-link-desktop');
        const desktopUser = document.getElementById('user-link-desktop');
        const desktopAdmin = document.getElementById('admin-link-desktop');
        const desktopLogout = document.getElementById('logout-link-desktop');
        const mobileGuest = document.getElementById('guest-link-mobile');
        const mobileUser = document.getElementById('user-link-mobile');
        const mobileAdmin = document.getElementById('admin-link-mobile');
        const mobileLogout = document.getElementById('logout-link-mobile');
        const userInfoCluster = document.getElementById('user-info-cluster');
        const userNameDisplay = document.getElementById('user-name-display');
        const heroTitle = document.getElementById('hero-main-title');
        const heroDescription = document.getElementById('hero-main-description');

        if (user) {
            // ========== ব্যবহারকারী লগইন করা থাকলে ==========
            if (desktopGuest) desktopGuest.style.display = 'none';
            if (desktopUser) desktopUser.style.display = 'block';
            if (desktopLogout) desktopLogout.style.display = 'block';
            if (mobileGuest) mobileGuest.style.display = 'none';
            if (mobileUser) mobileUser.style.display = 'block';
            if (mobileLogout) mobileLogout.style.display = 'block';
            if (userInfoCluster) userInfoCluster.style.display = 'flex';
            if (userNameDisplay) userNameDisplay.textContent = user.displayName || 'ব্যবহারকারী';
            if (heroTitle && heroDescription) {
                heroTitle.innerHTML = `স্বাগতম, <span class="highlight">${user.displayName || 'বন্ধু'}</span>!`;
                heroDescription.innerHTML = "আপনার শেখার পরবর্তী ধাপ কোনটি হবে? পছন্দের একটি বিষয় দিয়ে আজই আপনার যাত্রা শুরু করুন।";
            }
            
            const db = firebase.firestore();
            db.collection('users').doc(user.uid).get().then(doc => {
                const userData = doc.exists ? doc.data() : {}; 
                if (userData.role === 'admin') {
                    if (desktopAdmin) desktopAdmin.style.display = 'block';
                    if (mobileAdmin) mobileAdmin.style.display = 'block';
                } else {
                    if (desktopAdmin) desktopAdmin.style.display = 'none';
                    if (mobileAdmin) mobileAdmin.style.display = 'none';
                }
            });

            // *** নতুন সংযোজন: লগইন করা ব্যবহারকারীর জন্য FCM সেটআপ চালু করা ***
            setupFcm(user);

        } else {
            // ========== ব্যবহারকারী লগইন করা না থাকলে ==========
            if (desktopGuest) desktopGuest.style.display = 'block';
            if (desktopUser) desktopUser.style.display = 'none';
            if (desktopAdmin) desktopAdmin.style.display = 'none';
            if (desktopLogout) desktopLogout.style.display = 'none';
            if (mobileGuest) mobileGuest.style.display = 'block';
            if (mobileUser) mobileUser.style.display = 'none';
            if (mobileAdmin) mobileAdmin.style.display = 'none';
            if (mobileLogout) mobileLogout.style.display = 'none';
            if (userInfoCluster) userInfoCluster.style.display = 'none';
            if (userNameDisplay) userNameDisplay.textContent = '';
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
    // বিভাগ ২: শুধুমাত্র লগইন পেজের জন্য
    // ==========================================================
    const googleLoginBtn = document.getElementById('google-login-btn');
    if (googleLoginBtn) { 
        const ADMIN_EMAIL = "keshabsarkar2018@gmail.com"; 
        googleLoginBtn.addEventListener('click', () => {
            const auth = firebase.auth();
            const db = firebase.firestore();
            const provider = new firebase.auth.GoogleAuthProvider();
            auth.signInWithPopup(provider).then(result => {
                const user = result.user;
                const userRef = db.collection('users').doc(user.uid);
                return userRef.get().then(doc => {
                    const userData = {
                        uid: user.uid,
                        displayName: user.displayName,
                        email: user.email,
                        photoURL: user.photoURL,
                        lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
                    };
                    if (!doc.exists) {
                        userData.role = (user.email === ADMIN_EMAIL) ? 'admin' : 'user';
                    }
                    return userRef.set(userData, { merge: true });
                });
            }).then(() => {
                window.location.href = 'index.html'; 
            }).catch(error => {
                console.error("Google সাইন-ইন এর সময় সমস্যা:", error);
                alert("লগইন করার সময় একটি সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
            });
        });
    }

    // ==========================================================
    // বিভাগ ৩: লগআউট কার্যকারিতা
    // ==========================================================
    document.body.addEventListener('click', function(e) {
        if (e.target.id === 'logout-btn-desktop' || e.target.id === 'logout-btn-mobile' || e.target.closest('#logout-btn-desktop') || e.target.closest('#logout-btn-mobile')) {
            e.preventDefault();
            firebase.auth().signOut().then(() => {
                window.location.href = 'index.html';
            }).catch(error => console.error("লগআউট করার সময় সমস্যা:", error));
        }
    });

    // ==========================================================
    // বিভাগ ৪: Firebase Cloud Messaging (FCM) সেটআপ - নতুন যুক্ত করা হয়েছে
    // ==========================================================
    
    /**
     * নোটিফিকেশনের অনুমতি চায়, টোকেন নেয় এবং Firestore-এ সেভ করে
     * @param {firebase.User} user - বর্তমানে লগইন করা ব্যবহারকারী
     */
    function setupFcm(user) {
        if (firebase.messaging.isSupported()) {
            const messaging = firebase.messaging();
            
            messaging.requestPermission().then(() => {
                console.log('Notification permission granted.');
                return messaging.getToken();
            }).then(token => {
                if (token) {
                    console.log('FCM Token:', token);
                    // Firestore এ টোকেন সেভ করা
                    const userRef = firebase.firestore().collection('users').doc(user.uid);
                    userRef.update({ fcmToken: token });
                } else {
                    console.warn('No registration token available. Request permission to generate one.');
                }
            }).catch(err => {
                console.error('Unable to get permission to notify.', err);
            });
        } else {
            console.warn("This browser does not support Firebase Messaging.");
        }
    }

    /**
     * অ্যাপ ফোরগ্রাউন্ডে থাকলে নোটিফিকেশন হ্যান্ডেল করে
     */
    if (firebase.messaging.isSupported()) {
        const messaging = firebase.messaging();
        messaging.onMessage((payload) => {
            console.log('Foreground message received.', payload);
            
            const title = payload.data.title;
            const body = payload.data.body;
            
            // একটি কাস্টম পপ-আপ বা টোস্ট দেখানো
            showCustomToast(title, body);

            // নোটিফিকেশন বেলের কাউন্ট আপডেট করার জন্য
            if (typeof updateNotificationBadge === 'function') {
                updateNotificationBadge();
            }
        });
    }

});

/**
 * স্ক্রিনে একটি কাস্টম টোস্ট নোটিফিকেশন দেখায়
 * @param {string} title - নোটিফিকেশনের শিরোনাম
 * @param {string} body - নোটিফিকেশনের মূল বার্তা
 */
function showCustomToast(title, body) {
    const toast = document.createElement('div');
    toast.className = 'custom-toast'; // CSS দিয়ে স্টাইল করার জন্য একটি ক্লাস যোগ করা হলো
    toast.innerHTML = `
        <div class="toast-title">${title}</div>
        <div class="toast-body">${body}</div>
    `;
    
    document.body.appendChild(toast);

    // টোস্টটিকে দৃশ্যমান করা
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);

    // ৫ সেকেন্ড পর টোস্টটি সরিয়ে ফেলা
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 500);
    }, 5000);
}