document.addEventListener('DOMContentLoaded', () => {

    if (typeof firebase === 'undefined') { return; }
    const auth = firebase.auth();
    const db = firebase.firestore();
    const functions = firebase.functions(); // Callable Functions এর জন্য

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

    // Notification History Elements (New)
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
        const userDocRef = db.collection('users').doc(user.uid);
        const doc = await userDocRef.get();
        if (doc.exists && doc.data().role === 'admin') {
            initializeAdminPanel(user, doc.data());
        } else {
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
        loadNotificationHistory(); // নতুন ফাংশন কল
    };
    
    const showAccessDenied = () => {
        adminPageContainer.style.display = 'none';
        accessDeniedMessage.style.display = 'flex';
    };

    // --- Event Listeners ---
    const setupEventListeners = () => {
        // ... আপনার পুরনো event listener গুলো এখানে থাকবে ...
        adminLogoutBtn.addEventListener('click', (e) => { e.preventDefault(); auth.signOut(); });
        notificationForm.addEventListener('submit', handleNotificationSubmit);
        
        // --- Notification History Event Listeners (New) ---
        notificationHistoryBody.addEventListener('click', handleHistoryDelete);
        clearAllHistoryBtn.addEventListener('click', handleClearAllHistory);
    };

    // --- Dashboard ---
    const loadDashboardData = async () => { /* ... আপনার এই ফাংশনটি অপরিবর্তিত ... */ };
    const renderUserTable = (users) => { /* ... আপনার এই ফাংশনটি অপরিবর্তিত ... */ };
    const handleNotificationSubmit = (e) => { /* ... আপনার এই ফাংশনটি অপরিবর্তিত ... */ };
    
    // --- Notification History Functions (New) ---
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
            if (confirm(`আপনি কি এই বিজ্ঞপ্তিটি (${docId}) মুছে ফেলতে চান?`)) {
                const deleteNotification = functions.httpsCallable('deleteNotification');
                e.target.textContent = 'মুছছে...';
                e.target.disabled = true;
                deleteNotification({ docId: docId })
                    .then(res => console.log(res.data.message))
                    .catch(err => {
                        console.error("Error deleting notification:", err);
                        alert(`ত্রুটি: ${err.message}`);
                        e.target.textContent = 'মুছুন';
                        e.target.disabled = false;
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
                    clearAllHistoryBtn.textContent = 'সব ইতিহাস মুছুন';
                    clearAllHistoryBtn.disabled = false;
                })
                .catch(err => {
                    console.error("Error deleting all notifications:", err);
                    alert(`ত্রুটি: ${err.message}`);
                    clearAllHistoryBtn.textContent = 'সব ইতিহাস মুছুন';
                    clearAllHistoryBtn.disabled = false;
                });
        }
    };

    // --- Utility Function ---
    const formatTimestamp = (timestamp) => {
        if (!timestamp || !timestamp.toDate) return 'N/A';
        return timestamp.toDate().toLocaleString('bn-BD', { dateStyle: 'medium', timeStyle: 'short' });
    };

});