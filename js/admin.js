// js/admin.js

document.addEventListener('DOMContentLoaded', () => {

    // Firebase সার্ভিসগুলো global scope থেকে নেওয়া হচ্ছে (firebase-config.js থেকে)
    const auth = firebase.auth();
    const db = firebase.firestore();

    // ===================================
    //  ১. অথেন্টিকেশন এবং রোল চেকিং (Auth Guard)
    // ===================================
    auth.onAuthStateChanged(user => {
        if (user) {
            // ব্যবহারকারী লগইন করা থাকলে, তার role চেক করা হবে
            db.collection('users').doc(user.uid).get().then(doc => {
                if (doc.exists && doc.data().role === 'admin') {
                    // যদি ব্যবহারকারী অ্যাডমিন হয়, তাহলে পেজটি দেখানো হবে
                    console.log("Admin access granted.");
                    document.body.style.display = 'block'; // পেজ দৃশ্যমান করা
                    fetchScores(); // স্কোর লোড করার ফাংশন কল করা
                } else {
                    // যদি অ্যাডমিন না হয়, তাহলে তাকে index.html-এ পাঠিয়ে দেওয়া হবে
                    console.log("Access denied. User is not an admin.");
                    alert("আপনার এই পেজটি দেখার অনুমতি নেই।");
                    window.location.href = 'index.html';
                }
            }).catch(error => {
                console.error("Error getting user role:", error);
                alert("আপনার তথ্য যাচাই করতে সমস্যা হয়েছে।");
                window.location.href = 'index.html';
            });
        } else {
            // ব্যবহারকারী লগইন করা না থাকলে, login.html-এ পাঠিয়ে দেওয়া হবে
            console.log("No user logged in. Redirecting to login.");
            window.location.href = 'login.html';
        }
    });

    // ===================================
    //  ২. Firestore থেকে ডেটা আনা
    // ===================================
    async function fetchScores() {
        const loadingMessage = document.getElementById('loading-message');
        const scoresTableBody = document.getElementById('scores-tbody');
        
        loadingMessage.style.display = 'block';
        scoresTableBody.innerHTML = '';

        try {
            const snapshot = await db.collection('quiz_scores').orderBy('timestamp', 'desc').get();
            
            if (snapshot.empty) {
                loadingMessage.textContent = 'এখনও কোনো স্কোর সেভ করা হয়নি।';
                return;
            }
            loadingMessage.style.display = 'none';

            let totalScoresCount = 0;
            let totalScoreValue = 0;
            const userEmails = new Set();

            snapshot.forEach(doc => {
                const scoreData = doc.data();
                const date = scoreData.timestamp ? scoreData.timestamp.toDate().toLocaleString('bn-BD') : 'N/A';
                const quizName = scoreData.quizName || 'অজানা কুইজ'; 

                const row = `<tr>
                                <td>${scoreData.email}</td>
                                <td>${quizName}</td>
                                <td>${scoreData.score}</td>
                                <td>${date}</td>
                             </tr>`;
                scoresTableBody.innerHTML += row;

                totalScoresCount++;
                totalScoreValue += Number(scoreData.score);
                userEmails.add(scoreData.email);
            });
            
            // সামারি কার্ড আপডেট করা
            document.getElementById('total-scores').textContent = totalScoresCount;
            document.getElementById('total-users').textContent = userEmails.size;
            const avgScore = totalScoresCount > 0 ? (totalScoreValue / totalScoresCount).toFixed(2) : 0;
            document.getElementById('average-score').textContent = avgScore;

        } catch (error) {
            console.error("স্কোর আনতে সমস্যা হয়েছে:", error);
            loadingMessage.textContent = 'স্কোর আনতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।';
        }
    }

    // ===================================
    //  ৩. ইভেন্ট লিসেনার (যেমন - লগআউট)
    // ===================================
    document.getElementById('logout-btn').addEventListener('click', () => {
        auth.signOut().then(() => {
            console.log("Admin logged out successfully.");
            window.location.href = 'index.html';
        }).catch(error => console.error("Sign out error", error));
    });

});
