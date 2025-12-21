// --- Import Firebase SDK (Modular Version) ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
    getFirestore, collection, getDocs, getDoc, doc, updateDoc, addDoc, deleteDoc, 
    serverTimestamp, query, orderBy, limit, onSnapshot 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-functions.js";

// --- Firebase Configuration ---
const firebaseConfig = {
    apiKey: "AIzaSyBEhbEWRfuch_wuXPiQdG8l5TW6L5Ssi1Y",
    authDomain: "study-with-keshab.firebaseapp.com",
    projectId: "study-with-keshab",
    storageBucket: "study-with-keshab.firebasestorage.app",
    messagingSenderId: "752692165545",
    appId: "1:752692165545:web:219ff482874717c3ab22b8",
    measurementId: "G-QH5ELRG2DE"
};

// --- Initialize Firebase ---
console.log("Initializing Firebase Module...");
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app);

// --- Main Logic ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("Admin.js: DOM loaded, Firebase initialized via Module.");

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
    
    let allUsersCache = []; // Cache

    // --- Auth Listener ---
    onAuthStateChanged(auth, (user) => {
        if (user) {
            checkAdminRole(user);
        } else {
            showAccessDenied();
        }
    });

    const checkAdminRole = async (user) => {
        console.log("Checking role for:", user.email);
        try {
            const userRef = doc(db, 'users', user.uid);
            const docSnap = await getDoc(userRef);
            
            if (docSnap.exists() && docSnap.data().role === 'admin') {
                initializeAdminPanel(user, docSnap.data());
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
        if(accessDeniedMessage) accessDeniedMessage.style.display = 'none';
        if(adminPageContainer) adminPageContainer.style.display = 'flex';
        
        if(adminNameSidebar) adminNameSidebar.textContent = adminData.displayName || 'Admin';
        if(adminProfilePicSidebar) adminProfilePicSidebar.src = adminData.photoURL || 'images/default-avatar.png';
        if(adminInfoSidebar) adminInfoSidebar.style.display = 'flex';
        
        setupEventListeners();
        loadAllUserData();
        loadNotificationHistory();
    };

    // --- Load User Data ---
    const loadAllUserData = async () => {
        if (userListLoading) userListLoading.style.display = 'block';
        try {
            const querySnapshot = await getDocs(collection(db, 'users'));
            allUsersCache = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            const adminCount = allUsersCache.filter(user => user.role === 'admin').length;
            
            if(totalUsersStat) totalUsersStat.textContent = allUsersCache.length;
            if(totalAdminsStat) totalAdminsStat.textContent = adminCount;
            
            renderUserTable(allUsersCache);
            populateChapterDropdownFromCache();

        } catch (error) {
            console.error("Error loading users:", error);
        } finally {
            if (userListLoading) userListLoading.style.display = 'none';
        }
    };

    // --- Event Listeners ---
    const setupEventListeners = () => {
        if (navDashboard) navDashboard.addEventListener('click', (e) => { e.preventDefault(); switchTab('dashboard'); });
        if (navLeaderboard) navLeaderboard.addEventListener('click', (e) => { e.preventDefault(); switchTab('leaderboard'); });
        
        if (adminLogoutBtn) {
            adminLogoutBtn.addEventListener('click', (e) => { 
                e.preventDefault(); 
                signOut(auth).then(() => { window.location.href = 'index.html'; }); 
            });
        }

        if (userSearchInput) userSearchInput.addEventListener('input', handleUserSearch);
        if (chapterSelect) chapterSelect.addEventListener('change', () => {
            loadLeaderboardForChapter(chapterSelect.value);
        });
        
        if (userTableBody) userTableBody.addEventListener('click', handleUserTableActions);
        if (leaderboardTableBody) leaderboardTableBody.addEventListener('click', handleLeaderboardTableActions);
        
        if (modalCloseButton) modalCloseButton.addEventListener('click', () => scoreDetailsModal.style.display = 'none');
        if (scoreDetailsModal) window.addEventListener('click', (event) => { if (event.target === scoreDetailsModal) scoreDetailsModal.style.display = 'none'; });
        
        if (mobileMenuToggle && sidebar) mobileMenuToggle.addEventListener('click', () => { sidebar.classList.toggle('is-visible'); });
        
        // Notification Listeners
        if (notificationForm) notificationForm.addEventListener('submit', handleNotificationSubmit);
        if (notificationHistoryBody) notificationHistoryBody.addEventListener('click', handleHistoryDelete);
        if (clearAllHistoryBtn) clearAllHistoryBtn.addEventListener('click', handleClearAllHistory);
    };

    const switchTab = (tabName) => {
        document.querySelectorAll('.sidebar-nav li').forEach(li => li.classList.remove('active'));
        if(dashboardContent) dashboardContent.style.display = 'none';
        if(leaderboardContent) leaderboardContent.style.display = 'none';

        if (tabName === 'dashboard') {
            if (navDashboard) navDashboard.classList.add('active');
            if(dashboardContent) dashboardContent.style.display = 'block';
            if(pageTitle) pageTitle.textContent = 'ড্যাশবোর্ড';
            updateBreadcrumb('Dashboard');
        } else if (tabName === 'leaderboard') {
            if (navLeaderboard) navLeaderboard.classList.add('active');
            if(leaderboardContent) leaderboardContent.style.display = 'block';
            if(pageTitle) pageTitle.textContent = 'লিডারবোর্ড';
            updateBreadcrumb('Leaderboard');
            loadLeaderboardForChapter(chapterSelect.value);
        }
        if (sidebar) sidebar.classList.remove('is-visible');
    };

    const updateBreadcrumb = (currentPage) => {
        if (breadcrumbNav) breadcrumbNav.innerHTML = `<li class="breadcrumb-item"><a href="#">Admin</a></li><li class="breadcrumb-item active">${currentPage}</li>`;
    };

    // --- Render User Table ---
    const renderUserTable = (users) => {
        if(!userTableBody) return;
        userTableBody.innerHTML = '';
        users.sort((a,b) => (a.displayName || '').localeCompare(b.displayName || ''));
        users.forEach(user => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td><img src="${user.photoURL || 'images/default-avatar.png'}" class="table-profile-pic"></td><td>${user.displayName || 'N/A'}</td><td>${user.email || 'N/A'}</td><td><span class="role-badge role-${user.role || 'user'}">${user.role || 'user'}</span></td><td>${formatTimestamp(user.lastLogin)}</td><td class="action-cell"><select class="role-changer" data-user-id="${user.id}" data-current-role="${user.role || 'user'}"><option value="user" ${(!user.role || user.role === 'user') ? 'selected' : ''}>User</option><option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option></select></td>`;
            userTableBody.appendChild(tr);
        });
    };

    const handleUserTableActions = async (e) => {
        if (e.target.classList.contains('role-changer')) {
            const select = e.target;
            const newRole = select.value;
            const userId = select.dataset.userId;
            
            if (newRole !== select.dataset.currentRole && confirm(`আপনি কি ভূমিকা পরিবর্তন করতে নিশ্চিত?`)) {
                try {
                    const userRef = doc(db, 'users', userId);
                    await updateDoc(userRef, { role: newRole });
                    // Update cache manually to reflect changes immediately
                    const user = allUsersCache.find(u => u.id === userId);
                    if(user) user.role = newRole;
                    select.dataset.currentRole = newRole;
                } catch(err) {
                    console.error("Error updating role:", err);
                    alert("আপডেট করতে সমস্যা হয়েছে।");
                    select.value = select.dataset.currentRole;
                }
            } else {
                select.value = select.dataset.currentRole;
            }
        }
    };

    // --- Leaderboard Logic ---
    const populateChapterDropdownFromCache = () => {
        if (!chapterSelect) return;
        const allChapters = new Set();
        
        allUsersCache.forEach(user => {
            if (user.chapters && typeof user.chapters === 'object') {
                Object.keys(user.chapters).forEach(chapterName => allChapters.add(chapterName));
            }
            if (user.quiz_sets && typeof user.quiz_sets === 'object') {
                Object.keys(user.quiz_sets).forEach(setName => allChapters.add(setName));
            }
        });

        chapterSelect.innerHTML = '<option value="">-- সকল বিষয় --</option>';
        [...allChapters].sort().forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name.replace(/_/g, ' ');
            chapterSelect.appendChild(option);
        });
    };

    const loadLeaderboardForChapter = (selectedChapter) => {
        if (leaderboardLoading) leaderboardLoading.style.display = 'block';
        if(leaderboardTableBody) leaderboardTableBody.innerHTML = '';
        
        let leaderboardData = [];

        allUsersCache.forEach(user => {
            let totalScore = 0;
            let detailedScores = [];

            const processQuizData = (quizSets, chapterContext) => {
                if (quizSets && typeof quizSets === 'object') {
                    Object.keys(quizSets).forEach(setName => {
                        const scoreData = quizSets[setName];
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
            
            processQuizData(user.quiz_sets, null); 
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

        leaderboardData.sort((a, b) => b.totalScore - a.totalScore);
        renderLeaderboardTable(leaderboardData);
        if (leaderboardLoading) leaderboardLoading.style.display = 'none';
    };

    const renderLeaderboardTable = (data) => {
        if(!leaderboardTableBody) return;
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

    // --- Notification Logic (Modular) ---
    const handleNotificationSubmit = async (e) => {
        e.preventDefault();
        const button = e.target.querySelector('button');
        if(button) button.disabled = true;

        try {
            const title = document.getElementById('notification-title').value;
            const body = document.getElementById('notification-body').value;
            const link = document.getElementById('notification-link').value;

            // Using addDoc for Modular SDK
            await addDoc(collection(db, 'notificationQueue'), {
                title: title,
                body: body,
                link: link,
                createdAt: serverTimestamp()
            });

            if(notificationStatus) {
                notificationStatus.className = 'status-success';
                notificationStatus.textContent = 'নোটিফিকেশন সফলভাবে পাঠানো হয়েছে।';
                notificationStatus.style.display = 'block';
            }
            notificationForm.reset();
        } catch (error) {
            console.error("Notification Error:", error);
            if(notificationStatus) {
                notificationStatus.className = 'status-danger';
                notificationStatus.textContent = 'ত্রুটি! আবার চেষ্টা করুন।';
                notificationStatus.style.display = 'block';
            }
        }
        
        if(button) button.disabled = false;
        setTimeout(() => { if(notificationStatus) notificationStatus.style.display = 'none'; }, 5000);
    };

    const loadNotificationHistory = () => {
        if (notificationHistoryLoading) notificationHistoryLoading.style.display = 'block';
        if (!notificationHistoryBody) return;

        const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'), limit(20));

        onSnapshot(q, (snapshot) => {
            notificationHistoryBody.innerHTML = '';
            snapshot.forEach(docSnap => {
                const notif = docSnap.data();
                const tr = document.createElement('tr');
                tr.innerHTML = `<td>${notif.title}</td><td>${notif.body}</td><td>${formatTimestamp(notif.createdAt)}</td><td class="action-cell"><button class="btn-danger btn-sm delete-notif-btn" data-id="${docSnap.id}">মুছুন</button></td>`;
                notificationHistoryBody.appendChild(tr);
            });
            if (notificationHistoryLoading) notificationHistoryLoading.style.display = 'none';
        });
    };

    const handleHistoryDelete = async (e) => {
        if (e.target.classList.contains('delete-notif-btn')) {
            if (confirm('আপনি কি এই বিজ্ঞপ্তিটি মুছে ফেলতে চান?')) {
                const docId = e.target.dataset.id;
                try {
                    // Try using Cloud Function
                    const deleteFn = httpsCallable(functions, 'deleteNotification');
                    await deleteFn({ docId: docId });
                } catch (err) {
                    console.warn("Function failed, trying direct delete...", err);
                    // Fallback to direct delete if function fails
                    try {
                        await deleteDoc(doc(db, 'notifications', docId));
                    } catch (directErr) {
                        alert("মুছতে ব্যর্থ হয়েছে: " + directErr.message);
                    }
                }
            }
        }
    };
    
    const handleClearAllHistory = async () => {
        if (confirm('আপনি কি সব বিজ্ঞপ্তি মুছে ফেলতে চান?')) {
            try {
                const deleteAllFn = httpsCallable(functions, 'deleteAllNotifications');
                await deleteAllFn();
            } catch (err) {
                console.error(err);
                alert("সব মুছতে সমস্যা হয়েছে। ক্লাউড ফাংশন চেক করুন।");
            }
        }
    };

    // --- Helpers ---
    const formatTimestamp = (ts) => (ts?.toDate) ? ts.toDate().toLocaleString('bn-BD') : 'N/A';
    
    const handleUserSearch = () => {
        const term = userSearchInput.value.toLowerCase();
        renderUserTable(allUsersCache.filter(u => (u.displayName || '').toLowerCase().includes(term) || (u.email || '').toLowerCase().includes(term)));
    };
});