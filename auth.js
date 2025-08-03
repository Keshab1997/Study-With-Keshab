// auth.js (সংস্করণ ৩.০ - চূড়ান্ত সমাধান সহ)

document.addEventListener('DOMContentLoaded', function() {
    
    // ==========================================================
    // বিভাগ ১: ব্যবহারকারীর লগইন স্ট্যাটাস সবসময় চেক করা
    // ==========================================================
    firebase.auth().onAuthStateChanged(function(user) {
        
        // সব পেজের জন্য সাধারণ এলিমেন্টগুলো
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

        // শুধুমাত্র হোম পেজের (index.html) জন্য নির্দিষ্ট এলিমেন্ট
        const heroTitle = document.getElementById('hero-main-title');
        const heroDescription = document.getElementById('hero-main-description');

        if (user) {
            // ========== ব্যবহারকারী লগইন করা থাকলে ==========
            
            // মেনু লিংক আপডেট
            if (desktopGuest) desktopGuest.style.display = 'none';
            if (desktopUser) desktopUser.style.display = 'block';
            if (desktopLogout) desktopLogout.style.display = 'block';
            if (mobileGuest) mobileGuest.style.display = 'none';
            if (mobileUser) mobileUser.style.display = 'block';
            if (mobileLogout) mobileLogout.style.display = 'block';
            
            if (userInfoCluster) {
                userInfoCluster.style.display = 'flex';
            }
            if (userNameDisplay) {
                userNameDisplay.textContent = user.displayName || 'ব্যবহারকারী';
            }

            if (heroTitle && heroDescription) {
                heroTitle.innerHTML = `স্বাগতম, <span class="highlight">${user.displayName || 'বন্ধু'}</span>!`;
                heroDescription.innerHTML = "আপনার শেখার পরবর্তী ধাপ কোনটি হবে? পছন্দের একটি বিষয় দিয়ে আজই আপনার যাত্রা শুরু করুন।";
            }
            
            // অ্যাডমিন প্যানেল চেক
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
            }).catch(error => {
                console.error("Error getting user role:", error);
            });

        } else {
            // ========== ব্যবহারকারী লগইন করা না থাকলে ==========
            
            // মেনু লিংক রিসেট
            if (desktopGuest) desktopGuest.style.display = 'block';
            if (desktopUser) desktopUser.style.display = 'none';
            if (desktopAdmin) desktopAdmin.style.display = 'none';
            if (desktopLogout) desktopLogout.style.display = 'none';
            if (mobileGuest) mobileGuest.style.display = 'block';
            if (mobileUser) mobileUser.style.display = 'none';
            if (mobileAdmin) mobileAdmin.style.display = 'none';
            if (mobileLogout) mobileLogout.style.display = 'none';

            if (userInfoCluster) {
                userInfoCluster.style.display = 'none';
            }
            if (userNameDisplay) {
                 userNameDisplay.textContent = '';
            }
            
            if (heroTitle && heroDescription) {
                const defaultTitle = "শিক্ষা হোক সহজ, প্রযুক্তিতে সমৃদ্ধ";
                const defaultDescription = `
                    📚 একই প্ল্যাটফর্মে পড়া, প্র্যাকটিস আর প্রস্তুতি<br />
                    ⏰ আপনার রুটিনে ফিট করে এমন পড়াশোনা<br />
                    🚀 পড়াশোনার গতি বাড়ায় ইন্টার‍্যাকটিভ কুইজ ও স্মার্ট নোট<br />
                    🌿 নিজের সময়, নিজের মতো করে শেখার পূর্ণ স্বাধীনতা`;
                heroTitle.innerHTML = defaultTitle;
                heroDescription.innerHTML = defaultDescription;
            }
        }
    });


    // ==========================================================
    // বিভাগ ২: শুধুমাত্র লগইন পেজের (`login.html`) জন্য
    // ==========================================================
    const googleLoginBtn = document.getElementById('google-login-btn');
    if (googleLoginBtn) { 
        
        const ADMIN_EMAIL = "keshabsarkar2018@gmail.com"; 
        
        googleLoginBtn.addEventListener('click', () => {
            const auth = firebase.auth();
            const db = firebase.firestore();
            const provider = new firebase.auth.GoogleAuthProvider();

            auth.signInWithPopup(provider)
                .then(result => {
                    const user = result.user;
                    const userRef = db.collection('users').doc(user.uid);

                    return userRef.get().then(doc => {
                        const userData = {
                            uid: user.uid,
                            displayName: user.displayName,
                            email: user.email,
                            photoURL: user.photoURL, // *** সমাধান: এখানে 'profilePic' এর পরিবর্তে 'photoURL' ব্যবহার করা হয়েছে ***
                            lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
                        };

                        if (!doc.exists) {
                            // নতুন ব্যবহারকারীর জন্য ডিফল্ট ভূমিকা সেট করা হচ্ছে
                            userData.role = (user.email === ADMIN_EMAIL) ? 'admin' : 'user';
                        }
                        
                        // merge: true ব্যবহার করে ডেটা সেভ করা হচ্ছে
                        return userRef.set(userData, { merge: true });
                    });
                })
                .then(() => {
                    console.log("ইউজারের তথ্য Firestore এ সফলভাবে আপডেট হয়েছে।");
                    window.location.href = 'index.html'; 
                })
                .catch(error => {
                    console.error("Google সাইন-ইন এর সময় সমস্যা:", error);
                    // ব্যবহারকারীকে একটি বোধগম্য বার্তা দেখানো হচ্ছে
                    alert("লগইন করার সময় একটি সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
                });
        });
    }


    // ==========================================================
    // বিভাগ ৩: লগআউট কার্যকারিতা (সব পেজের জন্য)
    // ==========================================================
    // এই কোডটি আগের মতোই আছে, কারণ এটি সঠিকভাবে কাজ করছিল
    document.body.addEventListener('click', function(e) {
        if (e.target.id === 'logout-btn-desktop' || e.target.id === 'logout-btn-mobile' || e.target.closest('#logout-btn-desktop') || e.target.closest('#logout-btn-mobile')) {
            e.preventDefault();
            firebase.auth().signOut()
                .then(() => {
                    console.log("সফলভাবে লগআউট করা হয়েছে।");
                    window.location.href = 'index.html'; // লগআউট করার পর হোম পেজে রিডাইরেক্ট করা
                })
                .catch(error => {
                    console.error("লগআউট করার সময় সমস্যা:", error);
                });
        }
    });

});