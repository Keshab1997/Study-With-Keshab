document.addEventListener('DOMContentLoaded', () => {

    if (typeof firebase === 'undefined') {
        console.error("Firebase SDK not loaded!");
        return;
    }

    const auth = firebase.auth();
    const db = firebase.firestore();
    
    // --- DOM Element References ---
    const adminPageContainer = document.querySelector('.admin-page-container');
    const accessDeniedMessage = document.getElementById('access-denied');
    
    // Sidebar Elements
    const adminInfoSidebar = document.getElementById('admin-info-sidebar');
    const adminProfilePicSidebar = document.getElementById('admin-profile-pic-sidebar');
    const adminNameSidebar = document.getElementById('admin-name-sidebar');
    const adminLogoutBtn = document.getElementById('admin-logout-btn');
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    // Tab Navigation Elements
    const navDashboardLink = document.getElementById('nav-dashboard');
    const navLeaderboardLink = document.getElementById('nav-leaderboard');
    const dashboardContent = document.getElementById('dashboard-content');
    const leaderboardContent = document.getElementById('leaderboard-content');
    
    // Dashboard Elements
    const totalUsersStat = document.getElementById('total-users');
    const totalAdminsStat = document.getElementById('total-admins');
    const userTableBody = document.getElementById('user-table-body');
    const userSearchInput = document.getElementById('user-search-input');
    const userListLoading = document.getElementById('user-list-loading');

    // Notification Elements
    const notificationForm = document.getElementById('notification-form');
    const notificationStatus = document.getElementById('notification-status');

    // Leaderboard Elements
    const leaderboardTableBody = document.getElementById('leaderboard-table-body');
    const leaderboardLoading = document.getElementById('leaderboard-loading');
    const chapterSelect = document.getElementById('chapter-select');

    let allUsersCache = [];
    
    // --- Authentication and Initialization ---
    auth.onAuthStateChanged(user => {
        if (user) {
            checkAdminRole(user);
        } else {
            showAccessDenied();
        }
    });

    const checkAdminRole = async (user) => {
        try {
            const doc = await db.collection('users').doc(user.uid).get();
            if (doc.exists && doc.data().role === 'admin') {
                initializeAdminPanel(user, doc.data());
            } else {
                showAccessDenied();
            }
        } catch (error) {
            console.error("Error checking admin role:", error);
            showAccessDenied();
        }
    };

    const initializeAdminPanel = (user, adminData) => {
        adminPageContainer.style.display = 'flex';
        adminNameSidebar.textContent = adminData.displayName || 'Admin';
        adminProfilePicSidebar.src = adminData.photoURL || 'images/default-avatar.png';
        adminInfoSidebar.style.display = 'flex';
        setupEventListeners();
        loadDashboardData();
    };
    
    const showAccessDenied = () => {
        adminPageContainer.style.display = 'none';
        accessDeniedMessage.style.display = 'flex';
    };

    // --- Event Listeners ---
    const setupEventListeners = () => {
        // Hamburger Menu Toggle for Mobile
        if (mobileMenuToggle && sidebar) {
            mobileMenuToggle.addEventListener('click', () => {
                sidebar.classList.toggle('is-visible');
            });
        }

        // Logout Button
        if (adminLogoutBtn) {
            adminLogoutBtn.addEventListener('click', (e) => { 
                e.preventDefault(); 
                auth.signOut(); 
            });
        }
        
        // Notification Form Submit
        if (notificationForm) notificationForm.addEventListener('submit', handleNotificationSubmit);
        
        // User Search
        if (userSearchInput) {
            userSearchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                const filteredUsers = allUsersCache.filter(user => 
                    (user.displayName && user.displayName.toLowerCase().includes(searchTerm)) || 
                    (user.email && user.email.toLowerCase().includes(searchTerm))
                );
                renderUserTable(filteredUsers);
            });
        }

        // Tab Navigation
        if (navDashboardLink) {
            navDashboardLink.addEventListener('click', (e) => {
                e.preventDefault();
                dashboardContent.style.display = 'block';
                leaderboardContent.style.display = 'none';
                navDashboardLink.parentElement.classList.add('active');
                if (navLeaderboardLink) navLeaderboardLink.parentElement.classList.remove('active');
            });
        }

        if (navLeaderboardLink) {
            navLeaderboardLink.addEventListener('click', (e) => {
                e.preventDefault();
                dashboardContent.style.display = 'none';
                leaderboardContent.style.display = 'block';
                if (navDashboardLink) navDashboardLink.parentElement.classList.remove('active');
                navLeaderboardLink.parentElement.classList.add('active');
                loadLeaderboardData(); // Load data when tab is clicked
            });
        }
    };

    // --- Dashboard Functions ---
    const loadDashboardData = async () => {
        if (userListLoading) userListLoading.style.display = 'block';
        try {
            const usersSnapshot = await db.collection('users').get();
            allUsersCache = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            const adminCount = allUsersCache.filter(user => user.role === 'admin').length;
            if (totalUsersStat) totalUsersStat.textContent = allUsersCache.length;
            if (totalAdminsStat) totalAdminsStat.textContent = adminCount;
            
            renderUserTable(allUsersCache);
        } catch (error) {
            console.error("Error loading user data:", error);
            if(userTableBody) userTableBody.innerHTML = `<tr><td colspan="6">ব্যবহারকারীদের তালিকা লোড করতে সমস্যা হয়েছে।</td></tr>`;
        } finally {
            if (userListLoading) userListLoading.style.display = 'none';
        }
    };

    const renderUserTable = (users) => {
        if (!userTableBody) return;
        userTableBody.innerHTML = '';
        if (users.length === 0) {
            userTableBody.innerHTML = '<tr><td colspan="6">কোনো ব্যবহারকারী খুঁজে পাওয়া যায়নি।</td></tr>';
            return;
        }
        users.forEach(user => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><img src="${user.photoURL || 'images/default-avatar.png'}" alt="Profile" class="user-table-pic"></td>
                <td>${user.displayName || 'N/A'}</td>
                <td>${user.email || 'N/A'}</td>
                <td><span class="role-badge ${user.role === 'admin' ? 'role-admin' : ''}">${user.role || 'user'}</span></td>
                <td>${formatTimestamp(user.lastLogin)}</td>
                <td class="action-cell"><button class="btn-sm btn-primary" data-id="${user.id}">View</button></td>
            `;
            userTableBody.appendChild(tr);
        });
    };

    // --- Notification Function ---
    const handleNotificationSubmit = async (e) => {
        e.preventDefault();
        const title = document.getElementById('notification-title').value;
        const body = document.getElementById('notification-body').value;
        const link = document.getElementById('notification-link').value;
        const button = e.target.querySelector('button');

        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        
        try {
            // Firestore-এ একটি ডকুমেন্টের মাধ্যমে Cloud Function ট্রিগার করা
            await db.collection('notificationQueue').add({ title, body, link });
            
            if (notificationStatus) {
                notificationStatus.style.display = 'block';
                notificationStatus.className = 'status-success';
                notificationStatus.textContent = 'Notification sent to queue successfully!';
            }
            if (notificationForm) notificationForm.reset();
        } catch (error) {
            console.error("Error queueing notification:", error);
            if (notificationStatus) {
                notificationStatus.style.display = 'block';
                notificationStatus.className = 'status-danger';
                notificationStatus.textContent = `Error: ${error.message}`;
            }
        } finally {
            button.disabled = false;
            button.innerHTML = '<i class="fas fa-paper-plane"></i> সব ব্যবহারকারীকে পাঠান';
            if (notificationStatus) setTimeout(() => { notificationStatus.style.display = 'none'; }, 5000);
        }
    };

    // --- Leaderboard Functions ---
    const loadLeaderboardData = async () => {
        if (leaderboardLoading) leaderboardLoading.style.display = 'block';
        if (leaderboardTableBody) leaderboardTableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">লিডারবোর্ড লোড হচ্ছে...</td></tr>';

        try {
            const usersSnapshot = await db.collection('users').get();
            let leaderboardEntries = [];

            usersSnapshot.forEach(doc => {
                const user = doc.data();
                if (user.quiz_sets && typeof user.quiz_sets === 'object') {
                    let totalScore = 0;
                    Object.values(user.quiz_sets).forEach(quiz => {
                        if (quiz.totalScore && typeof quiz.totalScore === 'number') {
                            totalScore += quiz.totalScore;
                        }
                    });

                    if (totalScore > 0) {
                        leaderboardEntries.push({
                            displayName: user.displayName || 'Unknown User',
                            photoURL: user.photoURL || 'images/default-avatar.png',
                            totalScore: totalScore
                        });
                    }
                }
            });

            leaderboardEntries.sort((a, b) => b.totalScore - a.totalScore);
            renderLeaderboard(leaderboardEntries);

        } catch (error) {
            console.error("Error loading leaderboard data:", error);
            if (leaderboardTableBody) leaderboardTableBody.innerHTML = `<tr><td colspan="4" style="text-align:center;">লিডারবোর্ড লোড করতে সমস্যা হয়েছে।</td></tr>`;
        } finally {
            if (leaderboardLoading) leaderboardLoading.style.display = 'none';
        }
    };

    const renderLeaderboard = (entries) => {
        if (!leaderboardTableBody) return;
        leaderboardTableBody.innerHTML = '';

        if (entries.length === 0) {
            leaderboardTableBody.innerHTML = `<tr><td colspan="4" style="text-align:center;">লিডারবোর্ডের জন্য কোনো ডেটা পাওয়া যায়নি।</td></tr>`;
            return;
        }

        entries.forEach((entry, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><span class="rank-badge">${index + 1}</span></td>
                <td>
                    <div class="user-cell">
                        <img src="${entry.photoURL}" alt="Profile" class="user-table-pic">
                        <span>${entry.displayName}</span>
                    </div>
                </td>
                <td><strong>${entry.totalScore}</strong></td>
                <td><button class="btn-sm btn-primary">Details</button></td>
            `;
            leaderboardTableBody.appendChild(tr);
        });
    };

    // --- Utility Function ---
    const formatTimestamp = (timestamp) => {
        if (!timestamp || !timestamp.toDate) return 'N/A';
        try {
            return timestamp.toDate().toLocaleString('bn-BD', { dateStyle: 'long', timeStyle: 'short' });
        } catch (e) {
            return 'Invalid Date';
        }
    };
});