// Filename: js/admin.js (Fully Upgraded with User Management Features)

document.addEventListener('DOMContentLoaded', () => {
    // Firebase services
    const auth = firebase.auth();
    const db = firebase.firestore();

    // Page Elements
    const adminPageContainer = document.querySelector('.admin-page-container');
    const accessDenied = document.getElementById('access-denied');
    let allUsers = []; // To store all users for searching

    // --- AUTHENTICATION GATEWAY ---
    auth.onAuthStateChanged(user => {
        if (user) {
            db.collection('users').doc(user.uid).get().then(doc => {
                if (doc.exists && doc.data().role === 'admin') {
                    if (adminPageContainer) adminPageContainer.style.visibility = 'visible';
                    initializeAdminPanel(user);
                } else {
                    showAccessDenied();
                }
            }).catch(showAccessDenied);
        } else {
            // Redirect to a universal login page if not logged in
            window.location.href = 'login.html';
        }
    });

    function showAccessDenied() {
        if (adminPageContainer) adminPageContainer.style.display = 'none';
        if (accessDenied) accessDenied.style.display = 'flex';
    }

    // --- MAIN INITIALIZATION ---
    function initializeAdminPanel(user) {
        setupUI(user);
        loadDashboardData();
        loadLeaderboardChapters();
    }

    // --- UI AND EVENT LISTENERS SETUP ---
    function setupUI(user) {
        const sidebar = document.querySelector('.sidebar');
        const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
        const adminInfoSidebar = document.getElementById('admin-info-sidebar');
        
        // Setup sidebar user info and logout
        document.getElementById('admin-profile-pic-sidebar').src = user.photoURL || 'images/default-avatar.png';
        document.getElementById('admin-name-sidebar').textContent = user.displayName || 'Admin';
        document.getElementById('admin-logout-btn').addEventListener('click', e => { e.preventDefault(); auth.signOut(); });
        adminInfoSidebar.style.display = 'flex';

        // Setup navigation
        document.getElementById('nav-dashboard').addEventListener('click', e => { e.preventDefault(); showSection('dashboard'); });
        document.getElementById('nav-leaderboard').addEventListener('click', e => { e.preventDefault(); showSection('leaderboard'); });
        if (mobileMenuToggle) mobileMenuToggle.addEventListener('click', () => sidebar.classList.toggle('is-visible'));

        // Setup leaderboard chapter selection
        document.getElementById('chapter-select').addEventListener('change', (e) => {
            if (e.target.value) loadLeaderboardData(e.target.value);
        });

        // Setup modal close events
        const modal = document.getElementById('score-details-modal');
        const closeBtn = modal.querySelector('.close-button');
        if (closeBtn) closeBtn.onclick = () => { modal.style.display = 'none'; };
        window.onclick = (event) => { if (event.target == modal) modal.style.display = 'none'; };

        // Setup search functionality
        document.getElementById('user-search-input').addEventListener('keyup', (e) => {
            const searchTerm = e.target.value.toLowerCase().trim();
            const filteredUsers = allUsers.filter(user =>
                (user.displayName || '').toLowerCase().includes(searchTerm) ||
                (user.email || '').toLowerCase().includes(searchTerm)
            );
            renderUserTable(filteredUsers);
        });
    }

    // --- SECTION SWITCHING LOGIC ---
    function showSection(sectionName) {
        document.querySelector('.sidebar')?.classList.remove('is-visible');
        document.querySelectorAll('.content-section').forEach(s => s.style.display = 'none');
        document.querySelectorAll('.sidebar-nav li').forEach(n => n.classList.remove('active'));

        document.getElementById(`${sectionName}-content`).style.display = 'block';
        document.getElementById(`nav-${sectionName}`).classList.add('active');
        
        const sectionTitle = document.getElementById(`nav-${sectionName}`).textContent.trim();
        document.getElementById('page-title').textContent = sectionTitle;
        document.getElementById('breadcrumb-nav').querySelector('.active').textContent = sectionTitle;
    }

    // --- DASHBOARD: DATA LOADING AND RENDERING ---
    function loadDashboardData() {
        const userListLoading = document.getElementById('user-list-loading');
        if (userListLoading) userListLoading.style.display = 'block';

        db.collection('users').orderBy('lastLogin', 'desc').get().then(snapshot => {
            allUsers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            const adminCount = allUsers.filter(u => u.role === 'admin').length;

            document.getElementById('total-users').textContent = allUsers.length;
            document.getElementById('total-admins').textContent = adminCount;

            renderUserTable(allUsers);
            if (userListLoading) userListLoading.style.display = 'none';
        });
    }

    function renderUserTable(users) {
        const tableBody = document.getElementById('user-table-body');
        if (!tableBody) return;
        tableBody.innerHTML = '';
        users.forEach(user => {
            const lastLogin = user.lastLogin ? new Date(user.lastLogin).toLocaleString('bn-BD') : 'N/A';
            const currentRole = user.role || 'user';
            const roleClass = currentRole === 'admin' ? 'role-admin' : 'user';
            const roleChangeText = currentRole === 'admin' ? 'User বানান' : 'Admin বানান';
            const roleChangeIcon = currentRole === 'admin' ? 'fa-user-slash' : 'fa-user-shield';

            const row = `
                <tr>
                    <td><img src="${user.profilePic || 'images/default-avatar.png'}" class="table-profile-pic"></td>
                    <td>${user.displayName || 'N/A'}</td>
                    <td>${user.email || 'N/A'}</td>
                    <td><span class="role-badge ${roleClass}">${currentRole}</span></td>
                    <td>${lastLogin}</td>
                    <td class="action-buttons">
                        <button class="action-btn-small" onclick="window.changeUserRole('${user.id}', '${currentRole}')" title="${roleChangeText}"><i class="fas ${roleChangeIcon}"></i></button>
                        <button class="action-btn-small warning" onclick="window.resetUserScores('${user.id}', '${user.displayName}')" title="স্কোর রিসেট করুন"><i class="fas fa-undo"></i></button>
                    </td>
                </tr>`;
            tableBody.innerHTML += row;
        });
    }

    // --- LEADERBOARD: DATA LOADING AND RENDERING ---
    function loadLeaderboardChapters() {
        const chapterSelect = document.getElementById('chapter-select');
        if (!chapterSelect) return;
        // This should ideally be dynamic, but for now, we'll keep it static.
        const chapters = ["কার্য, ক্ষমতা ও শক্তি", "আলো", "শিল্প ও সংস্কৃতি"]; 
        chapters.forEach(chapter => {
            const option = document.createElement('option');
            option.value = chapter.replace(/\s+/g, '_').replace(/,/g, '');;
            option.textContent = chapter;
            chapterSelect.appendChild(option);
        });
    }

    function loadLeaderboardData(chapterKey) {
        const leaderboardLoading = document.getElementById('leaderboard-loading');
        if (leaderboardLoading) leaderboardLoading.style.display = 'block';
        const tableBody = document.getElementById('leaderboard-table-body');
        tableBody.innerHTML = '';

        db.collection('users').orderBy(`chapters.${chapterKey}.totalScore`, 'desc').limit(20).get()
            .then(snapshot => {
                if (leaderboardLoading) leaderboardLoading.style.display = 'none';
                if (snapshot.empty) {
                    tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">এই বিষয়ের কোনো ফলাফল নেই।</td></tr>';
                    return;
                }
                let rank = 1;
                let foundScores = false;
                snapshot.forEach(doc => {
                    const userData = doc.data();
                    const chapterData = userData.chapters?.[chapterKey];
                    if (chapterData && chapterData.totalScore > 0) {
                        foundScores = true;
                        const row = `
                            <tr>
                                <td>${rank++}</td>
                                <td>
                                    <div class="user-cell">
                                        <img src="${userData.profilePic || 'images/default-avatar.png'}" class="table-profile-pic">
                                        <span>${userData.displayName || 'Unknown'}</span>
                                    </div>
                                </td>
                                <td>${chapterData.totalScore}</td>
                                <td><button class="action-btn" onclick="window.viewScoreDetails('${doc.id}', '${chapterKey}')">বিস্তারিত</button></td>
                            </tr>`;
                        tableBody.innerHTML += row;
                    }
                });
                if (!foundScores) {
                     tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">এই বিষয়ের কোনো ফলাফল নেই।</td></tr>';
                }
            });
    }

    // --- MODAL AND USER ACTIONS (accessible globally via window) ---
    window.viewScoreDetails = function(userId, chapterKey) {
        db.collection('users').doc(userId).get().then(doc => {
            if (doc.exists) {
                const userData = doc.data();
                const chapterData = userData.chapters?.[chapterKey];
                const chapterName = chapterKey.replace(/_/g, ' ');
                
                document.getElementById('modal-user-name').textContent = `${userData.displayName}-এর '${chapterName}' অধ্যায়ের স্কোর`;
                const modalTableBody = document.getElementById('modal-score-table-body');
                modalTableBody.innerHTML = '';

                if (chapterData && chapterData.quiz_sets) {
                    Object.entries(chapterData.quiz_sets).forEach(([setName, setData]) => {
                        const row = `<tr><td>${setName.replace('_', ' ')}</td><td>${setData.score}</td><td>${setData.totalQuestions}</td></tr>`;
                        modalTableBody.innerHTML += row;
                    });
                } else {
                    modalTableBody.innerHTML = `<tr><td colspan="3">কোনো বিস্তারিত স্কোর পাওয়া যায়নি।</td></tr>`;
                }
                document.getElementById('score-details-modal').style.display = 'block';
            }
        });
    }

    window.changeUserRole = function(userId, currentRole) {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        if (confirm(`আপনি কি সত্যিই এই ব্যবহারকারীর ভূমিকা পরিবর্তন করে "${newRole}" করতে চান?`)) {
            db.collection("users").doc(userId).update({ role: newRole })
                .then(() => { alert("ভূমিকা সফলভাবে পরিবর্তন করা হয়েছে।"); loadDashboardData(); })
                .catch(error => console.error("Error changing role: ", error));
        }
    };

    window.resetUserScores = function(userId, userName) {
        if (confirm(`আপনি কি সত্যিই "${userName}"-এর সকল অধ্যায়ের স্কোর মুছে ফেলতে চান?`)) {
            db.collection("users").doc(userId).update({ chapters: firebase.firestore.FieldValue.delete() })
                .then(() => alert(`${userName}-এর সকল স্কোর সফলভাবে রিসেট করা হয়েছে।`))
                .catch(error => console.error("Error resetting scores: ", error));
        }
    };
});