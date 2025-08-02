// =======================================================
// সমন্বিত ওয়েবসাইট স্ক্রিপ্ট (সংস্করণ ২.৮ - নতুন অথেন্টিকেশন লজিকসহ)
// =======================================================

// === ফায়ারবেস এবং অথেন্টিকেশন হ্যান্ডলিং ===
function initializeFirebaseServices() {
    // Firebase লোড হয়েছে কিনা তা নিশ্চিত করা
    if (typeof firebase === 'undefined') {
        console.warn("Firebase SDK লোড হচ্ছে... ১০০ms পর আবার চেষ্টা করা হবে।");
        setTimeout(initializeFirebaseServices, 100);
        return;
    }

    const auth = firebase.auth();
    const db = firebase.firestore();

    // লগআউট ফাংশন
    function handleLogout(event) {
        event.preventDefault();
        auth.signOut().then(() => {
            console.log("ব্যবহারকারী সফলভাবে লগআউট হয়েছেন।");
            const isSubjectPage = window.location.pathname.includes('/subject/');
            const basePath = isSubjectPage ? '../' : '';
            window.location.href = basePath + 'index.html';
        }).catch(error => console.error('লগ আউট করতে সমস্যা হয়েছে:', error));
    }

    // ডেস্কটপ ও মোবাইল লগআউট বাটনে ইভেন্ট যোগ করা
    ['logout-btn-desktop', 'logout-btn-mobile'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.addEventListener('click', handleLogout);
    });

    // ব্যবহারকারীর লগইন স্ট্যাটাস পরিবর্তন হলে এই ফাংশনটি কাজ করবে
    auth.onAuthStateChanged(user => {
        if (user) {
            // ব্যবহারকারী লগইন করা থাকলে Firestore থেকে তার তথ্য আনা হবে
            db.collection('users').doc(user.uid).get()
                .then(doc => {
                    const userData = doc.exists ? doc.data() : { displayName: 'User', role: 'user' };
                    updateNavUI(user, userData);
                })
                .catch(error => {
                    console.error("Firestore থেকে ব্যবহারকারীর তথ্য আনতে সমস্যা হয়েছে:", error);
                    // কোনো সমস্যা হলে ডিফল্ট তথ্য দিয়ে UI আপডেট করা হবে
                    updateNavUI(user, { displayName: 'User', role: 'user' });
                });
        } else {
            // ব্যবহারকারী লগইন করা না থাকলে UI আপডেট করা হবে
            updateNavUI(null, null);
        }
    });
}

// === ন্যাভিগেশন UI আপডেট করার ফাংশন ===
function updateNavUI(user, userData) {
    const isLoggedIn = !!user; // ব্যবহারকারী লগইন করা আছে কিনা (true/false)
    const isAdmin = isLoggedIn && userData.role === 'admin'; // ব্যবহারকারী অ্যাডমিন কিনা (true/false)

    // প্রয়োজনীয় সব ইলিমেন্টকে একবারে ধরা
    const elements = {
        guestDesktop: document.getElementById('guest-link-desktop'),
        userDesktop: document.getElementById('user-link-desktop'),
        logoutDesktop: document.getElementById('logout-link-desktop'),
        adminDesktop: document.getElementById('admin-link-desktop'), // অ্যাডমিন লিংক
        userNameDisplay: document.getElementById('user-name-display'),
        
        guestMobile: document.getElementById('guest-link-mobile'),
        userMobile: document.getElementById('user-link-mobile'),
        logoutMobile: document.getElementById('logout-link-mobile'),
        adminMobile: document.getElementById('admin-link-mobile') // অ্যাডমিন লিংক
    };

    // সাধারণ ব্যবহারকারী ও গেস্টদের জন্য লিঙ্ক দেখানো/লুকানো
    if (elements.guestDesktop) elements.guestDesktop.style.display = isLoggedIn ? 'none' : 'block';
    if (elements.guestMobile) elements.guestMobile.style.display = isLoggedIn ? 'none' : 'block';
    
    if (elements.userDesktop) elements.userDesktop.style.display = isLoggedIn ? 'block' : 'none';
    if (elements.userMobile) elements.userMobile.style.display = isLoggedIn ? 'block' : 'none';

    if (elements.logoutDesktop) elements.logoutDesktop.style.display = isLoggedIn ? 'block' : 'none';
    if (elements.logoutMobile) elements.logoutMobile.style.display = isLoggedIn ? 'block' : 'none';

    // ইউজারের নাম দেখানো
    if (elements.userNameDisplay) {
        elements.userNameDisplay.textContent = isLoggedIn ? `স্বাগতম, ${userData.displayName.split(' ')[0]}`: '';
    }

    // শুধুমাত্র অ্যাডমিনের জন্য অ্যাডমিন প্যানেল লিঙ্ক দেখানো/লুকানো
    if (elements.adminDesktop) elements.adminDesktop.style.display = isAdmin ? 'block' : 'none';
    if (elements.adminMobile) elements.adminMobile.style.display = isAdmin ? 'block' : 'none';
}


// === পেজ লোড হলে অন্যান্য সব ফাংশনালিটি চালু করা ===
document.addEventListener('DOMContentLoaded', function () {
    // আপনার পুরনো কার্যকরী কোডগুলো এখানে অপরিবর্তিত রাখা হয়েছে
    const header = document.querySelector('.site-header');
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    const navToggle = document.querySelector('.mobile-nav-toggle');
    const mobileNavMenu = document.getElementById('mobile-navigation-menu');
    const notificationBtn = document.getElementById('show-notification-btn');
    const notificationModal = document.getElementById('notification-modal');
    const closeNotificationBtn = document.getElementById('close-notification-modal');
    const notificationList = document.getElementById('notification-list');
    const notificationBadge = document.getElementById('notification-badge');
    const clearAllBtn = document.getElementById('clear-all-notifications-btn');
    const closeFooterBtn = document.getElementById('close-notification-btn-footer');

    // স্ক্রল করলে হেডার এবং স্ক্রল-টু-টপ বাটন নিয়ন্ত্রণ
    window.addEventListener('scroll', () => {
        if (header) header.classList.toggle('scrolled', window.scrollY > 10);
        if (scrollTopBtn) scrollTopBtn.style.display = (window.scrollY > 100) ? "block" : "none";
    });

    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }

    // মোবাইল মেনু টগল করার ফাংশন
    function toggleMobileMenu(show) {
        if (!mobileNavMenu || !navToggle) return;
        mobileNavMenu.setAttribute('data-visible', show);
        navToggle.setAttribute('aria-expanded', show);
        document.body.style.overflow = show ? 'hidden' : '';
    }

    if (navToggle) {
        navToggle.addEventListener('click', () => {
            const isVisible = mobileNavMenu.getAttribute('data-visible') === 'true';
            toggleMobileMenu(!isVisible);
        });
    }

    // নোটিফিকেশন সিস্টেম (আপনার পুরনো কোড)
    if (typeof notifications !== 'undefined') {
        const isSubjectPage = window.location.pathname.includes('/subject/');
        const audioPath = isSubjectPage ? '../audio/notification.wav' : 'audio/notification.wav';
        const notificationSound = new Audio(audioPath);
        const getSeenNotifications = () => JSON.parse(localStorage.getItem('seenNotifications') || '[]');
        const updateNotificationBadge = () => {
            if (!notificationBadge) return;
            const seenIds = getSeenNotifications();
            const unseenCount = notifications.filter(n => !seenIds.includes(n.id)).length;
            const lastBadgeCount = parseInt(localStorage.getItem('lastBadgeCount') || '0');
            if (unseenCount > 0 && unseenCount > lastBadgeCount) {
                notificationSound.play().catch(e => console.error("Sound play error:", e));
            }
            localStorage.setItem('lastBadgeCount', unseenCount);
            notificationBadge.textContent = unseenCount;
            notificationBadge.style.display = unseenCount > 0 ? 'inline-block' : 'none';
        };
        const openNotificationModal = () => {
            if (!notificationModal || !notificationList) return;
            if (clearAllBtn) clearAllBtn.disabled = notifications.length === 0;
            notificationList.innerHTML = notifications.length > 0
                ? [...notifications].reverse().map(n => `<li>${n.message} <small>(${n.date})</small></li>`).join('')
                : "<li>কোনো নতুন নোটিফিকেশন নেই।</li>";
            notificationModal.classList.add('is-visible');
            document.body.style.overflow = 'hidden';
            localStorage.setItem('seenNotifications', JSON.stringify(notifications.map(n => n.id)));
            setTimeout(updateNotificationBadge, 100);
        };
        const closeNotificationModal = () => {
            if (!notificationModal) return;
            notificationModal.classList.remove('is-visible');
            document.body.style.overflow = '';
        };
        if (notificationBtn) notificationBtn.addEventListener('click', openNotificationModal);
        if (closeNotificationBtn) closeNotificationBtn.addEventListener('click', closeNotificationModal);
        if (closeFooterBtn) closeFooterBtn.addEventListener('click', closeNotificationModal);
        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', () => {
                localStorage.removeItem('seenNotifications');
                localStorage.removeItem('lastBadgeCount');
                updateNotificationBadge();
                if (notificationList) {
                    notificationList.innerHTML = "<li>সমস্ত নোটিফিকেশন সফলভাবে ক্লিয়ার করা হয়েছে।</li>";
                }
                clearAllBtn.disabled = true;
                setTimeout(closeNotificationModal, 1500);
            });
        }
        if (notificationModal) {
            notificationModal.addEventListener('click', (event) => {
                if (event.target === notificationModal) closeNotificationModal();
            });
        }
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (mobileNavMenu && mobileNavMenu.getAttribute('data-visible') === 'true') toggleMobileMenu(false);
                if (notificationModal && notificationModal.classList.contains('is-visible')) closeNotificationModal();
            }
        });
        updateNotificationBadge();
    }
});

// সবশেষে ফায়ারবেস সার্ভিস চালু করা
initializeFirebaseServices();