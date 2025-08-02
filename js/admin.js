// js/admin.js (Advanced Version with Indian Time Zone)

document.addEventListener('DOMContentLoaded', () => {
    const adminPageContainer = document.querySelector('.admin-page-container');
    const accessDenied = document.getElementById('access-denied');
    const loadingMessage = document.getElementById('loading-message');
    let allUsers = []; // সমস্ত ব্যবহারকারীর ডেটা এখানে স্টোর হবে

    const db = firebase.firestore();

    // ব্যবহারকারী অ্যাডমিন কিনা তা পরীক্ষা করা
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            db.collection('users').doc(user.uid).get().then(doc => {
                if (doc.exists && doc.data().role === 'admin') {
                    // অ্যাডমিন হলে পেজ দেখাও
                    adminPageContainer.style.display = 'flex';
                    accessDenied.style.display = 'none';
                    loadAllUserData();
                } else {
                    // অ্যাডমিন না হলে অ্যাক্সেস ডিনাইড
                    showAccessDenied();
                }
            }).catch(showAccessDenied);
        } else {
            // লগইন করা না থাকলে অ্যাক্সেস ডিনাইড
            showAccessDenied();
        }
    });

    function showAccessDenied() {
        if(adminPageContainer) adminPageContainer.style.display = 'none';
        if(accessDenied) accessDenied.style.display = 'flex';
    }

    // সমস্ত ব্যবহারকারীর ডেটা লোড করার ফাংশন
    function loadAllUserData() {
        db.collection('users').get().then(querySnapshot => {
            let adminCount = 0;
            
            allUsers = querySnapshot.docs.map(doc => {
                const data = doc.data();
                if (data.role === 'admin') adminCount++;
                return { id: doc.id, ...data };
            });

            // ড্যাশবোর্ড কার্ড আপডেট
            document.getElementById('total-users').textContent = allUsers.length;
            document.getElementById('total-admins').textContent = adminCount;
            
            renderUserTable(allUsers); // টেবিল রেন্ডার করো
            if(loadingMessage) loadingMessage.style.display = 'none';

        }).catch(error => {
            console.error("Error fetching users:", error);
            if(loadingMessage) loadingMessage.textContent = 'ডেটা লোড করতে ব্যর্থ হয়েছে।';
        });
    }

    // টেবিলে ডেটা দেখানোর ফাংশন
    function renderUserTable(users) {
        const tableBody = document.getElementById('user-table-body');
        const noResultsMessage = document.getElementById('no-results-message');
        
        if(!tableBody || !noResultsMessage) return;

        tableBody.innerHTML = '';

        if (users.length === 0) {
            noResultsMessage.style.display = 'block';
            return;
        }
        noResultsMessage.style.display = 'none';
        
        users.forEach(user => {
            // === পরিবর্তনটি এই লাইনে করা হয়েছে (Indian Time Zone এর জন্য) ===
            const lastLogin = user.lastLogin ? new Date(user.lastLogin.seconds * 1000).toLocaleString('en-IN', {
                timeZone: 'Asia/Kolkata', // ভারতের টাইমজোন সেট করা হয়েছে
                year: 'numeric', 
                month: 'short', 
                day: 'numeric', 
                hour: 'numeric', 
                minute: '2-digit', 
                second: '2-digit', 
                hour12: true 
            }) : 'N/A';
            
            const roleClass = user.role === 'admin' ? 'admin' : 'user';
            
            const row = `
                <tr>
                    <td><img src="${user.profilePic || 'images/default-avatar.png'}" alt="Profile Pic" class="profile-pic" onerror="this.src='images/default-avatar.png';"></td>
                    <td>${user.displayName || 'N/A'}</td>
                    <td>${user.email || 'N/A'}</td>
                    <td><span class="role-badge ${roleClass}">${user.role || 'user'}</span></td>
                    <td>${lastLogin}</td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });
    }

    // সার্চ ফাংশনালিটি
    const searchInput = document.getElementById('user-search-input');
    if (searchInput) {
        searchInput.addEventListener('keyup', () => {
            const searchTerm = searchInput.value.toLowerCase().trim();
            
            const filteredUsers = allUsers.filter(user => {
                const name = (user.displayName || '').toLowerCase();
                const email = (user.email || '').toLowerCase();
                return name.includes(searchTerm) || email.includes(searchTerm);
            });

            renderUserTable(filteredUsers);
        });
    }
});