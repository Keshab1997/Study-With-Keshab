// =======================================================
// সমন্বিত ওয়েবসাইট স্ক্রিপ্ট (সংস্করণ ২.৬ - নতুন বাটন সহ)
// =======================================================

function initializeFirebaseServices() {
    if (typeof firebase === 'undefined') {
        console.warn("Firebase SDK লোড হচ্ছে... ১০০ms পর আবার চেষ্টা করা হবে।");
        setTimeout(initializeFirebaseServices, 100);
        return;
    }

    const auth = firebase.auth();
    const db = firebase.firestore();

    function handleLogout(event) {
        event.preventDefault();
        auth.signOut().then(() => {
            const isSubjectPage = window.location.pathname.includes('/subject/');
            const basePath = isSubjectPage ? '../' : '';
            window.location.href = basePath + 'index.html';
        }).catch(error => console.error('লগ আউট করতে সমস্যা হয়েছে:', error));
    }

    ['logout-btn-desktop', 'logout-btn-mobile'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.addEventListener('click', handleLogout);
    });

    auth.onAuthStateChanged(user => {
        if (user) {
            db.collection('users').doc(user.uid).get()
                .then(doc => {
                    const userData = doc.exists ? doc.data() : { name: 'ব্যবহারকারী', role: 'user' };
                    updateNavUI(user, userData);
                })
                .catch(error => {
                    console.error("Firestore থেকে ব্যবহারকারীর তথ্য আনতে সমস্যা হয়েছে:", error);
                    updateNavUI(user, { name: 'ব্যবহারকারী', role: 'user' });
                });
        } else {
            updateNavUI(null, null);
        }
    });
}

function updateNavUI(user, userData) {
    const isLoggedIn = !!user;
    const isSubjectPage = window.location.pathname.includes('/subject/');
    const basePath = isSubjectPage ? '../' : '';

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

    if (elements.guestDesktop) elements.guestDesktop.style.display = isLoggedIn ? 'none' : 'list-item';
    if (elements.guestMobile) elements.guestMobile.style.display = isLoggedIn ? 'none' : 'list-item';
    if (elements.userDesktop) elements.userDesktop.style.display = isLoggedIn ? 'list-item' : 'none';
    if (elements.userMobile) elements.userMobile.style.display = isLoggedIn ? 'list-item' : 'none';
    if (elements.logoutDesktop) elements.logoutDesktop.style.display = isLoggedIn ? 'list-item' : 'none';
    if (elements.logoutMobile) elements.logoutMobile.style.display = isLoggedIn ? 'list-item' : 'none';

    if (isLoggedIn && userData) {
        if (elements.userNameDisplay) {
            elements.userNameDisplay.textContent = `স্বাগতম, ${userData.name.split(' ')[0]}`;
        }
        const dashboardUrl = basePath + (userData.role === 'admin' ? 'admin-dashboard.html' : 'user-dashboard.html');
        if (elements.dashboardDesktop) elements.dashboardDesktop.href = dashboardUrl;
        if (elements.dashboardMobile) elements.dashboardMobile.href = dashboardUrl;
    } else {
        if (elements.userNameDisplay) elements.userNameDisplay.textContent = '';
        const protectedPages = ['user-dashboard.html', 'admin-dashboard.html'];
        const currentPage = window.location.pathname.split('/').pop();
        if (protectedPages.includes(currentPage)) {
            window.location.href = basePath + 'login.html';
        }
    }
}

document.addEventListener('DOMContentLoaded', function () {
    
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

    window.addEventListener('scroll', () => {
        if (header) header.classList.toggle('scrolled', window.scrollY > 10);
        if (scrollTopBtn) scrollTopBtn.style.display = (window.scrollY > 100) ? "block" : "none";
    });

    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }

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

initializeFirebaseServices();
