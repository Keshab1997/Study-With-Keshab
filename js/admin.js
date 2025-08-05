document.addEventListener('DOMContentLoaded', () => {

    // --- Firebase Initialization Check ---
    if (typeof firebase === 'undefined' || typeof firebase.auth === 'undefined' || typeof firebase.firestore === 'undefined') {
        console.error("Firebase is not initialized correctly.");
        document.body.innerHTML = "<h1>Firebase কনফিগারেশন ত্রুটি। অনুগ্রহ করে কনসোল চেক করুন।</h1>";
        return;
    }
    const auth = firebase.auth();
    const db = firebase.firestore();

    // ... (আপনার বাকি সব DOM Element References এখানে থাকবে, কোনো পরিবর্তন নেই) ...
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


    // --- Authentication Check ---
    auth.onAuthStateChanged(user => {
        if (user) {
            checkAdminRole(user); // সমস্যাটি এই ফাংশনে, তাই এখানে ডিবাগিং যোগ করা হয়েছে
        } else {
            console.log("No user is logged in. Showing access denied.");
            showAccessDenied();
        }
    });

    // ===============================================================
    //               ডিবাগিং এর জন্য পরিবর্তিত ফাংশন
    // ===============================================================
    const checkAdminRole = async (user) => {
        // ডিবাগিং ধাপ ১: ব্যবহারকারীর তথ্য প্রিন্ট করা
        console.log("STEP 1: Checking admin role for user:", user.uid, user.email);

        try {
            const userDocRef = db.collection('users').doc(user.uid);
            
            // ডিবাগিং ধাপ ২: ডকুমেন্ট রেফারেন্স ঠিক আছে কিনা দেখা
            console.log("STEP 2: Created Firestore document reference. Path:", userDocRef.path);

            const doc = await userDocRef.get();

            // ডিবাগিং ধাপ ৩: ডকুমেন্ট পাওয়া গেল কিনা এবং তার ডেটা কী
            if (doc.exists) {
                console.log("STEP 3: Document found in Firestore.");
                const userData = doc.data();
                console.log("STEP 4: User data is:", userData);
                
                // ডিবাগিং ধাপ ৪: Role ঠিক আছে কিনা চূড়ান্তভাবে চেক করা
                if (userData.role === 'admin') {
                    console.log("STEP 5: SUCCESS! User role is 'admin'. Initializing panel...");
                    initializeAdminPanel(user, userData);
                } else {
                    console.error("STEP 5: FAILED! User role is not 'admin'. Role found:", userData.role);
                    showAccessDenied();
                }
            } else {
                console.error("STEP 3: FAILED! User document does not exist in Firestore for UID:", user.uid);
                showAccessDenied();
            }
        } catch (error) {
            // ডিবাগিং ধাপ ৫: Firestore থেকে ডেটা পড়ার সময় কোনো এরর হলো কিনা
            console.error("STEP X: CRITICAL ERROR! Could not fetch user document from Firestore.", error);
            console.log("This is likely a Firestore Rules issue. The rule for 'get' on '/users/{userId}' might be denying access.");
            showAccessDenied();
        }
    };
    // ===============================================================

    const showAccessDenied = () => {
        if (adminPageContainer) adminPageContainer.style.display = 'none';
        if (accessDeniedMessage) accessDeniedMessage.style.display = 'flex';
    };

    const initializeAdminPanel = (user, adminData) => {
        // ... (এই ফাংশন এবং এর পরের সব ফাংশন আপনার আগের কোডের মতোই অপরিবর্তিত থাকবে) ...
        accessDeniedMessage.style.display = 'none';
        adminPageContainer.style.display = 'flex';
        adminNameSidebar.textContent = adminData.displayName || 'Admin';
        adminProfilePicSidebar.src = adminData.photoURL || 'images/default-avatar.png';
        adminInfoSidebar.style.display = 'flex';
        setupEventListeners();
        loadDashboardData();
    };

    const setupEventListeners = () => {
        if(navDashboard) navDashboard.addEventListener('click', (e) => { e.preventDefault(); switchTab('dashboard'); });
        if(navLeaderboard) navLeaderboard.addEventListener('click', (e) => { e.preventDefault(); switchTab('leaderboard'); });
        if(adminLogoutBtn) adminLogoutBtn.addEventListener('click', (e) => { e.preventDefault(); auth.signOut().then(() => { window.location.href = 'index.html'; }); });
        if(userSearchInput) userSearchInput.addEventListener('input', handleUserSearch);
        
        if(chapterSelect) {
            chapterSelect.addEventListener('change', () => {
                const chapterName = chapterSelect.value;
                if (chapterName) {
                    loadLeaderboardForChapter(chapterName);
                } else {
                    if(leaderboardTableBody) leaderboardTableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">অনুগ্রহ করে একটি বিষয় নির্বাচন করুন।</td></tr>';
                }
            });
        }
        
        if(userTableBody) userTableBody.addEventListener('click', handleUserTableActions);
        if(leaderboardTableBody) leaderboardTableBody.addEventListener('click', handleLeaderboardTableActions);
        if(modalCloseButton) modalCloseButton.addEventListener('click', () => scoreDetailsModal.style.display = 'none');
        if(scoreDetailsModal) window.addEventListener('click', (event) => { if (event.target === scoreDetailsModal) { scoreDetailsModal.style.display = 'none'; } });
        if(mobileMenuToggle && sidebar) mobileMenuToggle.addEventListener('click', () => { sidebar.classList.toggle('is-visible'); });
        
        if (notificationForm) notificationForm.addEventListener('submit', handleNotificationSubmit);
    };

    const switchTab = (tabName) => {
        document.querySelectorAll('.sidebar-nav li').forEach(li => li.classList.remove('active'));
        dashboardContent.style.display = 'none';
        leaderboardContent.style.display = 'none';
        
        if (tabName === 'dashboard') {
            if(navDashboard) navDashboard.classList.add('active');
            dashboardContent.style.display = 'block';
            pageTitle.textContent = 'ড্যাশবোর্ড';
            updateBreadcrumb('Dashboard');
        } else if (tabName === 'leaderboard') {
            if(navLeaderboard) navLeaderboard.classList.add('active');
            leaderboardContent.style.display = 'block';
            pageTitle.textContent = 'লিডারবোর্ড';
            updateBreadcrumb('Leaderboard');
            if (allChaptersCache.size > 0 && chapterSelect.options.length <= 1) {
                populateChapterDropdown();
            }
             if (leaderboardTableBody.innerHTML.trim() === '') {
                leaderboardTableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">অনুগ্রহ করে একটি বিষয় নির্বাচন করুন।</td></tr>';
            }
        }
        if(sidebar) sidebar.classList.remove('is-visible');
    };
    
    const updateBreadcrumb = (currentPage) => {
        if(breadcrumbNav) breadcrumbNav.innerHTML = `<li class="breadcrumb-item"><a href="#">Admin</a></li><li class="breadcrumb-item active" aria-current="page">${currentPage}</li>`;
    };

    const loadDashboardData = async () => {
        if(userListLoading) userListLoading.style.display = 'block';
        if(userTableBody) userTableBody.innerHTML = '';
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
            let adminCount = allUsersCache.filter(user => user.role === 'admin').length;
            totalUsersStat.textContent = allUsersCache.length;
            totalAdminsStat.textContent = adminCount;
            renderUserTable(allUsersCache);
            populateChapterDropdown();
        } catch (error) {
            console.error("Error loading dashboard data: ", error);
            if(userTableBody) userTableBody.innerHTML = '<tr><td colspan="6">ব্যবহারকারীদের তালিকা লোড করতে সমস্যা হয়েছে।</td></tr>';
        } finally {
            if(userListLoading) userListLoading.style.display = 'none';
        }
    };

    const renderUserTable = (users) => {
        if(!userTableBody) return;
        userTableBody.innerHTML = '';
        if (users.length === 0) {
            userTableBody.innerHTML = '<tr><td colspan="6">কোনো ব্যবহারকারী পাওয়া যায়নি।</td></tr>';
            return;
        }
        users.forEach(user => {
            const lastLogin = formatTimestamp(user.lastLogin);
            const tr = document.createElement('tr');
            tr.dataset.userId = user.id;
            tr.innerHTML = `
                <td><img src="${user.photoURL || 'images/default-avatar.png'}" alt="Profile Pic" class="table-profile-pic"></td>
                <td>${user.displayName || 'N/A'}</td>
                <td>${user.email || 'N/A'}</td>
                <td><span class="role-badge role-${user.role || 'user'}">${user.role || 'user'}</span></td>
                <td>${lastLogin}</td>
                <td class="action-cell">
                    <select class="role-changer" data-user-id="${user.id}" data-current-role="${user.role || 'user'}">
                        <option value="user" ${(!user.role || user.role === 'user') ? 'selected' : ''}>User</option>
                        <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                    </select>
                </td>
            `;
            userTableBody.appendChild(tr);
        });
    };

    const handleUserSearch = () => {
        const searchTerm = userSearchInput.value.toLowerCase().trim();
        const filteredUsers = allUsersCache.filter(user => (user.displayName || '').toLowerCase().includes(searchTerm) || (user.email || '').toLowerCase().includes(searchTerm));
        renderUserTable(filteredUsers);
    };
    
    const handleUserTableActions = (e) => {
        if (e.target.classList.contains('role-changer')) {
            const select = e.target;
            const userId = select.dataset.userId;
            const currentRole = select.dataset.currentRole;
            const newRole = select.value;
            if (newRole !== currentRole && confirm(`আপনি কি এই ব্যবহারকারীর ভূমিকা "${currentRole}" থেকে "${newRole}" এ পরিবর্তন করতে নিশ্চিত?`)) {
                updateUserRole(userId, newRole);
            } else {
                select.value = currentRole;
            }
        }
    };
    
    const updateUserRole = async (userId, newRole) => {
        try {
            await db.collection('users').doc(userId).update({ role: newRole });
            alert('ভূমিকা সফলভাবে আপডেট করা হয়েছে!');
            const userInCache = allUsersCache.find(u => u.id === userId);
            if(userInCache) userInCache.role = newRole;
            let adminCount = allUsersCache.filter(user => user.role === 'admin').length;
            totalAdminsStat.textContent = adminCount;
            handleUserSearch();
        } catch (error) {
            console.error("Error updating role:", error);
            alert('ভূমিকা আপডেট করতে সমস্যা হয়েছে।');
            handleUserSearch();
        }
    };

    const handleNotificationSubmit = async (e) => {
        e.preventDefault();
        const title = document.getElementById('notification-title').value;
        const body = document.getElementById('notification-body').value;
        const link = document.getElementById('notification-link').value;
        const button = e.target.querySelector('button');

        if (!title || !body) {
            alert('শিরোনাম এবং বার্তা উভয়ই পূরণ করুন।');
            return;
        }
        
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> পাঠানো হচ্ছে...';
        
        try {
            await db.collection('notificationQueue').add({ title, body, link });
            if(notificationStatus) {
                notificationStatus.textContent = 'সফলভাবে নোটিফিকেশন পাঠানোর অনুরোধ জমা হয়েছে।';
                notificationStatus.className = 'status-success';
                notificationStatus.style.display = 'block';
            }
            if(notificationForm) notificationForm.reset();
        } catch (error) {
            console.error('Error sending notification request: ', error);
            if(notificationStatus) {
                notificationStatus.textContent = 'ত্রুটি! অনুরোধ পাঠাতে সমস্যা হয়েছে।';
                notificationStatus.className = 'status-danger';
                notificationStatus.style.display = 'block';
            }
        } finally {
            button.disabled = false;
            button.innerHTML = '<i class="fas fa-paper-plane"></i> সব ব্যবহারকারীকে পাঠান';
            setTimeout(() => { if(notificationStatus) notificationStatus.style.display = 'none'; }, 6000);
        }
    };

    const populateChapterDropdown = () => {
        if(!chapterSelect) return;
        chapterSelect.innerHTML = '<option value="">-- বিষয় বাছুন --</option>';
        const sortedChapters = [...allChaptersCache].sort();
        sortedChapters.forEach(chapterName => {
            const option = document.createElement('option');
            option.value = chapterName;
            option.textContent = chapterName.replace(/_/g, ' ');
            chapterSelect.appendChild(option);
        });
    };

    const loadLeaderboardForChapter = (chapterName) => {
        if(leaderboardLoading) leaderboardLoading.style.display = 'block';
        if(leaderboardTableBody) leaderboardTableBody.innerHTML = '';
        
        const leaderboardData = [];
        
        allUsersCache.forEach(user => {
            let quizSets = null;
            if (user.quiz_sets && user.quiz_sets[chapterName]) {
                 quizSets = { [chapterName]: user.quiz_sets[chapterName] };
            } else if (user.chapters && user.chapters[chapterName] && user.chapters[chapterName].quiz_sets) {
                quizSets = user.chapters[chapterName].quiz_sets;
            }
            
            if (quizSets) {
                let chapterTotalScore = 0;
                const detailedScoresForModal = [];
                Object.keys(quizSets).forEach(setName => {
                    const setData = quizSets[setName];
                    const score = setData.totalScore || setData.score || 0;
                    chapterTotalScore += score;
                    detailedScoresForModal.push({ setName: setName.replace(/_/g, ' '), score: score, maxScore: setData.totalQuestions });
                });
                
                if (chapterTotalScore > 0) {
                    leaderboardData.push({ 
                        userId: user.id, 
                        userName: user.displayName, 
                        userPhoto: user.photoURL, 
                        totalScore: chapterTotalScore, 
                        detailedScores: detailedScoresForModal 
                    });
                }
            }
        });
        
        leaderboardData.sort((a, b) => b.totalScore - a.totalScore);
        renderLeaderboardTable(leaderboardData);
        if(leaderboardLoading) leaderboardLoading.style.display = 'none';
    };
    
    const renderLeaderboardTable = (data) => {
        if(!leaderboardTableBody) return;
        leaderboardTableBody.innerHTML = '';
        if (data.length === 0) {
            leaderboardTableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">এই বিষয়ের জন্য কোনো লিডারবোর্ড ডেটা নেই।</td></tr>';
            return;
        }
        data.forEach((entry, index) => {
            const tr = document.createElement('tr');
            const detailsJson = JSON.stringify(entry.detailedScores || []);
            const userName = entry.userName || 'Unknown User';
            tr.innerHTML = `
                <td>${index + 1}</td>
                <td class="user-cell"><img src="${entry.userPhoto || 'images/default-avatar.png'}" alt="Profile Pic" class="table-profile-pic"><span>${userName}</span></td>
                <td><strong>${entry.totalScore}</strong></td>
                <td class="action-cell"><button class="btn-sm btn-view-details" data-user-name="${userName}" data-details='${detailsJson}'>বিস্তারিত</button></td>
            `;
            leaderboardTableBody.appendChild(tr);
        });
    };
    
    const showScoreDetailsModal = (userName, details) => {
        if(!scoreDetailsModal) return;
        modalUserName.textContent = `${userName}-এর বিস্তারিত স্কোর`;
        modalScoreTableBody.innerHTML = '';
        if (!details || details.length === 0) {
            modalScoreTableBody.innerHTML = '<tr><td colspan="3">কোনো বিস্তারিত স্কোর পাওয়া যায়নি।</td></tr>';
        } else {
            details.forEach(item => {
                const tr = document.createElement('tr');
                tr.innerHTML = `<td>${item.setName}</td><td>${item.score}</td><td>${item.maxScore}</td>`;
                modalScoreTableBody.appendChild(tr);
            });
        }
        scoreDetailsModal.style.display = 'flex';
    };

    const formatTimestamp = (timestamp) => {
        if (!timestamp || typeof timestamp.toDate !== 'function') { return 'N/A'; }
        try {
            return timestamp.toDate().toLocaleString('bn-BD', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
        } catch (error) {
            console.error("Error formatting timestamp:", error);
            return 'N/A';
        }
    };
});