document.addEventListener('DOMContentLoaded', () => {

    // --- Firebase Initialization ---
    if (typeof firebase === 'undefined') {
        console.error("Firebase is not initialized. Make sure firebase-config.js is loaded correctly.");
        document.body.innerHTML = "<h1>Firebase কনফিগারেশন ত্রুটি। অনুগ্রহ করে কনসোল চেক করুন।</h1>";
        return;
    }
    const auth = firebase.auth();
    const db = firebase.firestore();

    // --- DOM Element References ---
    const adminPageContainer = document.querySelector('.admin-page-container');
    const accessDeniedMessage = document.getElementById('access-denied');
    const pageTitle = document.getElementById('page-title');
    const breadcrumbNav = document.getElementById('breadcrumb-nav');

    // Sidebar
    const navDashboard = document.getElementById('nav-dashboard');
    const navLeaderboard = document.getElementById('nav-leaderboard');
    const sidebar = document.querySelector('.sidebar');
    const adminInfoSidebar = document.getElementById('admin-info-sidebar');
    const adminProfilePicSidebar = document.getElementById('admin-profile-pic-sidebar');
    const adminNameSidebar = document.getElementById('admin-name-sidebar');
    const adminLogoutBtn = document.getElementById('admin-logout-btn');

    // Content Sections
    const dashboardContent = document.getElementById('dashboard-content');
    const leaderboardContent = document.getElementById('leaderboard-content');

    // Dashboard Elements
    const totalUsersStat = document.getElementById('total-users');
    const totalAdminsStat = document.getElementById('total-admins');
    const userTableBody = document.getElementById('user-table-body');
    const userSearchInput = document.getElementById('user-search-input');
    const userListLoading = document.getElementById('user-list-loading');

    // Leaderboard Elements
    const chapterSelect = document.getElementById('chapter-select');
    const leaderboardTableBody = document.getElementById('leaderboard-table-body');
    const leaderboardLoading = document.getElementById('leaderboard-loading');

    // Modal Elements
    const scoreDetailsModal = document.getElementById('score-details-modal');
    const modalCloseButton = document.querySelector('.modal .close-button');
    const modalUserName = document.getElementById('modal-user-name');
    const modalScoreTableBody = document.getElementById('modal-score-table-body');

    // Mobile Menu
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');

    // Global state
    let allUsersCache = [];
    let allChaptersCache = new Set();


    // --- Authentication Check ---
    auth.onAuthStateChanged(user => {
        if (user) {
            checkAdminRole(user);
        } else {
            showAccessDenied();
        }
    });

    const checkAdminRole = async (user) => {
        try {
            const userDocRef = db.collection('users').doc(user.uid);
            const doc = await userDocRef.get();

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
        adminPageContainer.style.display = 'none';
        accessDeniedMessage.style.display = 'flex';
    };

    const initializeAdminPanel = (user, adminData) => {
        accessDeniedMessage.style.display = 'none';
        adminPageContainer.style.display = 'flex';

        adminNameSidebar.textContent = adminData.displayName || 'Admin';
        adminProfilePicSidebar.src = adminData.photoURL || 'images/default-avatar.png';
        adminInfoSidebar.style.display = 'flex';

        setupEventListeners();
        loadDashboardData();
    };

    // --- Event Listeners Setup ---
    const setupEventListeners = () => {
        navDashboard.addEventListener('click', (e) => {
            e.preventDefault();
            switchTab('dashboard');
        });

        navLeaderboard.addEventListener('click', (e) => {
            e.preventDefault();
            switchTab('leaderboard');
        });

        adminLogoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            auth.signOut().then(() => {
                window.location.href = 'index.html';
            });
        });

        userSearchInput.addEventListener('input', handleUserSearch);

        chapterSelect.addEventListener('change', () => {
            const chapterName = chapterSelect.value;
            if (chapterName) {
                loadLeaderboardForChapter(chapterName);
            } else {
                leaderboardTableBody.innerHTML = '<tr><td colspan="4">অনুগ্রহ করে একটি বিষয় নির্বাচন করুন।</td></tr>';
            }
        });
        
        userTableBody.addEventListener('click', handleUserTableActions);
        leaderboardTableBody.addEventListener('click', handleLeaderboardTableActions);

        modalCloseButton.addEventListener('click', () => scoreDetailsModal.style.display = 'none');
        window.addEventListener('click', (event) => {
            if (event.target === scoreDetailsModal) {
                scoreDetailsModal.style.display = 'none';
            }
        });

        mobileMenuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('is-visible');
        });
    };

    // --- Tab Switching Logic ---
    const switchTab = (tabName) => {
        document.querySelectorAll('.sidebar-nav li').forEach(li => li.classList.remove('active'));
        dashboardContent.style.display = 'none';
        leaderboardContent.style.display = 'none';

        if (tabName === 'dashboard') {
            navDashboard.classList.add('active');
            dashboardContent.style.display = 'block';
            pageTitle.textContent = 'ড্যাশবোর্ড';
            updateBreadcrumb('Dashboard');
        } else if (tabName === 'leaderboard') {
            navLeaderboard.classList.add('active');
            leaderboardContent.style.display = 'block';
            pageTitle.textContent = 'লিডারবোর্ড';
            updateBreadcrumb('Leaderboard');
            if (allChaptersCache.size > 0 && chapterSelect.options.length <= 1) {
                populateChapterDropdown();
            }
        }
         sidebar.classList.remove('is-visible');
    };
    
    const updateBreadcrumb = (currentPage) => {
        breadcrumbNav.innerHTML = `
            <li class="breadcrumb-item"><a href="#">Admin</a></li>
            <li class="breadcrumb-item active" aria-current="page">${currentPage}</li>
        `;
    };

    // --- Dashboard & Data Caching ---
    const loadDashboardData = async () => {
        userListLoading.style.display = 'block';
        userTableBody.innerHTML = '';
        try {
            const usersSnapshot = await db.collection('users').get();
            allUsersCache = [];
            allChaptersCache.clear();
            
            usersSnapshot.forEach(doc => {
                const userData = { id: doc.id, ...doc.data() };
                allUsersCache.push(userData);

                if (userData.chapters && typeof userData.chapters === 'object') {
                    Object.keys(userData.chapters).forEach(chapterName => {
                        allChaptersCache.add(chapterName);
                    });
                }
            });
            
            allUsersCache.sort((a,b) => (a.displayName || '').localeCompare(b.displayName || ''));
            
            let adminCount = allUsersCache.filter(user => user.role === 'admin').length;

            totalUsersStat.textContent = allUsersCache.length;
            totalAdminsStat.textContent = adminCount;

            renderUserTable(allUsersCache);
            populateChapterDropdown();

        } catch (error) {
            console.error("Error loading dashboard data: ", error);
            userTableBody.innerHTML = '<tr><td colspan="6">ব্যবহারকারীদের তালিকা লোড করতে সমস্যা হয়েছে।</td></tr>';
        } finally {
            userListLoading.style.display = 'none';
        }
    };

    const renderUserTable = (users) => {
        userTableBody.innerHTML = '';
        if (users.length === 0) {
            userTableBody.innerHTML = '<tr><td colspan="6">কোনো ব্যবহারকারী পাওয়া যায়নি।</td></tr>';
            return;
        }

        users.forEach(user => {
            const lastLogin = formatTimestamp(user.lastLogin); // Corrected function call
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
        const filteredUsers = allUsersCache.filter(user => 
            (user.displayName || '').toLowerCase().includes(searchTerm) || 
            (user.email || '').toLowerCase().includes(searchTerm)
        );
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
            handleUserSearch();
        } catch (error) {
            console.error("Error updating role:", error);
            alert('ভূমিকা আপডেট করতে সমস্যা হয়েছে।');
            handleUserSearch();
        }
    };

    // --- Leaderboard Functionality ---
    const populateChapterDropdown = () => {
        chapterSelect.innerHTML = '<option value="">-- বিষয় বাছুন --</option>';
        const sortedChapters = [...allChaptersCache].sort();
        sortedChapters.forEach(chapterName => {
            const option = document.createElement('option');
            option.value = chapterName;
            option.textContent = chapterName;
            chapterSelect.appendChild(option);
        });
    };

    const loadLeaderboardForChapter = (chapterName) => {
        leaderboardLoading.style.display = 'block';
        leaderboardTableBody.innerHTML = '';
        const leaderboardData = [];

        allUsersCache.forEach(user => {
            if (user.chapters && user.chapters[chapterName] && user.chapters[chapterName].quiz_sets) {
                const quizSets = user.chapters[chapterName].quiz_sets;
                let chapterTotalScore = 0;
                const detailedScoresForModal = [];

                Object.keys(quizSets).forEach(setName => {
                    const setData = quizSets[setName];
                    chapterTotalScore += setData.totalScore || setData.score || 0;
                    detailedScoresForModal.push({
                        setName: setName.replace(/_/g, ' '), // Replace underscore with space for display
                        score: setData.score,
                        maxScore: setData.totalQuestions
                    });
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
        leaderboardLoading.style.display = 'none';
    };
    
    const renderLeaderboardTable = (data) => {
        leaderboardTableBody.innerHTML = '';
        if (data.length === 0) {
            leaderboardTableBody.innerHTML = '<tr><td colspan="4">এই বিষয়ের জন্য কোনো লিডারবোর্ড ডেটা নেই।</td></tr>';
            return;
        }

        data.forEach((entry, index) => {
            const tr = document.createElement('tr');
            const detailsJson = JSON.stringify(entry.detailedScores || []);
            const userName = entry.userName || 'Unknown User';
            
            tr.innerHTML = `
                <td>${index + 1}</td>
                <td class="user-cell">
                    <img src="${entry.userPhoto || 'images/default-avatar.png'}" alt="Profile Pic" class="table-profile-pic">
                    <span>${userName}</span>
                </td>
                <td>${entry.totalScore}</td>
                <td class="action-cell">
                    <button class="btn-view-details" data-user-name="${userName}" data-details='${detailsJson}'>
                        বিস্তারিত দেখুন
                    </button>
                </td>
            `;
            leaderboardTableBody.appendChild(tr);
        });
    };
    
    const handleLeaderboardTableActions = (e) => {
        if (e.target.classList.contains('btn-view-details')) {
            const button = e.target;
            const userName = button.dataset.userName;
            const details = JSON.parse(button.dataset.details);
            showScoreDetailsModal(userName, details);
        }
    };
    
    const showScoreDetailsModal = (userName, details) => {
        modalUserName.textContent = `${userName}-এর বিস্তারিত স্কোর`;
        modalScoreTableBody.innerHTML = '';
        if (!details || details.length === 0) {
            modalScoreTableBody.innerHTML = '<tr><td colspan="3">কোনো বিস্তারিত স্কোর পাওয়া যায়নি।</td></tr>';
        } else {
            details.forEach(item => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${item.setName || 'N/A'}</td>
                    <td>${item.score}</td>
                    <td>${item.maxScore}</td>
                `;
                modalScoreTableBody.appendChild(tr);
            });
        }
        scoreDetailsModal.style.display = 'flex';
    };

    // --- Utility Functions ---
    /**
     * Formats a Firestore Timestamp into a readable string. Handles invalid/missing timestamps.
     * @param {firebase.firestore.Timestamp} timestamp The timestamp to format.
     * @returns {string} A formatted date string or 'N/A'.
     */
    const formatTimestamp = (timestamp) => {
        // Handle null, undefined, or missing timestamp
        if (!timestamp || typeof timestamp.toDate !== 'function') {
            return 'N/A';
        }
        try {
            const date = timestamp.toDate();
            return date.toLocaleString('bn-BD', {
                day: '2-digit', month: 'short', year: 'numeric',
                hour: '2-digit', minute: '2-digit', hour12: true
            });
        } catch (error) {
            console.error("Error formatting timestamp:", error);
            return 'N/A'; // Return N/A if any error occurs during formatting
        }
    };
});