document.addEventListener('DOMContentLoaded', () => {
    // === ১. Supabase কনফিগারেশন ===
    const supabaseUrl = 'https://yofmaciyxrwvqyzyltml.supabase.co'; 
    const supabaseKey = 'sb_publishable_g1eUh3i6hpDQX8w_1-hrvw_ChYrhkc3'; 
    // 'supabase' নামটির সংঘর্ষ এড়াতে 'supabaseClient' ব্যবহার করা হয়েছে
    const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

    console.log("Admin.js: DOM loaded, checking Firebase...");

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
    const dashboardContent = document.getElementById('dashboard-content');
    const leaderboardContent = document.getElementById('leaderboard-content');
    const totalUsersStat = document.getElementById('total-users');
    const totalAdminsStat = document.getElementById('total-admins');
    const userTableBody = document.getElementById('user-table-body');
    const userSearchInput = document.getElementById('user-search-input');
    const userListLoading = document.getElementById('user-list-loading');
    
    // Supabase Elements
    const openSbModalBtn = document.getElementById('open-supabase-modal-btn');
    const sbModal = document.getElementById('supabaseNotificationModal');
    const closeSbModal = document.getElementById('close-sb-modal');
    const sbForm = document.getElementById('sb-notification-form');
    const sbHistoryBody = document.getElementById('supabase-history-body');
    const sbHistoryLoading = document.getElementById('sb-history-loading');
    const refreshHistoryBtn = document.getElementById('refresh-history-btn');

    const chapterSelect = document.getElementById('chapter-select');
    const leaderboardTableBody = document.getElementById('leaderboard-table-body');
    const leaderboardLoading = document.getElementById('leaderboard-loading');
    const scoreDetailsModal = document.getElementById('score-details-modal');
    const modalCloseButton = document.querySelector('#score-details-modal .close-button');
    const modalUserName = document.getElementById('modal-user-name');
    const modalScoreTableBody = document.getElementById('modal-score-table-body');
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    let allUsersCache = []; 

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
        adminPageContainer.style.display = 'block';
        setupEventListeners();
        loadAllUserData();
        fetchSupabaseHistory();
    };
    
    // --- ডেটা লোডিং এবং ক্যাশিং ---
    const loadAllUserData = async () => {
        if (userListLoading) userListLoading.style.display = 'block';
        try {
            const usersSnapshot = await db.collection('users').get();
            allUsersCache = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            const adminCount = allUsersCache.filter(user => user.role === 'admin').length;
            totalUsersStat.textContent = allUsersCache.length;
            totalAdminsStat.textContent = adminCount;
            renderUserTable(allUsersCache);
            populateChapterDropdownFromCache();

        } catch (error) {
            console.error("Error loading all user data:", error);
        } finally {
            if (userListLoading) userListLoading.style.display = 'none';
        }
    };

    const setupEventListeners = () => {
        if (userSearchInput) userSearchInput.addEventListener('input', handleUserSearch);
        if (chapterSelect) chapterSelect.addEventListener('change', () => {
            loadLeaderboardForChapter(chapterSelect.value);
        });
        if (userTableBody) userTableBody.addEventListener('click', handleUserTableActions);
        if (leaderboardTableBody) leaderboardTableBody.addEventListener('click', handleLeaderboardTableActions);
        
        // Score Modal
        if (modalCloseButton) modalCloseButton.addEventListener('click', () => scoreDetailsModal.style.display = 'none');
        if (scoreDetailsModal) window.addEventListener('click', (event) => { if (event.target === scoreDetailsModal) scoreDetailsModal.style.display = 'none'; });
        
        // Mobile Menu
        if (mobileMenuToggle && sidebar) mobileMenuToggle.addEventListener('click', () => { sidebar.classList.toggle('is-visible'); });

        // === Supabase Notification Event Listeners ===
        if(openSbModalBtn) openSbModalBtn.addEventListener('click', () => { sbModal.style.display = 'flex'; });
        if(closeSbModal) closeSbModal.addEventListener('click', () => { sbModal.style.display = 'none'; });
        if(sbModal) window.addEventListener('click', (e) => { if(e.target === sbModal) sbModal.style.display = 'none'; });
        if(sbForm) sbForm.addEventListener('submit', handleSupabaseSubmit);
        if(refreshHistoryBtn) refreshHistoryBtn.addEventListener('click', fetchSupabaseHistory);
        if(sbHistoryBody) sbHistoryBody.addEventListener('click', handleSupabaseDelete);
        
        // Android App Notification
        const androidBtn = document.getElementById('send-android-btn');
        if(androidBtn) androidBtn.addEventListener('click', sendAndroidNotification);
    };

    // === Supabase Notification Functions ===

    // ১. নোটিফিকেশন সাবমিট করা
    async function handleSupabaseSubmit(e) {
        e.preventDefault();
        const title = document.getElementById('sb-title').value;
        const message = document.getElementById('sb-message').value;
        
        const btn = e.target.querySelector('button');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> পাঠানো হচ্ছে...';
        btn.disabled = true;

        try {
            const { data, error } = await supabaseClient.from('notifications').insert([{ title: title, message: message, is_active: true }]).select();
            if (error) throw error;

            alert('নোটিফিকেশন সফলভাবে পাঠানো হয়েছে! Users homepage এ দেখতে পাবে।');
            sbForm.reset();
            sbModal.style.display = 'none';
            fetchSupabaseHistory();
        } catch (err) {
            alert('সমস্যা হয়েছে: ' + err.message);
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }
    async function fetchSupabaseHistory() {
        if(sbHistoryLoading) sbHistoryLoading.style.display = 'block';
        sbHistoryBody.innerHTML = '';

        const { data, error } = await supabaseClient
            .from('notifications')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10); // লেটেস্ট ১০টি

        if(sbHistoryLoading) sbHistoryLoading.style.display = 'none';

        if (error) {
            console.error('Error fetching history:', error);
            sbHistoryBody.innerHTML = '<tr><td colspan="5">ডাটা লোড করতে সমস্যা হয়েছে।</td></tr>';
            return;
        }

        if(!data || data.length === 0) {
            sbHistoryBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">কোনো বিজ্ঞপ্তি পাওয়া যায়নি।</td></tr>';
            return;
        }

        data.forEach(notif => {
            const date = new Date(notif.created_at).toLocaleDateString('en-US');
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${notif.title}</td>
                <td>${notif.message.substring(0, 30)}...</td>
                <td>${date}</td>
                <td>
                    <span class="role-badge" style="background:${notif.is_active ? '#2ecc71' : '#e74c3c'}; color:white;">
                        ${notif.is_active ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td class="action-cell">
                    <button class="btn-danger btn-sm sb-delete-btn" data-id="${notif.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            sbHistoryBody.appendChild(tr);
        });
    }

    // ৩. নোটিফিকেশন ডিলিট করা
    async function handleSupabaseDelete(e) {
        if (e.target.closest('.sb-delete-btn')) {
            const btn = e.target.closest('.sb-delete-btn');
            const id = btn.dataset.id;
            
            if(confirm('আপনি কি নিশ্চিত এই বিজ্ঞপ্তিটি মুছে ফেলতে চান?')) {
                const { error } = await supabaseClient
                    .from('notifications')
                    .delete()
                    .eq('id', id);
                
                if(error) {
                    alert('মুছে ফেলতে সমস্যা হয়েছে: ' + error.message);
                } else {
                    fetchSupabaseHistory(); // রিফ্রেশ
                }
            }
        }
    }

    // --- অন্যান্য সাধারণ ফাংশন (ট্যাব সুইচ, ব্রেডক্রাম্ব ইত্যাদি) ---

    const switchTab = (tabName) => {
        dashboardContent.style.display = 'none';
        leaderboardContent.style.display = 'none';

        if (tabName === 'dashboard') {
            dashboardContent.style.display = 'block';
            pageTitle.textContent = 'Dashboard';
        } else if (tabName === 'leaderboard') {
            leaderboardContent.style.display = 'block';
            pageTitle.textContent = 'Leaderboard';
            loadLeaderboardForChapter(chapterSelect.value);
        }
    };

    const updateBreadcrumb = (currentPage) => {};

    const renderUserTable = (users) => {
        userTableBody.innerHTML = '';
        users.sort((a,b) => (a.displayName || '').localeCompare(b.displayName || ''));
        users.forEach(user => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td><img src="${user.photoURL || 'images/default-avatar.png'}" class="table-profile-pic"></td><td>${user.displayName || 'N/A'}</td><td>${user.email || 'N/A'}</td><td><span class="role-badge role-${user.role || 'user'}">${user.role || 'user'}</span></td><td>${formatTimestamp(user.lastLogin)}</td><td class="action-cell"><select class="role-changer" data-user-id="${user.id}" data-current-role="${user.role || 'user'}"><option value="user" ${(!user.role || user.role === 'user') ? 'selected' : ''}>User</option><option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option></select></td>`;
            userTableBody.appendChild(tr);
        });
    };
    
    // --- লিডারবোর্ড ফাংশনালিটি ---
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

    const formatTimestamp = (ts) => (ts?.toDate) ? ts.toDate().toLocaleString('en-US') : 'N/A';
    
    const handleUserSearch = () => {
        const term = userSearchInput.value.toLowerCase();
        renderUserTable(allUsersCache.filter(u => (u.displayName || '').toLowerCase().includes(term) || (u.email || '').toLowerCase().includes(term)));
    };

    // === Android App Notification Function ===
    async function sendAndroidNotification() {
        const title = document.getElementById('android-title').value;
        const message = document.getElementById('android-message').value;
        const btn = document.getElementById('send-android-btn');

        if (!title || !message) {
            alert('দয়া করে টাইটেল এবং মেসেজ লিখুন।');
            return;
        }

        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> পাঠানো হচ্ছে...';

        try {
            // Supabase তে save করুন - Android app সেখান থেকে fetch করবে
            const { data, error } = await supabaseClient
                .from('android_notifications')
                .insert([{ 
                    title: title, 
                    message: message, 
                    created_at: new Date().toISOString(),
                    is_read: false 
                }]);

            if (error) throw error;

            alert('অ্যান্ড্রয়েড অ্যাপে সফলভাবে পাঠানো হয়েছে!');
            document.getElementById('android-title').value = '';
            document.getElementById('android-message').value = '';
        } catch (err) {
            console.error(err);
            alert('Error: ' + err.message);
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send to Android App';
        }
    }
});