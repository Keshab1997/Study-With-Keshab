// js/admin.js (নতুন এবং উন্নত কোড)

document.addEventListener('DOMContentLoaded', function() {
    const adminContent = document.getElementById('admin-content');
    const accessDenied = document.getElementById('access-denied');
    const userListContainer = document.getElementById('user-list-container');
    const db = firebase.firestore();

    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            // ব্যবহারকারী লগইন করা আছে, এখন তার role চেক করা হবে
            checkUserRole(user);
        } else {
            // ব্যবহারকারী লগইন করা নেই
            showAccessDenied();
        }
    });

    function checkUserRole(user) {
        const userDocRef = db.collection('users').doc(user.uid);

        userDocRef.get().then((doc) => {
            if (doc.exists && doc.data().role === 'admin') {
                // ব্যবহারকারী অ্যাডমিন
                showAdminContent();
                loadUsersData();
            } else {
                // ব্যবহারকারী সাধারণ ইউজার
                showAccessDenied();
            }
        }).catch((error) => {
            console.error("Error getting user role:", error);
            showAccessDenied();
        });
    }

    function showAdminContent() {
        accessDenied.style.display = 'none';
        adminContent.style.display = 'block';
    }

    function showAccessDenied() {
        adminContent.style.display = 'none';
        accessDenied.style.display = 'block';
        accessDenied.innerHTML = `
            <h1>প্রবেশাধিকার নেই (Access Denied)</h1>
            <p>এই পেজটি দেখার জন্য আপনার অনুমতি নেই অথবা আপনাকে <a href="login.html">লগইন</a> করতে হবে।</p>
            <a href="index.html">হোম পেজে ফিরে যান</a>
        `;
    }

    // Firestore থেকে ব্যবহারকারীদের ডেটা লোড করার ফাংশন
    function loadUsersData() {
        db.collection("users").get().then((querySnapshot) => {
            if (querySnapshot.empty) {
                userListContainer.innerHTML = "<p>কোনো ব্যবহারকারী খুঁজে পাওয়া যায়নি।</p>";
                return;
            }

            let tableHTML = `
                <table>
                    <thead>
                        <tr>
                            <th>নাম (Name)</th>
                            <th>ইমেইল (Email)</th>
                            <th>ভূমিকা (Role)</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            querySnapshot.forEach((doc) => {
                const userData = doc.data();
                tableHTML += `
                    <tr>
                        <td>${userData.displayName || 'N/A'}</td>
                        <td>${userData.email || 'N/A'}</td>
                        <td>${userData.role || 'user'}</td>
                    </tr>
                `;
            });

            tableHTML += `</tbody></table>`;
            userListContainer.innerHTML = tableHTML;

        }).catch((error) => {
            console.error("Error fetching users: ", error);
            userListContainer.innerHTML = "<p>ডেটা লোড করতে সমস্যা হয়েছে। অনুগ্রহ করে কনসোল চেক করুন।</p>";
        });
    }
});