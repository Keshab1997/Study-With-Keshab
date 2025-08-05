document.addEventListener('DOMContentLoaded', () => {

    if (typeof firebase === 'undefined' || !firebase.apps.length) {
        console.error("Firebase SDK not loaded or initialized.");
        return;
    }
    const auth = firebase.auth();
    const db = firebase.firestore();
    const functions = firebase.functions();

    // --- DOM Element References ---
    const adminPageContainer = document.querySelector('.admin-page-container');
    const accessDeniedMessage = document.getElementById('access-denied');
    const pageTitle = document.getElementById('page-title');
    const breadcrumbNav = document.getElementById('breadcrumb-nav');
    const sidebar = document.querySelector('.sidebar');
    const navDashboard = document.querySelector('#nav-dashboard')?.parentElement;
    const navLeaderboard = document.querySelector('#nav-leaderboard')?.parentElement;
    const adminInfoSidebar = document.getElementById('admin-info-sidebar');
    const adminProfilePicSidebar = document.getElementById('admin-profile-pic-sidebar');
    const adminNameSidebar = document.getElementById('admin-name-sidebar');
    const adminLogoutBtn = document.getElementById('admin-logout-btn');
    const dashboardContent = document.getElementById('dashboard-content');
    const leaderboardContent = document.getElementById('leaderboard-content');
    const totalUsersStat = document.getElementById('total-users');
    const totalAdminsStat = document.getElementById('total-admins');
    const userTableBody = document.getElementById('user-table-body');
    const userSearchInput = document.getElementById('user-search-input');
    const userListLoading = document.getElementById('user-list-loading');
    const notificationForm = document.getElementById('notification-form');
    const notificationStatus = document.getElementById('notification-status');
    const notificationHistoryBody = document.getElementById('notification-history-body');
    const clearAllHistoryBtn = document.getElementById('clear-all-history-btn');
    const notificationHistoryLoading = document.getElementById('notification-history-loading');
    const chapterSelect = document.getElementById('chapter-select');
    const leaderboardTableBody = document.getElementById('leaderboard-table-body');
    const leaderboardLoading = document.getElementById('leaderboard-loading');
    const scoreDetailsModal = document.getElementById('score-details-modal');
    const modalCloseButton = document.querySelector('#score-details-modal .close-button');
    const modalUserName = document.getElementById('modal-user-name');
    const modalScoreTableBody = document.getElementById('modal-score-table-body');
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    let allUsersCache = []; // Caches user list for dashboard
    let chapterDropdownPopulated = false; // Flag to check if dropdown is filled

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

    const showAccessDenied = () => {
        if (adminPageContainer) adminPageContainer.style.display = 'none';
        if (accessDeniedMessage) accessDeniedMessage.style.display = 'flex';
    };

    const initializeAdminPanel = (user, adminData) => {
        accessDeniedMessage.style.display = 'none';
        adminPageContainer.style.display = 'flex';
        adminNameSidebar.textContent = adminData.displayName || 'Admin';
        adminProfilePicSidebar.src = adminData.photoURL || 'images/default-avatar.png';
        adminInfoSidebar.style.display = 'flex';
        setupEventListeners();
        loadDashboardData();
        loadNotificationHistory();
    };

    const setupEventListeners = () => {
        if (navDashboard) navDashboard.addEventListener('click', (e) => { e.preventDefault(); switchTab('dashboard'); });
        if (navLeaderboard) navLeaderboard.addEventListener('click', (e) => { e.preventDefault(); switchTab('leaderboard'); });
        if (adminLogoutBtn) adminLogoutBtn.addEventListener('click', (e) => { e.preventDefault(); auth.signOut().then(() => { window.location.href = 'index.html'; }); });
        if (userSearchInput) userSearchInput.addEventListener('input', handleUserSearch);
        if (chapterSelect) chapterSelect.addEventListener('change', () => {
            loadLeaderboardForChapter(chapterSelect.value);
        });
        if (userTableBody) userTableBody.addEventListener('click', handleUserTableActions);
        if (leaderboardTableBody) leaderboardTableBody.addEventListener('click', handleLeaderboardTableActions);
        if (modalCloseButton) modalCloseButton.addEventListener('click', () => scoreDetailsModal.style.display = 'none');
        if (scoreDetailsModal) window.addEventListener('click', (event) => { if (event.target === scoreDetailsModal) scoreDetailsModal.style.display = 'none'; });
        if (mobileMenuToggle && sidebar) mobileMenuToggle.addEventListener('click', () => { sidebar.classList.toggle('is-visible'); });
        if (notificationForm) notificationForm.addEventListener('submit', handleNotificationSubmit);
        if (notificationHistoryBody) notificationHistoryBody.addEventListener('click', handleHistoryDelete);
        if (clearAllHistoryBtn) clearAllHistoryBtn.addEventListener('click', handleClearAllHistory);
    };

    const switchTab = (tabName) => {
        document.querySelectorAll('.sidebar-nav li').forEach(li => li.classList.remove('active'));
        dashboardContent.style.display = 'none';
        leaderboardContent.style.display = 'none';

        if (tabName === 'dashboard') {
            if (navDashboard) navDashboard.classList.add('active');
            dashboardContent.style.display = 'block';
            pageTitle.textContent = 'ড্যাশবোর্ড';
            updateBreadcrumb('Dashboard');
        } else if (tabName === 'leaderboard') {
            if (navLeaderboard) navLeaderboard.classList.add('active');
            leaderboardContent.style.display = 'block';
            pageTitle.textContent = 'লিডারবোর্ড';
            updateBreadcrumb('Leaderboard');
            // Load chapters and leaderboard data only when tab is opened
            if (!chapterDropdownPopulated) {
                populateChapterDropdown();
            }
            loadLeaderboardForChapter(chapterSelect.value);
        }
        if (sidebar) sidebar.classList.remove('is-visible');
    };

    const updateBreadcrumb = (currentPage) => {
        if (breadcrumbNav) breadcrumbNav.innerHTML = `<li class="breadcrumb-item"><a href="#">Admin</a></li><li class="breadcrumb-item active">${currentPage}</li>`;
    };

    // --- ড্যাশবোর্ড ফাংশন (ব্যবহারকারীর তালিকা) ---
    const loadDashboardData = async () => {
        if (userListLoading) userListLoading.style.display = 'block';
        try {
            const usersSnapshot = await db.collection('users').get();
            allUsersCache = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            allUsersCache.sort((a,b) => (a.displayName || '').localeCompare(b.displayName || ''));
            
            const adminCount = allUsersCache.filter(user => user.role === 'admin').length;
            totalUsersStat.textContent = allUsersCache.length;
            totalAdminsStat.textContent = adminCount;
            renderUserTable(allUsersCache);
        } catch (error) {
            console.error("Error loading dashboard data:", error);
        } finally {
            if (userListLoading) userListLoading.style.display = 'none';
        }
    };
    
    const renderUserTable = (users) => {
        userTableBody.innerHTML = '';
        if (!users || users.length === 0) {
            userTableBody.innerHTML = `<tr><td colspan="6">কোনো ব্যবহারকারী পাওয়া যায়নি।</td></tr>`;
            return;
        }
        users.forEach(user => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td><img src="${user.photoURL || 'images/default-avatar.png'}" class="table-profile-pic"></td><td>${user.displayName || 'N/A'}</td><td>${user.email || 'N/A'}</td><td><span class="role-badge role-${user.role || 'user'}">${user.role || 'user'}</span></td><td>${formatTimestamp(user.lastLogin)}</td><td class="action-cell"><select class="role-changer" data-user-id="${user.id}" data-current-role="${user.role || 'user'}"><option value="user" ${(!user.role || user.role === 'user') ? 'selected' : ''}>User</option><option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option></select></td>`;
            userTableBody.appendChild(tr);
        });
    };
    
    // --- লিডারবোর্ড ফাংশন (নতুন এবং উন্নত) ---

    /**
     * নতুন `quiz_scores` কালেকশন থেকে সব ইউনিক চ্যাপ্টারের নাম নিয়ে ড্রপডাউন তৈরি করে।
     */
    const populateChapterDropdown = async () => {
        if (!chapterSelect) return;
        try {
            const scoresSnapshot = await db.collection('quiz_scores').get();
            const chapterNames = new Set();
            scoresSnapshot.forEach(doc => {
                if (doc.data().chapter) {
                    chapterNames.add(doc.data().chapter);
                }
            });

            chapterSelect.innerHTML = '<option value="">-- সকল বিষয় --</option>';
            [...chapterNames].sort().forEach(name => {
                const option = document.createElement('option');
                option.value = name;
                option.textContent = name.replace(/_/g, ' ');
                chapterSelect.appendChild(option);
            });
            chapterDropdownPopulated = true;
        } catch (error) {
            console.error("Error populating chapter dropdown:", error);
        }
    };

    /**
     * `quiz_scores` কালেকশন থেকে ডেটা নিয়ে লিডারবোর্ড তৈরি করে।
     * এটি অনেক বেশি কার্যকর কারণ এটি সরাসরি স্কোর ডেটা নিয়ে কাজ করে।
     */
    const loadLeaderboardForChapter = async (chapterName) => {
        if (leaderboardLoading) leaderboardLoading.style.display = 'block';
        leaderboardTableBody.innerHTML = '';

        try {
            let query = db.collection('quiz_scores');
            
            // যদি কোনো নির্দিষ্ট চ্যাপ্টার সিলেক্ট করা হয়, তবে সেই অনুযায়ী ফিল্টার করে
            if (chapterName) {
                query = query.where("chapter", "==", chapterName);
            }
            
            const snapshot = await query.get();

            if (snapshot.empty) {
                leaderboardTableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">কোনো ডেটা নেই।</td></tr>';
                if (leaderboardLoading) leaderboardLoading.style.display = 'none';
                return;
            }

            // ব্যবহারকারী অনুযায়ী স্কোর একত্রিত করার জন্য একটি অবজেক্ট
            const userScores = {};

            snapshot.forEach(doc => {
                const data = doc.data();
                const userId = data.userId;

                if (!userScores[userId]) {
                    userScores[userId] = {
                        userName: data.displayName,
                        userPhoto: data.photoURL,
                        totalScore: 0,
                        detailedScores: []
                    };
                }
                
                // মোট স্কোর যোগ করা
                userScores[userId].totalScore += data.score || 0;
                
                // বিস্তারিত স্কোরের জন্য তথ্য যোগ করা
                userScores[userId].detailedScores.push({
                    setName: data.setName.replace(/_/g, ' '),
                    score: data.score || 0,
                    maxScore: data.totalQuestions || 'N/A'
                });
            });

            // অবজেক্টটিকে একটি অ্যারেতে পরিণত করা
            const leaderboardData = Object.values(userScores);
            
            // মোট স্কোরের ভিত্তিতে র‍্যাঙ্কিং করা
            leaderboardData.sort((a, b) => b.totalScore - a.totalScore);
            
            renderLeaderboardTable(leaderboardData);

        } catch (error) {
            console.error("Error loading leaderboard data:", error);
            leaderboardTableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">ডেটা লোড করতে সমস্যা হয়েছে।</td></tr>';
        } finally {
            if (leaderboardLoading) leaderboardLoading.style.display = 'none';
        }
    };
    
    const renderLeaderboardTable = (data) => {
        leaderboardTableBody.innerHTML = '';
        if (data.length === 0) {
            leaderboardTableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">কোনো ডেটা নেই।</td></tr>';
            return;
        }
        data.forEach((entry, index) => {
            const tr = document.createElement('tr');
            // HTML স্পেশাল ক্যারেক্টার সমস্যা এড়ানোর জন্য data-details অ্যাট্রিবিউট সঠিকভাবে সেট করা
            const detailsJson = JSON.stringify(entry.detailedScores).replace(/'/g, "&apos;");
            tr.innerHTML = `<td>${index + 1}</td>
                            <td class="user-cell"><img src="${entry.userPhoto || 'images/default-avatar.png'}" class="table-profile-pic"><span>${entry.userName || 'N/A'}</span></td>
                            <td><strong>${entry.totalScore}</strong></td>
                            <td class="action-cell"><button class="btn-sm btn-view-details" data-user-name="${entry.userName}" data-details='${detailsJson}'>বিস্তারিত</button></td>`;
            leaderboardTableBody.appendChild(tr);
        });
    };

    const handleLeaderboardTableActions = (e) => {
        if (e.target.classList.contains('btn-view-details')) {
            const button = e.target;
            showScoreDetailsModal(button.dataset.userName, JSON.parse(button.dataset.details));
        }
    };
    
    const showScoreDetailsModal = (userName, details) => {
        modalUserName.textContent = `${userName}-এর বিস্তারিত স্কোর`;
        modalScoreTableBody.innerHTML = '';
        details.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${item.setName}</td><td>${item.score || 0}</td><td>${item.maxScore || 'N/A'}</td>`;
            modalScoreTableBody.appendChild(tr);
        });
        scoreDetailsModal.style.display = 'flex';
    };

    // --- অন্যান্য ফাংশন ---

    const handleUserTableActions = (e) => {
        if (e.target.classList.contains('role-changer')) {
            const select = e.target;
            const newRole = select.value;
            if (newRole !== select.dataset.currentRole && confirm(`আপনি কি ভূমিকা পরিবর্তন করতে নিশ্চিত?`)) {
                db.collection('users').doc(select.dataset.userId).update({ role: newRole })
                .then(() => {
                    select.dataset.currentRole = newRole;
                    // আপডেট করার পর টেবিল রিলোড না করে শুধু ব্যাজ পরিবর্তন করা
                    const roleBadge = select.closest('tr').querySelector('.role-badge');
                    roleBadge.textContent = newRole;
                    roleBadge.className = `role-badge role-${newRole}`;

                }).catch(err => {
                    console.error("Role change failed: ", err);
                    select.value = select.dataset.currentRole; // ব্যর্থ হলে আগের অবস্থায় ফিরে যাওয়া
                });
            } else {
                select.value = select.dataset.currentRole;
            }
        }
    };

    const handleNotificationSubmit = async (e) => {
        e.preventDefault();
        const button = e.target.querySelector('button');
        button.disabled = true;
        try {
            await db.collection('notificationQueue').add({
                title: document.getElementById('notification-title').value,
                body: document.getElementById('notification-body').value,
                link: document.getElementById('notification-link').value
            });
            notificationStatus.className = 'status-success';
            notificationStatus.textContent = 'নোটিফিকেশন সফলভাবে পাঠানো হয়েছে।';
            notificationForm.reset();
        } catch (error) {
            notificationStatus.className = 'status-danger';
            notificationStatus.textContent = 'ত্রুটি! আবার চেষ্টা করুন।';
        }
        notificationStatus.style.display = 'block';
        button.disabled = false;
        setTimeout(() => { notificationStatus.style.display = 'none'; }, 5000);
    };

    const loadNotificationHistory = () => {
        if (notificationHistoryLoading) notificationHistoryLoading.style.display = 'block';
        db.collection('notifications').orderBy('createdAt', 'desc').limit(20).onSnapshot(snapshot => {
            notificationHistoryBody.innerHTML = '';
            snapshot.forEach(doc => {
                const notif = doc.data();
                const tr = document.createElement('tr');
                tr.innerHTML = `<td>${notif.title}</td><td>${notif.body}</td><td>${formatTimestamp(notif.createdAt)}</td><td class="action-cell"><button class="btn-danger btn-sm delete-notif-btn" data-id="${doc.id}">মুছুন</button></td>`;
                notificationHistoryBody.appendChild(tr);
            });
            if (notificationHistoryLoading) notificationHistoryLoading.style.display = 'none';
        }, err => {
            console.error("Error loading notification history: ", err);
            if (notificationHistoryLoading) notificationHistoryLoading.style.display = 'none';
        });
    };

    const handleHistoryDelete = (e) => {
        if (e.target.classList.contains('delete-notif-btn')) {
            if (confirm('আপনি কি এই বিজ্ঞপ্তিটি মুছে ফেলতে চান?')) {
                const docId = e.target.dataset.id;
                db.collection('notifications').doc(docId).delete().catch(err => console.error("Error deleting notification:", err));
            }
        }
    };
    
    const handleClearAllHistory = () => {
        if (confirm('আপনি কি সব বিজ্ঞপ্তি মুছে ফেলতে চান? এই কাজটি ফেরানো যাবে না।')) {
            const deleteAllNotifications = functions.httpsCallable('deleteAllNotifications');
            deleteAllNotifications().catch(err => console.error("Error clearing all notifications:", err));
        }
    };

    const formatTimestamp = (ts) => (ts?.toDate) ? ts.toDate().toLocaleString('bn-BD') : 'N/A';
    
    const handleUserSearch = () => {
        const term = userSearchInput.value.toLowerCase();
        renderUserTable(allUsersCache.filter(u => (u.displayName || '').toLowerCase().includes(term) || (u.email || '').toLowerCase().includes(term)));
    };
});