// =======================================================
// সমন্বিত ওয়েবসাইট স্ক্রিপ্ট (সংস্করণ ২.৪ - Firebase ইন্টিগ্রেশন সহ)
// =======================================================

// --- Firebase Authentication এবং UI ম্যানেজমেন্ট (নতুন এবং উন্নত) ---
// এই অংশটি উপরে আনা হয়েছে কারণ এটি পেজ লোডের শুরুতেই কাজ করা উচিত।

// একটি ফাংশন যা Firebase অবজেক্টগুলোকে ইনিশিয়ালাইজ করবে এবং Auth Listener যোগ করবে
function initializeFirebaseServices() {
    // Firebase লোড হয়েছে কিনা তা চেক করা
    if (typeof firebase !== 'undefined') {
        // Firebase সার্ভিসগুলো ইনিশিয়ালাইজ করা
        const auth = firebase.auth();
        const db = firebase.firestore();

        // লগ আউট ফাংশন
        function handleLogout(event) {
            event.preventDefault();
            auth.signOut().then(() => {
                console.log('User signed out successfully.');
                // লগআউট সফল হলে হোম পেজে রিডাইরেক্ট করা
                // পাথ ঠিক করার জন্য basePath ব্যবহার করা হচ্ছে
                const isSubjectPage = window.location.pathname.includes('/subject/');
                const basePath = isSubjectPage ? '../' : '';
                window.location.href = basePath + 'index.html';
            }).catch(error => {
                console.error('Sign out error:', error);
            });
        }

        // লগ আউট বাটনগুলোতে ইভেন্ট লিসেনার যোগ করা
        const logoutBtnDesktop = document.getElementById('logout-btn-desktop');
        const logoutBtnMobile = document.getElementById('logout-btn-mobile');
        if (logoutBtnDesktop) logoutBtnDesktop.addEventListener('click', handleLogout);
        if (logoutBtnMobile) logoutBtnMobile.addEventListener('click', handleLogout);

        // মূল Authentication State চেকার
        auth.onAuthStateChanged(user => {
            if (user) {
                // ইউজার লগইন করা আছে
                db.collection('users').doc(user.uid).get()
                    .then(doc => {
                        let userData = { name: 'ব্যবহারকারী', role: 'user' }; // ডিফল্ট ডেটা
                        if (doc.exists) {
                            userData = doc.data();
                        } else {
                            console.warn("User document not found in Firestore. Using default data.");
                        }
                        updateNavUI(user, userData); // UI আপডেট ফাংশন কল করা
                    })
                    .catch(error => {
                        console.error("Error fetching user data:", error);
                        // এরর হলেও একটি ডিফল্ট ভিউ দেখানো
                        updateNavUI(user, { name: 'ব্যবহারকারী', role: 'user' });
                    });
            } else {
                // ইউজার লগইন করা নেই
                updateNavUI(null, null);
            }
        });

    } else {
        // যদি Firebase লোড না হয়, তাহলে ১০০ মিলিসেকেন্ড পর আবার চেষ্টা করা
        // এটি নিশ্চিত করে যে script.js লোড হওয়ার আগেই যদি firebase sdk লোড না হয়, তাহলেও সমস্যা হবে না
        console.log("Waiting for Firebase to load...");
        setTimeout(initializeFirebaseServices, 100);
    }
}


// --- UI আপডেট করার ফাংশন ---
function updateNavUI(user, userData) {
    const isLoggedIn = !!user; // user অবজেক্ট থাকলে true, না থাকলে false

    // ডেস্কটপ ও মোবাইল ন্যাভের এলিমেন্ট সিলেকশন
    const guestLinkDesktop = document.getElementById('guest-link-desktop');
    const userLinkDesktop = document.getElementById('user-link-desktop');
    const logoutLinkDesktop = document.getElementById('logout-link-desktop');
    const dashboardLinkDesktop = document.getElementById('dashboard-link-desktop');
    const userNameDisplay = document.getElementById('user-name-display');
    
    const guestLinkMobile = document.getElementById('guest-link-mobile');
    const userLinkMobile = document.getElementById('user-link-mobile');
    const logoutLinkMobile = document.getElementById('logout-link-mobile');
    const dashboardLinkMobile = document.getElementById('dashboard-link-mobile');

    // পাথ ঠিক করার জন্য ভ্যারিয়েবল
    const isSubjectPage = window.location.pathname.includes('/subject/');
    const basePath = isSubjectPage ? '../' : '';
    
    // সব এলিমেন্টকে একসাথে হাইড/শো করা
    [guestLinkDesktop, guestLinkMobile].forEach(el => el ? el.style.display = isLoggedIn ? 'none' : 'list-item' : null);
    [userLinkDesktop, userLinkMobile].forEach(el => el ? el.style.display = isLoggedIn ? 'list-item' : 'none' : null);
    [logoutLinkDesktop, logoutLinkMobile].forEach(el => el ? el.style.display = isLoggedIn ? 'list-item' : 'none' : null);
    
    if (isLoggedIn && userData) {
        if (userNameDisplay) userNameDisplay.textContent = `স্বাগতম, ${userData.name.split(' ')[0]}`; // শুধু প্রথম নাম দেখানো
        
        // ইউজারের রোল অনুযায়ী ড্যাশবোর্ডের লিংক সেট করা
        const dashboardUrl = basePath + ((userData.role === 'admin') ? 'admin-dashboard.html' : 'user-dashboard.html');
        if (dashboardLinkDesktop) dashboardLinkDesktop.href = dashboardUrl;
        if (dashboardLinkMobile) dashboardLinkMobile.href = dashboardUrl;

    } else {
        // ইউজার লগইন করা না থাকলে
        if (userNameDisplay) userNameDisplay.textContent = '';

        // প্রোটেক্টেড পেজ থেকে লগইন পেজে রিডাইরেক্ট করা
        const protectedPages = ['user-dashboard.html', 'admin-dashboard.html'];
        const currentPage = window.location.pathname.split('/').pop();
        if (protectedPages.includes(currentPage)) {
            console.log("Access to protected page denied. Redirecting to login.");
            window.location.href = basePath + 'login.html';
        }
    }
}

// =======================================================
// === আপনার পুরনো এবং কার্যকরী কোড (কোনো পরিবর্তন করা হয়নি) ===
// =======================================================

document.addEventListener('DOMContentLoaded', function () {
    
    // --- ১. গ্লোবাল ভ্যারিয়েবল এবং এলিমেন্ট সিলেকশন ---
    const header = document.querySelector('.site-header'); // Note: This might be different in your HTML
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
        
        updateNotificationBadge();
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

// সবশেষে Firebase সার্ভিসগুলো ইনিশিয়ালাইজ করার জন্য ফাংশনটি কল করা
initializeFirebaseServices();
