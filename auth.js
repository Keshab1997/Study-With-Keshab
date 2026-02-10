// auth.js - সংশোধিত (Firebase Messaging ছাড়া)

document.addEventListener('DOMContentLoaded', function() {
    
    // ==========================================================
    // বিভাগ ১: ব্যবহারকারীর লগইন স্ট্যাটাস এবং UI আপডেট
    // ==========================================================
    firebase.auth().onAuthStateChanged(function(user) {
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

        // সকল এলিমেন্টের অস্তিত্ব চেক করা (null error এড়ানোর জন্য)
        const allElementsExist = desktopGuest && desktopAdmin && desktopLogout && 
                                 mobileGuest && mobileAdmin && mobileLogout && 
                                 userInfoCluster && userNameDisplay;

        if (!allElementsExist) {
            console.warn("Auth script: Some UI elements for authentication are missing on this page.");
            // যদি কোনো একটি এলিমেন্ট না থাকে, তাহলে শুধু সেইগুলোই আপডেট করার চেষ্টা করা হবে যা আছে
        }

        if (user) {
            // ব্যবহারকারী লগইন করা থাকলে
            if (desktopGuest) desktopGuest.style.display = 'none';
            if (desktopLogout) desktopLogout.style.display = 'block';
            if (mobileGuest) mobileGuest.style.display = 'none';
            if (mobileLogout) mobileLogout.style.display = 'block';
            if (userInfoCluster) userInfoCluster.style.display = 'flex';
            if (userNameDisplay) userNameDisplay.textContent = user.displayName || 'ব্যবহারকারী';
            
            // Header profile picture update
            const headerProfilePic = document.getElementById('header-profile-pic');
            if (headerProfilePic) {
                headerProfilePic.src = user.photoURL || 'images/default-avatar.png';
            }
            
            // হিরো সেকশন আপডেট
            if (heroTitle && heroDescription) {
                heroTitle.innerHTML = `স্বাগতম, <span class="highlight">${user.displayName || 'বন্ধু'}</span>!`;
                heroDescription.innerHTML = "আপনার শেখার পরবর্তী ধাপ কোনটি হবে? পছন্দের একটি বিষয় দিয়ে আজই আপনার যাত্রা শুরু করুন।";
            }
            
            // ব্যবহারকারীর রোল (role) চেক করে অ্যাডমিন লিঙ্ক দেখানো
            const db = firebase.firestore();
            db.collection('users').doc(user.uid).get().then(doc => {
                if (doc.exists && doc.data().role === 'admin') {
                    if (desktopAdmin) desktopAdmin.style.display = 'block';
                    if (mobileAdmin) mobileAdmin.style.display = 'block';
                } else {
                    if (desktopAdmin) desktopAdmin.style.display = 'none';
                    if (mobileAdmin) mobileAdmin.style.display = 'none';
                }
            }).catch(error => {
                console.error("Error getting user role:", error);
                if (desktopAdmin) desktopAdmin.style.display = 'none';
                if (mobileAdmin) mobileAdmin.style.display = 'none';
            });

        } else {
            // ব্যবহারকারী লগ আউট থাকলে বা লগইন না করলে
            if (desktopGuest) desktopGuest.style.display = 'block';
            if (desktopAdmin) desktopAdmin.style.display = 'none';
            if (desktopLogout) desktopLogout.style.display = 'none';
            
            if (mobileGuest) mobileGuest.style.display = 'block';
            if (mobileAdmin) mobileAdmin.style.display = 'none';
            if (mobileLogout) mobileLogout.style.display = 'none';
            
            if (userInfoCluster) userInfoCluster.style.display = 'none';
            if (userNameDisplay) userNameDisplay.textContent = '';

            // হিরো সেকশন ডিফল্ট অবস্থায় ফিরিয়ে আনা
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
    // বিভাগ ২: Google দিয়ে লগইন (login.html পেজের জন্য)
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
                    
                    // যদি ব্যবহারকারী নতুন হয়, তাহলে তার রোল সেট করা
                    if (!doc.exists) {
                        userData.role = (user.email === ADMIN_EMAIL) ? 'admin' : 'user';
                    }
                    
                    return userRef.set(userData, { merge: true });
                });
            }).then(() => {
                window.location.href = 'index.html'; // লগইনের পর হোমপেজে রিডাইরেক্ট
            }).catch(error => {
                console.error("Google সাইন-ইন এর সময় সমস্যা:", error);
                alert("লগইন করার সময় একটি সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
            });
        });
    }

    // ==========================================================
    // বিভাগ ৩: লগআউট কার্যকারিতা
    // ==========================================================
    // ইভেন্ট ডেলিগেশন ব্যবহার করে লগআউট বাটন হ্যান্ডেল করা
    document.body.addEventListener('click', function(e) {
        if (e.target.id === 'logout-btn-desktop' || e.target.id === 'logout-btn-mobile' || e.target.closest('#logout-btn-desktop') || e.target.closest('#logout-btn-mobile')) {
            e.preventDefault();
            firebase.auth().signOut().then(() => {
                // onAuthStateChanged নিজে থেকেই UI আপডেট করবে, তবে দ্রুত পেজ রিফ্রেশের জন্য এটি রাখা যেতে পারে
                window.location.href = 'index.html';
            }).catch(error => console.error("লগআউট করার সময় সমস্যা:", error));
        }
    });
    
    // ================================================================
    // বিভাগ ৪ এবং ৫ (Firebase Messaging) সম্পূর্ণভাবে মুছে ফেলা হয়েছে
    // ================================================================
    // এই অংশে আগে setupFcm এবং onMessage এর কোড ছিল, যা এখন আর প্রয়োজন নেই।

});