// js/admin.js (Updated, Complete, and for Newcomers)

document.addEventListener('DOMContentLoaded', () => {
    // Firebase services
    const auth = firebase.auth();
    const db = firebase.firestore();

    // Page Elements
    const adminPageContainer = document.querySelector('.admin-page-container');
    const accessDenied = document.getElementById('access-denied');
    const sidebar = document.querySelector('.sidebar');
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    let allUsers = []; // To store users for searching

    // Auth check - The gateway to the admin panel
    auth.onAuthStateChanged(user => {
        if (user) {
            db.collection('users').doc(user.uid).get().then(doc => {
                if (doc.exists && doc.data().role === 'admin') {
                    if(adminPageContainer) adminPageContainer.style.visibility = 'visible';
                    initializeAdminPanel(user);
                } else {
                    showAccessDenied();
                }
            }).catch(showAccessDenied);
        } else {
            showAccessDenied();
        }
    });

    function showAccessDenied() {
        if(adminPageContainer) adminPageContainer.style.display = 'none';
        if(accessDenied) accessDenied.style.display = 'flex';
    }

    // Main initialization function - Runs only if user is admin
    function initializeAdminPanel(user) {
        // Section containers
        const dashboardContent = document.getElementById('dashboard-content');
        const leaderboardContent = document.getElementById('leaderboard-content');

        // Nav elements
        const navDashboard = document.getElementById('nav-dashboard');
        const navLeaderboard = document.getElementById('nav-leaderboard');
        const pageTitle = document.getElementById('page-title');
        const breadcrumb = document.getElementById('breadcrumb-nav');

        // Sidebar user info
        const adminInfoSidebar = document.getElementById('admin-info-sidebar');
        document.getElementById('admin-profile-pic-sidebar').src = user.photoURL || 'images/default-avatar.png';
        document.getElementById('admin-name-sidebar').textContent = user.displayName || 'Admin';
        document.getElementById('admin-logout-btn').addEventListener('click', e => { e.preventDefault(); auth.signOut(); });
        adminInfoSidebar.style.display = 'flex';

        // Event Listeners for navigation
        navDashboard.addEventListener('click', e => { e.preventDefault(); showSection('dashboard'); });
        navLeaderboard.addEventListener('click', e => { e.preventDefault(); showSection('leaderboard'); });
        if(mobileMenuToggle) mobileMenuToggle.addEventListener('click', () => sidebar.classList.toggle('is-visible'));

        // Leaderboard chapter selection
        const chapterSelect = document.getElementById('chapter-select');
        if (chapterSelect) {
            chapterSelect.addEventListener('change', () => {
                const chapterId = chapterSelect.value;
                if (chapterId) loadLeaderboardData(chapterId);
            });
        }
        
        // Modal close button
        const modal = document.getElementById('score-details-modal');
        const closeBtn = document.querySelector('.close-button');
        if(closeBtn) closeBtn.onclick = () => { modal.style.display = 'none'; };
        window.onclick = (event) => {
            if (event.target == modal) modal.style.display = 'none';
        };

        // Load initial data
        showSection('dashboard');
        loadDashboardData();
        loadLeaderboardChapters();
        
        // --- Section Switching Logic ---
        function showSection(sectionName) {
            if(sidebar) sidebar.classList.remove('is-visible');
            const sections = { dashboard: dashboardContent, leaderboard: leaderboardContent };
            const navs = { dashboard: navDashboard, leaderboard: navLeaderboard };
            const titles = { dashboard: 'ড্যাশবোর্ড', leaderboard: 'লিডারবোর্ড' };

            Object.values(sections).forEach(s => { if(s) s.style.display = 'none' });
            Object.values(navs).forEach(n => { if(n) n.classList.remove('active') });

            if(sections[sectionName]) sections[sectionName].style.display = 'block';
            if(navs[sectionName]) navs[sectionName].classList.add('active');
            if(pageTitle) pageTitle.textContent = titles[sectionName];
            if(breadcrumb) breadcrumb.querySelector('.active').textContent = titles[sectionName].replace('ড্যাশবোর্ড', 'Dashboard');
        }

        // --- Data Loading Functions ---
        function loadDashboardData() {
            const userListLoading = document.getElementById('user-list-loading');
            if(userListLoading) userListLoading.style.display = 'block';
            
            db.collection('users').orderBy('lastLogin', 'desc').get().then(snapshot => {
                allUsers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                const adminCount = allUsers.filter(u => u.role === 'admin').length;
                
                document.getElementById('total-users').textContent = allUsers.length;
                document.getElementById('total-admins').textContent = adminCount;
                
                renderUserTable(allUsers);
                if(userListLoading) userListLoading.style.display = 'none';
            });
        }
        
        function renderUserTable(users) {
            const tableBody = document.getElementById('user-table-body');
            if(!tableBody) return;
            tableBody.innerHTML = '';
            users.forEach(user => {
                const lastLogin = user.lastLogin ? new Date(user.lastLogin.seconds * 1000).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true }) : 'N/A';
                const roleClass = user.role === 'admin' ? 'admin' : 'user';
                const row = `
                    <tr>
                        <td><img src="${user.profilePic || 'images/default-avatar.png'}" class="profile-pic" onerror="this.src='images/default-avatar.png';"></td>
                        <td>${user.displayName || 'N/A'}</td>
                        <td>${user.email || 'N/A'}</td>
                        <td><span class="role-badge ${roleClass}">${user.role || 'user'}</span></td>
                        <td>${lastLogin}</td>
                    </tr>`;
                tableBody.innerHTML += row;
            });
        }

        function loadLeaderboardChapters() {
            const chapterSelect = document.getElementById('chapter-select');
            if(!chapterSelect) return;
            db.collection('leaderboards').get().then(snapshot => {
                snapshot.forEach(doc => {
                    const option = document.createElement('option');
                    option.value = doc.id;
                    option.textContent = doc.id;
                    chapterSelect.appendChild(option);
                });
            });
        }

        function loadLeaderboardData(chapterId) {
            const leaderboardLoading = document.getElementById('leaderboard-loading');
            if(leaderboardLoading) leaderboardLoading.style.display = 'block';
            const tableBody = document.getElementById('leaderboard-table-body');
            tableBody.innerHTML = '';

            const scoresRef = db.collection('leaderboards').doc(chapterId).collection('scores');
            scoresRef.orderBy('totalScore', 'desc').get().then(snapshot => {
                if(leaderboardLoading) leaderboardLoading.style.display = 'none';
                if (snapshot.empty) {
                    tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">এই বিষয়ের কোনো ফলাফল নেই।</td></tr>';
                    return;
                }
                let rank = 1;
                snapshot.forEach(doc => {
                    const data = doc.data();
                    const row = `
                        <tr>
                            <td>${rank++}</td>
                            <td>
                                <img src="${data.userPhotoURL}" class="profile-pic" style="width:30px; height:30px; margin-right: 8px;">
                                ${data.userName}
                            </td>
                            <td>${data.totalScore}</td>
                            <td><button class="view-details-btn" data-userid="${doc.id}" data-chapterid="${chapterId}">বিস্তারিত</button></td>
                        </tr>`;
                    tableBody.innerHTML += row;
                });
                document.querySelectorAll('.view-details-btn').forEach(button => {
                    button.addEventListener('click', showScoreDetails);
                });
            });
        }

        function showScoreDetails(event) {
            const userId = event.target.dataset.userid;
            const chapterId = event.target.dataset.chapterid;
            const docRef = db.collection('leaderboards').doc(chapterId).collection('scores').doc(userId);
            
            docRef.get().then(doc => {
                if (doc.exists) {
                    const data = doc.data();
                    document.getElementById('modal-user-name').textContent = `${data.userName} এর বিস্তারিত স্কোর`;
                    const modalTableBody = document.getElementById('modal-score-table-body');
                    modalTableBody.innerHTML = '';
                    for (const setName in data.scoresBySet) {
                        const setData = data.scoresBySet[setName];
                        const row = `<tr><td>${setName}</td><td>${setData.score}</td><td>${setData.total}</td></tr>`;
                        modalTableBody.innerHTML += row;
                    }
                    document.getElementById('score-details-modal').style.display = 'block';
                }
            });
        }

        // Search functionality
        const searchInput = document.getElementById('user-search-input');
        if (searchInput) {
            searchInput.addEventListener('keyup', () => {
                const searchTerm = searchInput.value.toLowerCase().trim();
                const filteredUsers = allUsers.filter(user => 
                    (user.displayName || '').toLowerCase().includes(searchTerm) || 
                    (user.email || '').toLowerCase().includes(searchTerm)
                );
                renderUserTable(filteredUsers);
            });
        }
    }
});