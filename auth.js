document.addEventListener('DOMContentLoaded', function() {
    
    firebase.auth().onAuthStateChanged(function(user) {
        const loginBtn = document.getElementById('login-btn');
        const mobileLogin = document.getElementById('mobile-login');
        const mobileAdmin = document.getElementById('mobile-admin');
        const desktopAdmin = document.getElementById('desktop-admin');
        const mobileLogout = document.getElementById('mobile-logout');
        const userInfo = document.getElementById('user-info');
        const headerProfilePic = document.getElementById('header-profile-pic');
        
        const heroTitle = document.getElementById('hero-main-title');
        const heroDescription = document.getElementById('hero-main-description');

        if (user) {
            if (loginBtn) loginBtn.style.display = 'none';
            if (mobileLogin) mobileLogin.style.display = 'none';
            if (mobileLogout) mobileLogout.style.display = 'block';
            if (userInfo) userInfo.style.display = 'flex';
            if (headerProfilePic) headerProfilePic.src = user.photoURL || 'images/default-avatar.png';
            
            if (heroTitle && heroDescription) {
                heroTitle.innerHTML = `স্বাগতম, <span class="highlight">${user.displayName || 'বন্ধু'}</span>!`;
                heroDescription.innerHTML = "আপনার শেখার পরবর্তী ধাপ কোনটি হবে? পছন্দের একটি বিষয় দিয়ে আজই আপনার যাত্রা শুরু করুন।";
            }
            
            const db = firebase.firestore();
            db.collection('users').doc(user.uid).get().then(doc => {
                if (doc.exists && doc.data().role === 'admin') {
                    if (mobileAdmin) mobileAdmin.style.display = 'block';
                    if (desktopAdmin) desktopAdmin.style.display = 'block';
                } else {
                    if (mobileAdmin) mobileAdmin.style.display = 'none';
                    if (desktopAdmin) desktopAdmin.style.display = 'none';
                }
            }).catch(error => {
                console.error("Error getting user role:", error);
                if (mobileAdmin) mobileAdmin.style.display = 'none';
                if (desktopAdmin) desktopAdmin.style.display = 'none';
            });

        } else {
            if (loginBtn) loginBtn.style.display = 'block';
            if (mobileLogin) mobileLogin.style.display = 'block';
            if (mobileAdmin) mobileAdmin.style.display = 'none';
            if (desktopAdmin) desktopAdmin.style.display = 'none';
            if (mobileLogout) mobileLogout.style.display = 'none';
            if (userInfo) userInfo.style.display = 'none';

            if (heroTitle && heroDescription) {
                heroTitle.innerHTML = "শিক্ষা হোক সহজ, প্রযুক্তিতে সমৃদ্ধ";
                heroDescription.innerHTML = `
                    📚 একই প্ল্যাটফর্মে পড়া, প্র্যাকটিস আর প্রস্তুতি<br />
                    ⏰ আপনার রুটিনে ফিট করে এমন পড়াশোনা<br />
                    🚀 পড়াশোনার গতি বাড়ায় ইন্টার্যাকটিভ কুইজ ও স্মার্ট নোট<br />
                    🌿 নিজের সময়, নিজের মতো করে শেখার পূর্ণ স্বাধীনতা`;
            }
        }
    });

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
                console.error("Google সাইন-ইন এর সময় সমস্যা:", error);
                alert("লগইন করার সময় একটি সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
            });
        });
    }

    document.body.addEventListener('click', function(e) {
        if (e.target.id === 'mobile-logout' || e.target.closest('#mobile-logout')) {
            e.preventDefault();
            firebase.auth().signOut().then(() => {
                window.location.href = 'index.html';
            }).catch(error => console.error("লগআউট করার সময় সমস্যা:", error));
        }
    });

});
