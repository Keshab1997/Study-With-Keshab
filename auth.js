// auth.js (Firebase v8 Syntax)

const googleLoginBtn = document.getElementById('google-login-btn');

if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', () => {
        const provider = new firebase.auth.GoogleAuthProvider();

        firebase.auth().signInWithPopup(provider)
            .then((result) => {
                const user = result.user;
                console.log("লগইন সফল হয়েছে:", user.displayName);

                // Firestore এ ইউজারের তথ্য সেভ করা
                const userRef = db.collection("users").doc(user.uid);
                
                return userRef.set({
                    name: user.displayName,
                    email: user.email,
                    profilePic: user.photoURL,
                    role: "user" 
                }, { merge: true }); // merge:true দিলে পুরনো তথ্য মুছে যাবে না

            })
            .then(() => {
                console.log("ইউজারের তথ্য Firestore এ সেভ হয়েছে।");
                window.location.href = 'index.html'; // হোম পেজে রিডাইরেক্ট
            })
            .catch((error) => {
                console.error("Google সাইন-ইন এর সময় সমস্যা:", error);
                alert(`লগইন ব্যর্থ হয়েছে: ${error.message}`);
            });
    });
}
