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
    let allUsersCache = [];
    let allChaptersCache = new Set();

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
        loadNotificationHistory(); // Notification history load function
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
            if (allChaptersCache.size > 0 && chapterSelect.options.length <= 1) {
                populateChapterDropdown();
            }
            if (leaderboardTableBody.innerHTML.trim() === '') {
                loadLeaderboardForChapter(chapterSelect.value);
            }
        }
        if (sidebar) sidebar.classList.remove('is-visible');
    };

    const updateBreadcrumb = (currentPage) => {
        if (breadcrumbNav) breadcrumbNav.innerHTML = `<li class="breadcrumb-item"><a href="#">Admin</a></li><li class="breadcrumb-item active">${currentPage}</li>`;
    };

    const loadDashboardData = async () => {
        if (userListLoading) userListLoading.style.display = 'block';
        try {
            const usersSnapshot = await db.collection('users').get();
            allUsersCache = [];
            allChaptersCache.clear();
            usersSnapshot.forEach(doc => {
                const userData = { id: doc.id, ...doc.data() };
                allUsersCache.push(userData);
                const quizSources = [userData.chapters, userData.quiz_sets];
                quizSources.forEach(source => {
                    if (source && typeof source === 'object') {
                        Object.keys(source).forEach(key => allChaptersCache.add(key));
                    }
                });
            });
            allUsersCache.sort((a,b) => (a.displayName || '').localeCompare(b.displayName || ''));
            const adminCount = allUsersCache.filter(user => user.role === 'admin').length;
            totalUsersStat.textContent = allUsersCache.length;
            totalAdminsStat.textContent = adminCount;
            renderUserTable(allUsersCache);
            populateChapterDropdown();
        } catch (error) {
            console.error("Error loading dashboard data:", error);
        } finally {
            if (userListLoading) userListLoading.style.display = 'none';
        }
    };

    const renderUserTable = (users) => {
        userTableBody.innerHTML = '';
        users.forEach(user => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td><img src="${user.photoURL || 'images/default-avatar.png'}" class="table-profile-pic"></td><td>${user.displayName || 'N/A'}</td><td>${user.email || 'N/A'}</td><td><span class="role-badge role-${user.role || 'user'}">${user.role || 'user'}</span></td><td>${formatTimestamp(user.lastLogin)}</td><td class="action-cell"><select class="role-changer" data-user-id="${user.id}" data-current-role="${user.role || 'user'}"><option value="user" ${(!user.role || user.role === 'user') ? 'selected' : ''}>User</option><option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option></select></td>`;
            userTableBody.appendChild(tr);
        });
    };
    
    const handleUserTableActions = (e) => {
        if (e.target.classList.contains('role-changer')) {
            const select = e.target;
            const newRole = select.value;
            if (newRole !== select.dataset.currentRole && confirm(`আপনি কি ভূমিকা পরিবর্তন করতে নিশ্চিত?`)) {
                db.collection('users').doc(select.dataset.userId).update({ role: newRole });
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
        });
    };

    const handleHistoryDelete = (e) => {
        if (e.target.classList.contains('delete-notif-btn')) {
            if (confirm('আপনি কি এই বিজ্ঞপ্তিটি মুছে ফেলতে চান?')) {
                functions.httpsCallable('deleteNotification')({ docId: e.target.dataset.id });
            }
        }
    };
    
    const handleClearAllHistory = () => {
        if (confirm('আপনি কি সব বিজ্ঞপ্তি মুছে ফেলতে চান?')) {
            functions.httpsCallable('deleteAllNotifications')();
        }
    };

    const populateChapterDropdown = () => {
        if (!chapterSelect) return;
        chapterSelect.innerHTML = '<option value="">-- সকল বিষয় --</option>';
        [...allChaptersCache].sort().forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name.replace(/_/g, ' ');
            chapterSelect.appendChild(option);
        });
    };

    const loadLeaderboardForChapter = (chapterName) => {
        if (leaderboardLoading) leaderboardLoading.style.display = 'block';
        leaderboardTableBody.innerHTML = '';
        let leaderboardData = [];
        allUsersCache.forEach(user => {
            let totalScore = 0;
            let detailedScores = [];
            const processQuizSets = (quizSets) => {
                Object.keys(quizSets).forEach(setName => {
                    const setData = quizSets[setName];
                    const score = setData.totalScore || setData.score || 0;
                    if (!chapterName || chapterName === setName) {
                        totalScore += score;
                        detailedScores.push({ setName: setName.replace(/_/g, ' '), score: score, maxScore: setData.totalQuestions });
                    }
                });
            };
            if(user.quiz_sets) processQuizSets(user.quiz_sets);
            if(user.chapters && user.chapters[chapterName]?.quiz_sets) processQuizSets(user.chapters[chapterName].quiz_sets);
            if (totalScore > 0) {
                leaderboardData.push({ userName: user.displayName, userPhoto: user.photoURL, totalScore, detailedScores });
            }
        });
        renderLeaderboardTable(leaderboardData.sort((a, b) => b.totalScore - a.totalScore));
        if (leaderboardLoading) leaderboardLoading.style.display = 'none';
    };

    const renderLeaderboardTable = (data) => {
        leaderboardTableBody.innerHTML = '';
        if (data.length === 0) {
            leaderboardTableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">কোনো ডেটা নেই।</td></tr>';
            return;
        }
        data.forEach((entry, index) => {
            const tr = document.createElement('tr');
            const detailsJson = JSON.stringify(entry.detailedScores);
            tr.innerHTML = `<td>${index + 1}</td><td class="user-cell"><img src="${entry.userPhoto || 'images/default-avatar.png'}" class="table-profile-pic"><span>${entry.userName || 'N/A'}</span></td><td><strong>${entry.totalScore}</strong></td><td class="action-cell"><button class="btn-sm btn-view-details" data-user-name="${entry.userName}" data-details='${detailsJson}'>বিস্তারিত</button></td>`;
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

    const formatTimestamp = (ts) => (ts?.toDate) ? ts.toDate().toLocaleString('bn-BD') : 'N/A';
    
    const handleUserSearch = () => {
        const term = userSearchInput.value.toLowerCase();
        renderUserTable(allUsersCache.filter(u => (u.displayName || '').toLowerCase().includes(term) || (u.email || '').toLowerCase().includes(term)));
    };
});