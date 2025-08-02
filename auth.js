// auth.js (সঠিক এবং নির্ভরযোগ্য ভার্সন)
// অনুগ্রহ করে এই কোডটি ব্যবহার করুন

// আপনার অ্যাডমিন ইমেইল
const ADMIN_EMAIL = "keshabsarkar2018@gmail.com"; 

const googleLoginBtn = document.getElementById('google-login-btn');

if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', () => {
        const auth = firebase.auth();
        const db = firebase.firestore();
        const provider = new firebase.auth.GoogleAuthProvider();

        auth.signInWithPopup(provider)
            .then(result => {
                const user = result.user;
                const userRef = db.collection('users').doc(user.uid);

                // ডেটাবেসে পাঠানোর জন্য একটি অবজেক্ট তৈরি
                const userData = {
                    displayName: user.displayName,
                    email: user.email,
                    profilePic: user.photoURL,
                    lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
                };

                // === মূল লজিক ===
                // যদি লগইন করা ইউজার অ্যাডমিন হয়, তাহলে তার role জোর করে 'admin' সেট করা হবে।
                if (user.email === ADMIN_EMAIL) {
                    userData.role = 'admin';
                }

                // set এবং merge:true ব্যবহার করে ডেটা আপডেট করা হবে।
                // merge:true নিশ্চিত করবে যে অন্য ব্যবহারকারীদের role 'user' থাকলে তা পরিবর্তন হবে না,
                // কিন্তু অ্যাডমিনের ক্ষেত্রে role ফিল্ডটি 'admin' দিয়ে ওভাররাইট হয়ে যাবে।
                return userRef.set(userData, { merge: true });
            })
            .then(() => {
                console.log("ইউজারের তথ্য Firestore এ সফলভাবে আপডেট হয়েছে।");
                window.location.href = 'index.html'; // হোম পেজে পাঠানো
            })
            .catch(error => {
                console.error("Google সাইন-ইন এর সময় সমস্যা:", error);
                alert("লগইন করার সময় একটি সমস্যা হয়েছে।");
            });
    });
}