// =======================================================
// সমন্বিত ওয়েবসাইট স্ক্রিপ্ট (সংস্করণ ২.৫ - পূর্ণাঙ্গ এবং সংশোধিত)
// =======================================================

/**
 * এই ফাংশনটি Firebase সার্ভিস (Auth, Firestore) ইনিশিয়ালাইজ করে
 * এবং ব্যবহারকারীর লগইন অবস্থার উপর ভিত্তি করে UI আপডেট করে।
 */
function initializeFirebaseServices() {
    if (typeof firebase === 'undefined') {
        console.warn("Firebase SDK লোড হচ্ছে... ১০০ms পর আবার চেষ্টা করা হবে।");
        setTimeout(initializeFirebaseServices, 100);
        return;
    }

    const auth = firebase.auth();
    const db = firebase.firestore();

    // --- লগ আউট হ্যান্ডলার ---
    function handleLogout(event) {
        event.preventDefault();
        auth.signOut().then(() => {
            console.log('ব্যবহারকারী সফলভাবে লগ আউট হয়েছেন।');
            const isSubjectPage = window.location.pathname.includes('/subject/');
            const basePath = isSubjectPage ? '../' : '';
            window.location.href = basePath + 'index.html';
        }).catch(error => {
            console.error('লগ আউট করতে সমস্যা হয়েছে:', error);
        });
    }

    // লগ আউট বাটনগুলোতে ইভেন্ট লিসেনার যোগ করা
    ['logout-btn-desktop', 'logout-btn-mobile'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.addEventListener('click', handleLogout);
    });

    // --- Auth State Listener ---
    // ব্যবহারকারী লগইন বা লগ আউট করলে এই ফাংশনটি স্বয়ংক্রিয়ভাবে কাজ করে
    auth.onAuthStateChanged(user => {
        if (user) {
            // ব্যবহারকারী লগইন করা আছেন
            db.collection('users').doc(user.uid).get()
                .then(doc => {
                    const userData = doc.exists ? doc.data() : { name: 'ব্যবহারকারী', role: 'user' };
                    updateNavUI(user, userData);
                })
                .catch(error => {
                    console.error("Firestore থেকে ব্যবহারকারীর তথ্য আনতে সমস্যা হয়েছে:", error);
                    updateNavUI(user, { name: 'ব্যবহারকারী', role: 'user' }); // ফলব্যাক UI
                });
        } else {
            // ব্যবহারকারী লগইন করা নেই
            updateNavUI(null, null);
        }
    });
}

/**
 * লগইন অবস্থার উপর ভিত্তি করে নেভিগেশন বারের UI পরিবর্তন করে।
 * @param {object|null} user - Firebase Auth user object.
 * @param {object|null} userData - Firestore user data.
 */
function updateNavUI(user, userData) {
    const isLoggedIn = !!user;
    const isSubjectPage = window.location.pathname.includes('/subject/');
    const basePath = isSubjectPage ? '../' : '';

    // ডেস্কটপ ও মোবাইল এলিমেন্ট আইডি-গুলো একটি অ্যারেতে রাখা হলো
    const elements = {
        guestDesktop: document.getElementById('guest-link-desktop'),
        userDesktop: document.getElementById('user-link-desktop'),
        logoutDesktop: document.getElementById('logout-link-desktop'),
        dashboardDesktop: document.getElementById('dashboard-link-desktop'),
        userNameDisplay: document.getElementById('user-name-display'),
        guestMobile: document.getElementById('guest-link-mobile'),
        userMobile: document.getElementById('user-link-mobile'),
        logoutMobile: document.getElementById('logout-link-mobile'),
        dashboardMobile: document.getElementById('dashboard-link-mobile'),
    };

    // লগইন/লগআউট অবস্থা অনুযায়ী লিঙ্ক দেখানো/লুকানো
    if (elements.guestDesktop) elements.guestDesktop.style.display = isLoggedIn ? 'none' : 'list-item';
    if (elements.guestMobile) elements.guestMobile.style.display = isLoggedIn ? 'none' : 'list-item';
    if (elements.userDesktop) elements.userDesktop.style.display = isLoggedIn ? 'list-item' : 'none';
    if (elements.userMobile) elements.userMobile.style.display = isLoggedIn ? 'list-item' : 'none';
    if (elements.logoutDesktop) elements.logoutDesktop.style.display = isLoggedIn ? 'list-item' : 'none';
    if (elements.logoutMobile) elements.logoutMobile.style.display = isLoggedIn ? 'list-item' : 'none';

    if (isLoggedIn && userData) {
        // ব্যবহারকারীর নাম দেখানো
        if (elements.userNameDisplay) {
            elements.userNameDisplay.textContent = `স্বাগতম, ${userData.name.split(' ')[0]}`;
        }
        // রোল অনুযায়ী ড্যাশবোর্ড লিঙ্ক সেট করা
        const dashboardUrl = basePath + (userData.role === 'admin' ? 'admin-dashboard.html' : 'user-dashboard.html');
        if (elements.dashboardDesktop) elements.dashboardDesktop.href = dashboardUrl;
        if (elements.dashboardMobile) elements.dashboardMobile.href = dashboardUrl;
    } else {
        // লগ আউট অবস্থায় ব্যবহারকারীর নাম মুছে দেওয়া
        if (elements.userNameDisplay) elements.userNameDisplay.textContent = '';

        // প্রোটেক্টেড পেজ থেকে রিডাইরেক্ট করা
        const protectedPages = ['user-dashboard.html', 'admin-dashboard.html'];
        const currentPage = window.location.pathname.split('/').pop();
        if (protectedPages.includes(currentPage)) {
            window.location.href = basePath + 'login.html';
        }
    }
}


// =======================================================
// === DOMContentLoaded: পেজ লোড হওয়ার পর এই কোডগুলো রান হবে ===
// =======================================================

document.addEventListener('DOMContentLoaded', function () {
    
    // --- ১. গ্লোবাল এলিমেন্ট সিলেকশন ---
    const header = document.querySelector('.site-header');
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    const navToggle = document.querySelector('.mobile-nav-toggle');
    const mobileNavMenu = document.getElementById('mobile-navigation-menu');
    const notificationBtn = document.getElementById('show-notification-btn');
    const notificationModal = document.getElementById('notification-modal');
    const closeNotificationBtn = document.getElementById('close-notification-modal');
    const notificationList = document.getElementById('notification-list');
    const notificationBadge = document.getElementById('notification-badge');

    // --- ২. হেডার এবং স্ক্রল-টু-টপ বাটন ---
    window.addEventListener('scroll', () => {
        if (header) header.classList.toggle('scrolled', window.scrollY > 10);
        if (scrollTopBtn) scrollTopBtn.style.display = (window.scrollY > 100) ? "block" : "none";
    });

    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }

    // --- ৩. মোবাইল মেনু সিস্টেম ---
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

    // --- ৪. নোটিফিকেশন সিস্টেম (সংশোধিত এবং কার্যকরী) ---
    if (typeof notifications !== 'undefined') {
        const isSubjectPage = window.location.pathname.includes('/subject/');
        const audioPath = isSubjectPage ? '../audio/notification.wav' : 'audio/notification.wav';
        const notificationSound = new Audio(audioPath);

        const getSeenNotifications = () => JSON.parse(localStorage.getItem('seenNotifications') || '[]');

        const updateNotificationBadge = () => {
            if (!notificationBadge) return;
            const seenIds = getSeenNotifications();
            const unseenCount = notifications.filter(n => !seenIds.includes(n.id)).length;
            
            // নতুন নোটিফিকেশন আসলেই কেবল শব্দ হবে
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
            
            // নোটিফিকেশন তালিকা তৈরি করা
            notificationList.innerHTML = notifications.length > 0
                ? [...notifications].reverse().map(n => `<li>${n.message} <small>(${n.date})</small></li>`).join('')
                : "<li>কোনো নতুন নোটিফিকেশন নেই।</li>";

            // মডাল দেখানো
            notificationModal.classList.add('is-visible');
            document.body.style.overflow = 'hidden'; // পেছনের স্ক্রল বন্ধ করা

            // সব নোটিফিকেশনকে 'seen' হিসেবে মার্ক করা
            localStorage.setItem('seenNotifications', JSON.stringify(notifications.map(n => n.id)));
            setTimeout(updateNotificationBadge, 100); // ব্যাজ আপডেট করা
        };

        const closeNotificationModal = () => {
            if (!notificationModal) return;
            notificationModal.classList.remove('is-visible');
            document.body.style.overflow = ''; // স্ক্রল আবার চালু করা
        };
        
        // ইভেন্ট লিসেনার যোগ করা
        if (notificationBtn) notificationBtn.addEventListener('click', openNotificationModal);
        if (closeNotificationBtn) closeNotificationBtn.addEventListener('click', closeNotificationModal);
        
        // মডালের বাইরে ক্লিক করলে বন্ধ হবে
        if (notificationModal) {
            notificationModal.addEventListener('click', (event) => {
                if (event.target === notificationModal) {
                    closeNotificationModal();
                }
            });
        }
        
        // --- ৫. গ্লোবাল কী-বোর্ড ইভেন্ট ---
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (mobileNavMenu && mobileNavMenu.getAttribute('data-visible') === 'true') {
                    toggleMobileMenu(false);
                }
                if (notificationModal && notificationModal.classList.contains('is-visible')) {
                    closeNotificationModal();
                }
            }
        });

        // পেজ লোড হলে প্রথমবার ব্যাজ আপডেট করা
        updateNotificationBadge();
    }
});

// সবশেষে Firebase সার্ভিসগুলো চালু করা
initializeFirebaseServices();
