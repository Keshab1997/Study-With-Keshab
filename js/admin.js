document.addEventListener('DOMContentLoaded', () => {
    console.log("Admin.js: DOM loaded, checking Firebase...");
    console.log("Firebase available:", typeof firebase !== 'undefined');
    
    // Check if firebase exists and has apps property
    if (typeof firebase === 'undefined') {
        console.error("Firebase SDK not loaded.");
        return;
    }
    
    // Check if firebase.apps exists before accessing length
    if (!firebase.apps || firebase.apps.length === 0) {
        console.error("Firebase not initialized.");
        return;
    }
    
    console.log("Firebase apps:", firebase.apps.length);
    console.log("Firebase initialized successfully, proceeding with admin panel...");
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
    let allUsersCache = []; // Caches user data for both dashboard and leaderboard

    auth.onAuthStateChanged(user => {
        if (user) {
            checkAdminRole(user);
        } else {
            showAccessDenied();
        }
    });

    const checkAdminRole = async (user) => {
        console.log("checkAdminRole: Checking role for user", user.uid, user.email);
        try {
            const doc = await db.collection('users').doc(user.uid).get();
            console.log("checkAdminRole: User doc exists:", doc.exists);
            if (doc.exists) {
                console.log("checkAdminRole: User data:", doc.data());
            }
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
        loadAllUserData(); // Load all data once
        loadNotificationHistory();
    };
    
    // --- ডেটা লোডিং এবং ক্যাশিং ---
    const loadAllUserData = async () => {
        console.log("loadAllUserData: Starting to load user data...");
        if (userListLoading) userListLoading.style.display = 'block';
        try {
            console.log("loadAllUserData: Attempting Firestore query...");
            const usersSnapshot = await db.collection('users').get();
            console.log("loadAllUserData: Query successful, got", usersSnapshot.docs.length, "users");
            allUsersCache = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            // ড্যাশবোর্ড ডেটা সেট করুন
            const adminCount = allUsersCache.filter(user => user.role === 'admin').length;
            console.log("loadAllUserData: Total users:", allUsersCache.length, "Admins:", adminCount);
            totalUsersStat.textContent = allUsersCache.length;
            totalAdminsStat.textContent = adminCount;
            console.log("loadAllUserData: Updated dashboard stats");
            renderUserTable(allUsersCache);
            
            // লিডারবোর্ডের ড্রপডাউন তৈরি করুন
            populateChapterDropdownFromCache();

        } catch (error) {
            console.error("Error loading all user data:", error);
            console.error("Error details:", error.code, error.message);
        } finally {
            if (userListLoading) userListLoading.style.display = 'none';
        }
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
            // লিডারবোর্ড ডেটা লোড করুন
            loadLeaderboardForChapter(chapterSelect.value);
        }
        if (sidebar) sidebar.classList.remove('is-visible');
    };

    const updateBreadcrumb = (currentPage) => {
        if (breadcrumbNav) breadcrumbNav.innerHTML = `<li class="breadcrumb-item"><a href="#">Admin</a></li><li class="breadcrumb-item active">${currentPage}</li>`;
    };

    // --- ড্যাশবোর্ড ফাংশন (ব্যবহারকারীর তালিকা) ---
    const renderUserTable = (users) => {
        userTableBody.innerHTML = '';
        users.sort((a,b) => (a.displayName || '').localeCompare(b.displayName || ''));
        users.forEach(user => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td><img src="${user.photoURL || 'images/default-avatar.png'}" class="table-profile-pic"></td><td>${user.displayName || 'N/A'}</td><td>${user.email || 'N/A'}</td><td><span class="role-badge role-${user.role || 'user'}">${user.role || 'user'}</span></td><td>${formatTimestamp(user.lastLogin)}</td><td class="action-cell"><select class="role-changer" data-user-id="${user.id}" data-current-role="${user.role || 'user'}"><option value="user" ${(!user.role || user.role === 'user') ? 'selected' : ''}>User</option><option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option></select></td>`;
            userTableBody.appendChild(tr);
        });
    };
    
    // --- লিডারবোর্ড ফাংশন (আপনার বর্তমান ডেটা স্ট্রাকচার অনুযায়ী) ---
    
    const populateChapterDropdownFromCache = () => {
        if (!chapterSelect) return;
        const allChapters = new Set();
        
        allUsersCache.forEach(user => {
            // "chapters" অবজেক্ট থেকে চ্যাপ্টারের নাম নিন
            if (user.chapters && typeof user.chapters === 'object') {
                Object.keys(user.chapters).forEach(chapterName => allChapters.add(chapterName));
            }
            // রুট লেভেলের "quiz_sets" থেকেও নাম নিন (যদি থাকে)
            if (user.quiz_sets && typeof user.quiz_sets === 'object') {
                Object.keys(user.quiz_sets).forEach(setName => allChapters.add(setName));
            }
        });

        chapterSelect.innerHTML = '<option value="">-- সকল বিষয় --</option>';
        [...allChapters].sort().forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name.replace(/_/g, ' ');
            chapterSelect.appendChild(option);
        });
    };

    const loadLeaderboardForChapter = (selectedChapter) => {
        if (leaderboardLoading) leaderboardLoading.style.display = 'block';
        leaderboardTableBody.innerHTML = '';
        
        let leaderboardData = [];

        allUsersCache.forEach(user => {
            let totalScore = 0;
            let detailedScores = [];

            const processQuizData = (quizSets, chapterContext) => {
                if (quizSets && typeof quizSets === 'object') {
                    Object.keys(quizSets).forEach(setName => {
                        const scoreData = quizSets[setName];
                        // যদি কোনো চ্যাপ্টার সিলেক্ট করা না থাকে, অথবা বর্তমান চ্যাপ্টার/সেটটি সিলেক্টেড চ্যাপ্টারের সাথে মেলে
                        if (!selectedChapter || chapterContext === selectedChapter || setName === selectedChapter) {
                            const score = scoreData.score || scoreData.totalScore || 0;
                            totalScore += score;
                            detailedScores.push({
                                setName: setName.replace(/_/g, ' '),
                                score: score,
                                maxScore: scoreData.totalQuestions || 'N/A'
                            });
                        }
                    });
                }
            };
            
            // রুট লেভেলের quiz_sets থেকে ডেটা প্রসেস করুন
            processQuizData(user.quiz_sets, null); 

            // chapters অবজেক্টের ভেতরের quiz_sets থেকে ডেটা প্রসেস করুন
            if (user.chapters && typeof user.chapters === 'object') {
                Object.keys(user.chapters).forEach(chapterName => {
                    processQuizData(user.chapters[chapterName].quiz_sets, chapterName);
                });
            }

            if (totalScore > 0) {
                leaderboardData.push({
                    userName: user.displayName,
                    userPhoto: user.photoURL,
                    totalScore,
                    detailedScores
                });
            }
        });

        // মোট স্কোরের ভিত্তিতে র‍্যাঙ্কিং
        leaderboardData.sort((a, b) => b.totalScore - a.totalScore);
        
        renderLeaderboardTable(leaderboardData);
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

    const formatTimestamp = (ts) => (ts?.toDate) ? ts.toDate().toLocaleString('bn-BD') : 'N/A';
    
    const handleUserSearch = () => {
        const term = userSearchInput.value.toLowerCase();
        renderUserTable(allUsersCache.filter(u => (u.displayName || '').toLowerCase().includes(term) || (u.email || '').toLowerCase().includes(term)));
    };
});