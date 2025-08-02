// auth.js (Corrected Version)

// এই ফাইলটি শুধুমাত্র login.html পেজের জন্য কাজ করবে

// আপনার অ্যাডমিন ইমেইল এখানে যোগ করুন
const ADMIN_EMAIL = "keshabsarkar2018@gmail.com"; 

const googleLoginBtn = document.getElementById('google-login-btn');

if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', () => {
        // Firebase service গুলো শুধুমাত্র এই ফাংশনের ভেতরে ব্যবহার করা হবে
        const auth = firebase.auth();
        const db = firebase.firestore();
        const provider = new firebase.auth.GoogleAuthProvider();

        auth.signInWithPopup(provider)
            .then((result) => {
                const user = result.user;
                console.log("লগইন সফল হয়েছে:", user.displayName);

                const userRef = db.collection('users').doc(user.uid);
                const userRole = (user.email === ADMIN_EMAIL) ? 'admin' : 'user';

                const userData = {
                    displayName: user.displayName,
                    email: user.email,
                    profilePic: user.photoURL,
                    lastLogin: firebase.firestore.FieldValue.serverTimestamp()
                };

                return userRef.get().then(doc => {
                    if (!doc.exists || !doc.data().role) {
                        userData.role = userRole;
                    }
                    return userRef.set(userData, { merge: true });
                });
            })
            .then(() => {
                console.log("ইউজারের তথ্য Firestore এ সফলভাবে সেভ হয়েছে।");
                window.location.href = 'index.html'; // হোম পেজে রিডাইরেক্ট
            })
            .catch((error) => {
                console.error("Google সাইন-ইন এর সময় সমস্যা:", error);
                
                let errorMessage = "লগইন করার সময় একটি সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।";
                if (error.code === 'auth/popup-closed-by-user') {
                    errorMessage = "আপনি লগইন পপ-আপটি বন্ধ করে দিয়েছেন।";
                }
                
                alert(errorMessage);
            });
    });
}