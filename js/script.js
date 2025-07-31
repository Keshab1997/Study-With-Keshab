// =======================================================
// সমন্বিত ওয়েবসাইট স্ক্রিপ্ট (সংস্করণ ২.৩ - পাথ হ্যান্ডলিং সহ)
// =======================================================

document.addEventListener('DOMContentLoaded', function () {
    
    // --- ১. গ্লোবাল ভ্যারিয়েবল এবং এলিমেন্ট সিলেকশন ---
    const header = document.querySelector('.site-header');
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    
    // মোবাইল নেভিগেশন এলিমেন্টস
    const navToggle = document.querySelector('.mobile-nav-toggle');
    const mobileNavMenu = document.getElementById('mobile-navigation-menu');

    // নোটিফিকেশন এলিমেন্টস
    const notificationBtn = document.getElementById('show-notification-btn');
    const notificationModal = document.getElementById('notification-modal');
    const closeNotificationBtn = document.getElementById('close-notification-modal');
    const notificationList = document.getElementById('notification-list');
    const notificationBadge = document.getElementById('notification-badge');

    // --- ২. হেডার এবং স্ক্রল-টু-টপ ---
    window.addEventListener('scroll', () => {
        // null check for header
        if (header) {
            header.classList.toggle('scrolled', window.scrollY > 10);
        }
        if (scrollTopBtn) {
            scrollTopBtn.style.display = (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) ? "block" : "none";
        }
    });

    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // --- ৩. মোবাইল মেনু সিস্টেম ---
    function toggleMobileMenu(show) {
        if (!mobileNavMenu || !navToggle) return;
        const isVisible = show;
        mobileNavMenu.setAttribute('data-visible', isVisible);
        navToggle.setAttribute('aria-expanded', isVisible);
        document.body.style.overflow = isVisible ? 'hidden' : '';
    }

    if (navToggle && mobileNavMenu) {
        navToggle.addEventListener('click', () => {
            const isVisible = mobileNavMenu.getAttribute('data-visible') === 'true';
            toggleMobileMenu(!isVisible);
        });
        mobileNavMenu.querySelectorAll('a').forEach(link => {
            // logout button এর id তে 'logout' শব্দটি থাকতে পারে, তাই এভাবে চেক করা হচ্ছে
            if (link.id.indexOf('logout') === -1) { 
                link.addEventListener('click', () => toggleMobileMenu(false));
            }
        });
    }
    
    // --- ৪. নোটিফিকেশন সিস্টেম ---
    if (typeof notifications !== 'undefined') {
        const isSubjectPage = window.location.pathname.includes('/subject/');
        const audioPath = isSubjectPage ? '../audio/notification.wav' : 'audio/notification.wav';

        function playNotificationSound() {
            const audio = new Audio(audioPath); 
            audio.play().catch(e => console.error("Sound play error:", e));
        }

        function getSeenNotifications() {
            return JSON.parse(localStorage.getItem('seenNotifications') || '[]');
        }

        function updateNotificationBadge() {
            if (!notificationBadge) return;
            const allNotificationIds = notifications.map(n => n.id);
            const seenNotificationIds = getSeenNotifications();
            const unseenCount = allNotificationIds.filter(id => !seenNotificationIds.includes(id)).length;
            const currentBadgeCount = parseInt(notificationBadge.textContent) || 0;
            if (unseenCount > 0 && unseenCount > currentBadgeCount) {
                 playNotificationSound();
            }
            notificationBadge.textContent = unseenCount;
            notificationBadge.style.display = unseenCount > 0 ? 'inline-block' : 'none';
            localStorage.setItem('allNotifications', JSON.stringify(notifications));
        }

        function showNotificationModal() {
            if (!notificationModal || !notificationList) return;
            notificationList.innerHTML = notifications.length
                ? [...notifications].reverse().map(n => `<li>${n.message} <small style="color:#888;">(${n.date})</small></li>`).join('')
                : "<li>কোনো নতুন নোটিফিকেশন নেই।</li>";
            notificationModal.classList.add('is-visible');
            document.body.style.overflow = 'hidden';
            const allNotificationIds = notifications.map(n => n.id);
            localStorage.setItem('seenNotifications', JSON.stringify(allNotificationIds));
            setTimeout(updateNotificationBadge, 300);
        }

        function closeNotificationModal() {
            if (notificationModal) {
                notificationModal.classList.remove('is-visible');
                document.body.style.overflow = '';
            }
        }
        
        if (notificationBtn) notificationBtn.addEventListener('click', showNotificationModal);
        if (closeNotificationBtn) closeNotificationBtn.addEventListener('click', closeNotificationModal);
        if (notificationModal) {
            notificationModal.addEventListener('click', (event) => {
                if (event.target === notificationModal) closeNotificationModal();
            });
        }
        
        updateNotificationBadge(); // ইনিশিয়ালাইজেশন
    } else {
        // console.warn("Warning: 'notifications' array not found. Notification system disabled on this page.");
    }

    // --- ৫. গ্লোবাল কী-বোর্ড ইভেন্ট ---
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            if (mobileNavMenu && mobileNavMenu.getAttribute('data-visible') === 'true') {
                toggleMobileMenu(false);
            }
            if (notificationModal && notificationModal.classList.contains('is-visible')) {
                closeNotificationModal();
            }
        }
    });

});

// =======================================================
// === নতুন: Firebase Authentication এবং UI ম্যানেজমেন্ট (সংস্করণ ১.১) ===
// =======================================================

// এই অংশটি DOMContentLoaded এর বাইরে থাকবে কারণ এটি Firebase লোড হওয়ার সাথে সাথে কাজ করবে

// Firebase অবজেক্টগুলো আগে থেকে ডিক্লেয়ার করা, যাতে পরে ব্যবহার করা যায়
let auth;
let db;

// একটি ফাংশন যা Firebase অবজেক্টগুলোকে ইনিশিয়ালাইজ করবে
function initializeFirebaseServices() {
    if (typeof firebase !== 'undefined') {
        auth = firebase.auth();
        db = firebase.firestore();
        attachAuthListener(); // Firebase ইনিশিয়ালাইজ হওয়ার পরেই Auth listener যোগ করা
    } else {
        // যদি Firebase লোড না হয়, তাহলে ১০০ মিলিসেকেন্ড পর আবার চেষ্টা করা
        setTimeout(initializeFirebaseServices, 100);
    }
}


// --- Auth UI এলিমেন্ট সিলেকশন ---
const guestLinkDesktop = document.getElementById('guest-link-desktop');
const userLinkDesktop = document.getElementById('user-link-desktop');
const logoutLinkDesktop = document.getElementById('logout-link-desktop');
const dashboardLinkDesktop = document.getElementById('dashboard-link-desktop');
const logoutBtnDesktop = document.getElementById('logout-btn-desktop');
const userNameDisplay = document.getElementById('user-name-display');
const guestLinkMobile = document.getElementById('guest-link-mobile');
const userLinkMobile = document.getElementById('user-link-mobile');
const logoutLinkMobile = document.getElementById('logout-link-mobile');
const dashboardLinkMobile = document.getElementById('dashboard-link-mobile');
const logoutBtnMobile = document.getElementById('logout-btn-mobile');

// --- পাথ ঠিক করার জন্য একটি ভ্যারিয়েবল ---
// আমরা subject ফোল্ডারের ভেতরে আছি কিনা তা চেক করা হচ্ছে
const isSubjectPage = window.location.pathname.includes('/subject/');
const basePath = isSubjectPage ? '../' : '';


// --- UI আপডেট করার ফাংশন ---
function updateNavUI(user, userData) {
    const isLoggedIn = !!user;

    [guestLinkDesktop, guestLinkMobile].forEach(el => el ? el.style.display = isLoggedIn ? 'none' : 'list-item' : null);
    [userLinkDesktop, userLinkMobile].forEach(el => el ? el.style.display = isLoggedIn ? 'list-item' : 'none' : null);
    [logoutLinkDesktop, logoutLinkMobile].forEach(el => el ? el.style.display = isLoggedIn ? 'list-item' : 'none' : null);
    
    if (isLoggedIn && userData) {
        if (userNameDisplay) userNameDisplay.textContent = `স্বাগতম, ${userData.name.split(' ')[0]}`;
        // পাথ ঠিক করে ড্যাশবোর্ডের URL সেট করা
        const dashboardUrl = basePath + ((userData.role === 'admin') ? 'admin-dashboard.html' : 'user-dashboard.html');
        if (dashboardLinkDesktop) dashboardLinkDesktop.href = dashboardUrl;
        if (dashboardLinkMobile) dashboardLinkMobile.href = dashboardUrl;
    } else {
        if (userNameDisplay) userNameDisplay.textContent = '';
    }
}

// --- লগ আউট ফাংশন ---
function handleLogout(event) {
    event.preventDefault();
    if (!auth) return; // auth ইনিশিয়ালাইজ না হলে কিছু না করা
    auth.signOut().then(() => {
        console.log('User signed out successfully.');
        updateNavUI(null, null);
        // পাথ ঠিক করে হোমপেজে রিডাইরেক্ট করা
        window.location.href = basePath + 'index.html';
    }).catch(error => {
        console.error('Sign out error:', error);
    });
}

// লগ আউট বাটনে ইভেন্ট লিসেনার যোগ করা
if (logoutBtnDesktop) logoutBtnDesktop.addEventListener('click', handleLogout);
if (logoutBtnMobile) logoutBtnMobile.addEventListener('click', handleLogout);


// --- মূল Authentication State চেকার ---
function attachAuthListener() {
    if (!auth) return;
    auth.onAuthStateChanged(user => {
        if (user) {
            db.collection('users').doc(user.uid).get()
                .then(doc => {
                    if (doc.exists) {
                        updateNavUI(user, doc.data());
                    } else {
                        updateNavUI(user, { name: 'ব্যবহারকারী', role: 'student' });
                    }
                })
                .catch(error => {
                    console.error("Error fetching user data:", error);
                    updateNavUI(user, { name: 'ব্যবহারকারী', role: 'student' });
                });
        } else {
            updateNavUI(null, null);
        }
    });
}

// Firebase সার্ভিসগুলো ইনিশিয়ালাইজ করার জন্য ফাংশনটি কল করা
initializeFirebaseServices();
