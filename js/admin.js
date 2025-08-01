document.addEventListener('DOMContentLoaded', () => {
    const auth = firebase.auth();
    const db = firebase.firestore();

    const userListContainer = document.getElementById('user-list-container');
    const resultsContainer = document.getElementById('results-container');
    const loadingUsers = document.getElementById('loading-users');

    // অ্যাডমিন কিনা তা চেক করা
    auth.onAuthStateChanged(user => {
        if (user) {
            db.collection('users').doc(user.uid).get().then(doc => {
                if (doc.exists && doc.data().role === 'admin') {
                    // যদি অ্যাডমিন হয়, তাহলে ব্যবহারকারীদের লোড করবে
                    fetchAndDisplayUsers();
                } else {
                    // যদি অ্যাডমিন না হয়, তাহলে হোম পেজে পাঠিয়ে দেবে
                    alert('দুঃখিত, এই পেজটি শুধুমাত্র অ্যাডমিনদের জন্য।');
                    window.location.href = 'index.html';
                }
            });
        } else {
            // যদি লগইন করা না থাকে, তাহলে লগইন পেজে পাঠিয়ে দেবে
            window.location.href = 'login.html';
        }
    });

    // সব ব্যবহারকারীকে Firestore থেকে এনে দেখানো
    async function fetchAndDisplayUsers() {
        try {
            const snapshot = await db.collection('users').get();
            userListContainer.innerHTML = ''; // লোডিং মেসেজ মুছে দেওয়া

            snapshot.forEach(doc => {
                const userData = doc.data();
                const userElement = document.createElement('div');
                userElement.classList.add('user-item');
                userElement.dataset.uid = doc.id; // UID সেভ করা
                userElement.dataset.name = userData.name; // নাম সেভ করা

                userElement.innerHTML = `
                    <p>${userData.name}</p>
                    <small>${userData.email}</small>
                `;

                // ব্যবহারকারীর উপর ক্লিক করলে তার ফলাফল দেখানো হবে
                userElement.addEventListener('click', () => {
                    // Active class যোগ করা
                    document.querySelectorAll('.user-item').forEach(el => el.classList.remove('active'));
                    userElement.classList.add('active');
                    fetchAndDisplayResults(doc.id, userData.name);
                });

                userListContainer.appendChild(userElement);
            });

        } catch (error) {
            console.error("ব্যবহারকারীদের তথ্য আনতে সমস্যা হয়েছে:", error);
            userListContainer.innerHTML = '<p>ব্যবহারকারীদের তালিকা আনা সম্ভব হয়নি।</p>';
        }
    }

    // নির্দিষ্ট ব্যবহারকারীর কুইজের ফলাফল দেখানো
    async function fetchAndDisplayResults(userId, userName) {
        resultsContainer.innerHTML = '<p id="loading-results">ফলাফল লোড করা হচ্ছে...</p>';

        try {
            const snapshot = await db.collection('quiz_attempts')
                                    .where('userId', '==', userId)
                                    .orderBy('timestamp', 'desc')
                                    .get();

            if (snapshot.empty) {
                resultsContainer.innerHTML = `
                    <h4>${userName}-এর ফলাফল</h4>
                    <p>এই ব্যবহারকারী এখনো কোনো কুইজ দেননি।</p>
                `;
                return;
            }

            let resultsHTML = `<h4>${userName}-এর ফলাফল</h4>`;
            resultsHTML += `
                <table class="quiz-results-table">
                    <thead>
                        <tr>
                            <th>কুইজের বিষয়</th>
                            <th>ফলাফল</th>
                            <th>তারিখ</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            snapshot.forEach(doc => {
                const attempt = doc.data();
                const score = `${attempt.score} / ${attempt.totalQuestions}`;
                // Timestamp থেকে তারিখ ফরম্যাট করা
                const date = attempt.timestamp.toDate().toLocaleString('bn-BD');

                resultsHTML += `
                    <tr>
                        <td>${attempt.quizTitle}</td>
                        <td>${score}</td>
                        <td>${date}</td>
                    </tr>
                `;
            });

            resultsHTML += '</tbody></table>';
            resultsContainer.innerHTML = resultsHTML;

        } catch (error) {
            console.error("ফলাফল আনতে সমস্যা হয়েছে:", error);
            resultsContainer.innerHTML = '<p>ফলাফল আনা সম্ভব হয়নি।</p>';
        }
    }
});
