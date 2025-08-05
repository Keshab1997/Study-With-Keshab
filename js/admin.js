document.addEventListener('DOMContentLoaded', () => {

    if (typeof firebase === 'undefined') { return; }
    const auth = firebase.auth();
    const db = firebase.firestore();
    const functions = firebase.functions();

    // --- DOM Element References ---
    const adminPageContainer = document.querySelector('.admin-page-container');
    const accessDeniedMessage = document.getElementById('access-denied');
    const pageTitle = document.getElementById('page-title');
    const breadcrumbNav = document.getElementById('breadcrumb-nav');
    const adminInfoSidebar = document.getElementById('admin-info-sidebar');
    const adminProfilePicSidebar = document.getElementById('admin-profile-pic-sidebar');
    const adminNameSidebar = document.getElementById('admin-name-sidebar');
    const adminLogoutBtn = document.getElementById('admin-logout-btn');
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    const navDashboard = document.getElementById('nav-dashboard');
    const navLeaderboard = document.getElementById('nav-leaderboard');
    const dashboardContent = document.getElementById('dashboard-content');
    const leaderboardContent = document.getElementById('leaderboard-content');
    
    // Dashboard Elements
    const totalUsersStat = document.getElementById('total-users');
    const totalAdminsStat = document.getElementById('total-admins');
    const userTableBody = document.getElementById('user-table-body');
    const userSearchInput = document.getElementById('user-search-input');
    const userListLoading = document.getElementById('user-list-loading');
    const notificationForm = document.getElementById('notification-form');
    const notificationStatus = document.getElementById('notification-status');

    // Notification History Elements
    const notificationHistoryBody = document.getElementById('notification-history-body');
    const clearAllHistoryBtn = document.getElementById('clear-all-history-btn');
    const notificationHistoryLoading = document.getElementById('notification-history-loading');
    
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

    const initializeAdminPanel = (user, adminData) => {
        adminPageContainer.style.display = 'flex';
        adminNameSidebar.textContent = adminData.displayName || 'Admin';
        adminProfilePicSidebar.src = adminData.photoURL || 'images/default-avatar.png';
        adminInfoSidebar.style.display = 'flex';
        setupEventListeners();
        loadDashboardData();
        loadNotificationHistory();
    };
    
    const showAccessDenied = () => {
        adminPageContainer.style.display = 'none';
        accessDeniedMessage.style.display = 'flex';
    };

    // --- Event Listeners ---
    const setupEventListeners = () => {
        adminLogoutBtn.addEventListener('click', (e) => { 
            e.preventDefault(); 
            auth.signOut(); 
        });
        
        notificationForm.addEventListener('submit', handleNotificationSubmit);
        
        notificationHistoryBody.addEventListener('click', handleHistoryDelete);
        clearAllHistoryBtn.addEventListener('click', handleClearAllHistory);

        userSearchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filteredUsers = allUsersCache.filter(user => 
                user.displayName.toLowerCase().includes(searchTerm) || 
                user.email.toLowerCase().includes(searchTerm)
            );
            renderUserTable(filteredUsers);
        });

        // Tab navigation
        navDashboard.addEventListener('click', (e) => {
            e.preventDefault();
            dashboardContent.style.display = 'block';
            leaderboardContent.style.display = 'none';
            navDashboard.parentElement.classList.add('active');
            navLeaderboard.parentElement.classList.remove('active');
        });

        navLeaderboard.addEventListener('click', (e) => {
            e.preventDefault();
            dashboardContent.style.display = 'none';
            leaderboardContent.style.display = 'block';
            navDashboard.parentElement.classList.remove('active');
            navLeaderboard.parentElement.classList.add('active');
        });
    };

    // --- Dashboard ---
    const loadDashboardData = async () => {
        if (userListLoading) userListLoading.style.display = 'block';
        try {
            const usersSnapshot = await db.collection('users').get();
            allUsersCache = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            const adminCount = allUsersCache.filter(user => user.role === 'admin').length;
            totalUsersStat.textContent = allUsersCache.length;
            totalAdminsStat.textContent = adminCount;
            
            renderUserTable(allUsersCache);

        } catch (error) {
            console.error("Error loading user data:", error);
            userTableBody.innerHTML = `<tr><td colspan="6">ব্যবহারকারীদের তালিকা লোড করতে সমস্যা হয়েছে। Error: ${error.message}</td></tr>`;
        } finally {
            if (userListLoading) userListLoading.style.display = 'none';
        }
    };

    const renderUserTable = (users) => {
        userTableBody.innerHTML = '';
        if (users.length === 0) {
            userTableBody.innerHTML = '<tr><td colspan="6">কোনো ব্যবহারকারী খুঁজে পাওয়া যায়নি।</td></tr>';
            return;
        }
        users.forEach(user => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><img src="${user.photoURL || 'images/default-avatar.png'}" alt="Profile Pic" class="user-table-pic"></td>
                <td>${user.displayName || 'N/A'}</td>
                <td>${user.email || 'N/A'}</td>
                <td><span class="role-badge ${user.role === 'admin' ? 'role-admin' : ''}">${user.role || 'user'}</span></td>
                <td>${formatTimestamp(user.lastLogin)}</td>
                <td class="action-cell">
                    <button class="btn-sm btn-primary" data-id="${user.id}">সম্পাদনা</button>
                </td>
            `;
            userTableBody.appendChild(tr);
        });
    };

    const handleNotificationSubmit = async (e) => {
        e.preventDefault();
        const title = document.getElementById('notification-title').value;
        const body = document.getElementById('notification-body').value;
        const link = document.getElementById('notification-link').value;
        const button = e.target.querySelector('button');

        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> পাঠানো হচ্ছে...';
        notificationStatus.style.display = 'block';
        notificationStatus.className = 'status-info';
        notificationStatus.textContent = 'নোটিফিকেশন পাঠানোর প্রক্রিয়া চলছে...';

        try {
            await db.collection('notificationQueue').add({ title, body, link });
            notificationStatus.className = 'status-success';
            notificationStatus.textContent = 'সফলভাবে নোটিফিকেশন পাঠানোর অনুরোধ করা হয়েছে!';
            notificationForm.reset();
        } catch (error) {
            console.error("Error sending notification:", error);
            notificationStatus.className = 'status-danger';
            notificationStatus.textContent = `ত্রুটি: ${error.message}`;
        } finally {
            button.disabled = false;
            button.innerHTML = '<i class="fas fa-paper-plane"></i> সব ব্যবহারকারীকে পাঠান';
            setTimeout(() => { notificationStatus.style.display = 'none'; }, 5000);
        }
    };
    
    // --- Notification History Functions ---
    const loadNotificationHistory = () => {
        if (notificationHistoryLoading) notificationHistoryLoading.style.display = 'block';
        db.collection('notifications').orderBy('createdAt', 'desc').limit(50)
          .onSnapshot(snapshot => {
            notificationHistoryBody.innerHTML = '';
            if (snapshot.empty) {
                notificationHistoryBody.innerHTML = '<tr><td colspan="4">কোনো বিজ্ঞপ্তির ইতিহাস পাওয়া যায়নি।</td></tr>';
            } else {
                snapshot.forEach(doc => {
                    const notif = doc.data();
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${notif.title}</td>
                        <td>${notif.body}</td>
                        <td>${formatTimestamp(notif.createdAt)}</td>
                        <td class="action-cell"><button class="btn-danger btn-sm delete-notif-btn" data-id="${doc.id}">মুছুন</button></td>
                    `;
                    notificationHistoryBody.appendChild(tr);
                });
            }
            if (notificationHistoryLoading) notificationHistoryLoading.style.display = 'none';
        }, err => {
            console.error("Error loading notification history:", err);
            notificationHistoryBody.innerHTML = '<tr><td colspan="4">ইতিহাস লোড করতে সমস্যা হয়েছে।</td></tr>';
        });
    };

    const handleHistoryDelete = (e) => {
        if (e.target.classList.contains('delete-notif-btn')) {
            const docId = e.target.dataset.id;
            if (confirm(`আপনি কি এই বিজ্ঞপ্তিটি মুছে ফেলতে চান?`)) {
                const deleteNotification = functions.httpsCallable('deleteNotification');
                e.target.textContent = 'মুছছে...';
                e.target.disabled = true;
                deleteNotification({ docId: docId })
                    .then(res => console.log(res.data.message))
                    .catch(err => {
                        console.error("Error deleting notification:", err);
                        alert(`ত্রুটি: ${err.message}`);
                    }).finally(() => {
                        // বাটনটি আর আগের অবস্থায় ফেরানোর দরকার নেই কারণ onSnapshot তালিকাটি রিফ্রেশ করে দেবে
                    });
            }
        }
    };

    const handleClearAllHistory = () => {
        if (confirm("আপনি কি নিশ্চিত যে আপনি সমস্ত বিজ্ঞপ্তির ইতিহাস মুছে ফেলতে চান? এই কাজটি ফেরানো যাবে না।")) {
            const deleteAllNotifications = functions.httpsCallable('deleteAllNotifications');
            clearAllHistoryBtn.textContent = 'মুছে ফেলা হচ্ছে...';
            clearAllHistoryBtn.disabled = true;
            deleteAllNotifications()
                .then(res => {
                    alert(res.data.message);
                })
                .catch(err => {
                    console.error("Error deleting all notifications:", err);
                    alert(`ত্রুটি: ${err.message}`);
                }).finally(() => {
                    clearAllHistoryBtn.textContent = 'সব ইতিহাস মুছুন';
                    clearAllHistoryBtn.disabled = false;
                });
        }
    };

    // --- Utility Function ---
    const formatTimestamp = (timestamp) => {
        if (!timestamp || !timestamp.toDate) return 'N/A';
        return timestamp.toDate().toLocaleString('bn-BD', { dateStyle: 'long', timeStyle: 'short' });
    };

});