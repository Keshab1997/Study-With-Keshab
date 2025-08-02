// auth.js (Updated with Admin Role Logic - Firebase v8 Syntax)

// Firebase services (যদি অন্য ফাইলে না থাকে)
const auth = firebase.auth();
const db = firebase.firestore();

// আপনার অ্যাডমিন ইমেইল এখানে যোগ করুন
const ADMIN_EMAIL = "keshabsarkar2018@gmail.com"; 

const googleLoginBtn = document.getElementById('google-login-btn');

if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', () => {
        const provider = new firebase.auth.GoogleAuthProvider();

        auth.signInWithPopup(provider)
            .then((result) => {
                const user = result.user;
                console.log("লগইন সফল হয়েছে:", user.displayName);

                // Firestore এ ইউজারের তথ্য সেভ/আপডেট করা
                const userRef = db.collection('users').doc(user.uid);

                // ব্যবহারকারী অ্যাডমিন কিনা তা পরীক্ষা করা
                const userRole = (user.email === ADMIN_EMAIL) ? 'admin' : 'user';

                // Firestore এ ডেটা সেভ করার জন্য একটি অবজেক্ট তৈরি করা
                const userData = {
                    displayName: user.displayName, // displayName ব্যবহার করা ভালো
                    email: user.email,
                    profilePic: user.photoURL,
                    lastLogin: firebase.firestore.FieldValue.serverTimestamp() // শেষ লগইনের সময়
                };

                // শুধুমাত্র যদি এটি প্রথমবার লগইন হয়, তবেই role সেট করুন
                // অথবা যদি role আগে থেকে সেট করা না থাকে
                return userRef.get().then(doc => {
                    if (!doc.exists || !doc.data().role) {
                        userData.role = userRole;
                    }

                    // set এবং merge:true ব্যবহার করে ডেটা আপডেট করা
                    return userRef.set(userData, { merge: true });
                });
            })
            .then(() => {
                console.log("ইউজারের তথ্য Firestore এ সফলভাবে সেভ হয়েছে।");
                
                // ব্যবহারকারীকে তার আগের পেজে বা ড্যাশবোর্ডে পাঠানোর ব্যবস্থা (ঐচ্ছিক)
                const redirectUrl = localStorage.getItem('redirectAfterLogin') || 'index.html';
                localStorage.removeItem('redirectAfterLogin'); // ব্যবহারের পর মুছে ফেলা
                window.location.href = redirectUrl;

            })
            .catch((error) => {
                console.error("Google সাইন-ইন এর সময় সমস্যা:", error);
                
                // ব্যবহারকারীকে সমস্যা সম্পর্কে জানানো
                let errorMessage = "লগইন করার সময় একটি সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।";
                if (error.code === 'auth/popup-closed-by-user') {
                    errorMessage = "আপনি লগইন পপ-আপটি বন্ধ করে দিয়েছেন।";
                }
                
                alert(errorMessage);
            });
    });
}