document.addEventListener('DOMContentLoaded', function() {
    
    // Email/Password Login
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            const email = document.getElementById('email-input').value.trim();
            const password = document.getElementById('password-input').value;
            const errorMessage = document.getElementById('error-message');
            
            if (!email || !password) {
                errorMessage.textContent = 'দয়া করে ইমেল এবং পাসওয়ার্ড দিন।';
                return;
            }
            
            errorMessage.textContent = '';
            loginBtn.classList.add('loading');
            
            firebase.auth().signInWithEmailAndPassword(email, password)
                .then((result) => {
                    const user = result.user;
                    const db = firebase.firestore();
                    return db.collection('users').doc(user.uid).set({
                        lastLogin: firebase.firestore.FieldValue.serverTimestamp()
                    }, { merge: true });
                })
                .then(() => {
                    if(window.showToast) showToast('সফলভাবে লগইন হয়েছে!', 'success');
                    setTimeout(() => window.location.href = 'index.html', 500);
                })
                .catch((error) => {
                    if (error.code === 'auth/user-not-found') {
                        errorMessage.textContent = 'এই ইমেল দিয়ে কোনো অ্যাকাউন্ট নেই।';
                    } else if (error.code === 'auth/wrong-password') {
                        errorMessage.textContent = 'ভুল পাসওয়ার্ড।';
                    } else if (error.code === 'auth/invalid-email') {
                        errorMessage.textContent = 'সঠিক ইমেল দিন।';
                    } else {
                        errorMessage.textContent = 'লগইন করতে সমস্যা হয়েছে।';
                    }
                })
                .finally(() => {
                    loginBtn.classList.remove('loading');
                });
        });
    }
    
    firebase.auth().onAuthStateChanged(function(user) {
        const loginBtn = document.getElementById('login-btn');
        const mobileLogin = document.getElementById('mobile-login');
        const mobileProfile = document.getElementById('mobile-profile');
        const desktopProfile = document.getElementById('desktop-profile');
        const mobileAdmin = document.getElementById('mobile-admin');
        const desktopAdmin = document.getElementById('desktop-admin');
        const mobileLogout = document.getElementById('mobile-logout');
        const userInfo = document.getElementById('user-info');
        const headerProfilePic = document.getElementById('header-profile-pic');
        
        const heroTitle = document.getElementById('hero-main-title');
        const heroDescription = document.getElementById('hero-main-description');
        
        // Mobile Navigation Profile Elements
        const navUserHeader = document.getElementById('nav-user-header');
        const navUserName = document.getElementById('nav-user-name');
        const navProfileImg = document.getElementById('nav-profile-img');

        if (user) {
            if (loginBtn) loginBtn.style.display = 'none';
            if (mobileLogin) mobileLogin.style.display = 'none';
            if (mobileProfile) mobileProfile.style.display = 'block';
            if (desktopProfile) desktopProfile.style.display = 'block';
            if (mobileLogout) mobileLogout.style.display = 'block';
            if (userInfo) userInfo.style.display = 'flex';
            if (headerProfilePic) headerProfilePic.src = user.photoURL || 'images/default-avatar.png';
            
            // Update Mobile Nav Profile
            if (navUserHeader) navUserHeader.style.display = 'block';
            if (navUserName) navUserName.textContent = user.displayName || 'User';
            if (navProfileImg) navProfileImg.src = user.photoURL || 'images/default-avatar.png';
            
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
            if (mobileProfile) mobileProfile.style.display = 'none';
            if (desktopProfile) desktopProfile.style.display = 'none';
            if (mobileAdmin) mobileAdmin.style.display = 'none';
            if (desktopAdmin) desktopAdmin.style.display = 'none';
            if (mobileLogout) mobileLogout.style.display = 'none';
            if (userInfo) userInfo.style.display = 'none';
            
            // Hide Mobile Nav Profile
            if (navUserHeader) navUserHeader.style.display = 'none';

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
            
            // Android App এর জন্য signInWithRedirect ব্যবহার করুন
            const isAndroidApp = /wv/.test(navigator.userAgent.toLowerCase());
            
            if (isAndroidApp) {
                // Android WebView-এর জন্য Redirect মেথড
                auth.signInWithRedirect(provider);
            } else {
                // Browser-এর জন্য Popup মেথড
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
                            userData.role = (user.email === ADMIN_EMAIL) ? 'admin' : 'student';
                        }
                        
                        return userRef.set(userData, { merge: true });
                    });
                }).then(() => {
                    if(window.showToast) showToast('সফলভাবে লগইন হয়েছে!', 'success');
                    setTimeout(() => window.location.href = 'index.html', 500);
                }).catch(error => {
                    console.error("Google সাইন-ইন এর সময় সমস্যা:", error);
                    alert("লগইন করার সময় একটি সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
                });
            }
        });
    }
    
    // Redirect রিজাল্ট হ্যান্ডল করা (অ্যান্ড্রয়েড অ্যাপের জন্য)
    firebase.auth().getRedirectResult().then(result => {
        if (result.user) {
            const user = result.user;
            const db = firebase.firestore();
            const userRef = db.collection('users').doc(user.uid);
            const ADMIN_EMAIL = "keshabsarkar2018@gmail.com";
            
            return userRef.get().then(doc => {
                const userData = {
                    uid: user.uid,
                    displayName: user.displayName,
                    email: user.email,
                    photoURL: user.photoURL,
                    lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
                };
                
                if (!doc.exists) {
                    userData.role = (user.email === ADMIN_EMAIL) ? 'admin' : 'student';
                }
                
                return userRef.set(userData, { merge: true });
            }).then(() => {
                if(window.showToast) showToast('সফলভাবে লগইন হয়েছে!', 'success');
                setTimeout(() => window.location.href = 'index.html', 500);
            });
        }
    }).catch(error => {
        console.error("Redirect রিজাল্ট এরর:", error);
    });

    document.body.addEventListener('click', function(e) {
        if (e.target.id === 'mobile-logout' || e.target.closest('#mobile-logout')) {
            e.preventDefault();
            firebase.auth().signOut().then(() => {
                if(window.showToast) showToast('সফলভাবে লগআউট হয়েছে!', 'success');
                setTimeout(() => window.location.href = 'index.html', 500);
            }).catch(error => console.error("লগআউট করার সময় সমস্যা:", error));
        }
    });

});
