// =======================================================
// সমন্বিত ওয়েবসাইট স্ক্রিপ্ট (সংস্করণ ৩.০ - Firestore নোটিফিকেশন সহ)
// =======================================================

// === পেজ লোড হলে সকল ফাংশনালিটি চালু করা ===
document.addEventListener('DOMContentLoaded', function () {
    const header = document.querySelector('.site-header');
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    const navToggle = document.querySelector('.mobile-nav-toggle');
    const mobileNavMenu = document.getElementById('mobile-navigation-menu');
    const notificationBtn = document.getElementById('show-notification-btn');
    const notificationModal = document.getElementById('notification-modal');
    const closeNotificationBtn = document.getElementById('close-notification-modal');
    const closeFooterBtn = document.getElementById('close-notification-btn-footer');
    
    // ---------------------------------------------------
    // বিভাগ ১: সাধারণ UI ফাংশনালিটি (স্ক্রল, মোবাইল মেনু ইত্যাদি)
    // ---------------------------------------------------

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

    // ---------------------------------------------------
    // বিভাগ ২: নতুন ডাইনামিক নোটিফিকেশন সিস্টেম (Firestore ভিত্তিক)
    // ---------------------------------------------------

    let lastSeenTimestamp = null; // সর্বশেষ দেখা নোটিফিকেশনের সময়

    // আন-রিড নোটিফিকেশন সংখ্যা গণনা এবং ব্যাজ আপডেট
    function updateNotificationBadge() {
        if (typeof firebase === 'undefined' || !firebase.auth().currentUser) return;

        const db = firebase.firestore();
        const notificationBadge = document.getElementById('notification-badge');
        if (!notificationBadge) return;

        // লোকাল স্টোরেজ থেকে সর্বশেষ দেখা নোটিফিকেশনের সময় আনা
        lastSeenTimestamp = localStorage.getItem('lastSeenNotificationTimestamp');
        
        let query = db.collection('notifications');
        // যদি আগে কোনো নোটিফিকেশন দেখা হয়ে থাকে, তবে তার পরেরগুলো গণনা করা হবে
        if (lastSeenTimestamp) {
            query = query.where('createdAt', '>', new Date(parseInt(lastSeenTimestamp)));
        }

        query.get().then(snapshot => {
            const unseenCount = snapshot.size;
            notificationBadge.textContent = unseenCount;
            notificationBadge.style.display = unseenCount > 0 ? 'inline-block' : 'none';
        }).catch(err => console.error("Error fetching unseen notifications count:", err));
    }

    // নোটিফিকেশন মডাল খোলা এবং Firestore থেকে ডেটা লোড করা
    function openNotificationModal() {
        if (!notificationModal) return;
        const notificationList = document.getElementById('notification-list');
        const clearAllBtn = document.getElementById('clear-all-notifications-btn');

        const db = firebase.firestore();
        db.collection('notifications').orderBy('createdAt', 'desc').limit(20).get()
            .then(snapshot => {
                notificationList.innerHTML = ''; 
                if (snapshot.empty) {
                    notificationList.innerHTML = "<li>কোনো নতুন নোটিফিকেশন নেই।</li>";
                    if (clearAllBtn) clearAllBtn.disabled = true;
                } else {
                    snapshot.forEach(doc => {
                        const notification = doc.data();
                        const item = document.createElement('li');
                        item.innerHTML = `
                            <a href="${notification.link || '#'}" class="notification-item-link">
                                <div class="modal-notif-title">${notification.title}</div>
                                <div class="modal-notif-body">${notification.body}</div>
                                <small>${formatTimeAgo(notification.createdAt)}</small>
                            </a>`;
                        notificationList.appendChild(item);
                    });
                    if (clearAllBtn) clearAllBtn.disabled = false;
                }

                // মডাল দেখানো
                notificationModal.classList.add('is-visible');
                document.body.style.overflow = 'hidden';

                // নতুন নোটিফিকেশন ব্যাজ রিসেট করা
                if (!snapshot.empty) {
                    const latestTimestamp = snapshot.docs[0].data().createdAt.toDate().getTime();
                    localStorage.setItem('lastSeenNotificationTimestamp', latestTimestamp);
                }
                setTimeout(updateNotificationBadge, 100);

            }).catch(error => {
                console.error("Error loading notifications for modal:", error);
                notificationList.innerHTML = "<li>নোটিফিকেশন লোড করতে সমস্যা হয়েছে।</li>";
            });
    }

    function closeNotificationModal() {
        if (!notificationModal) return;
        notificationModal.classList.remove('is-visible');
        document.body.style.overflow = '';
    }

    if (notificationBtn) notificationBtn.addEventListener('click', openNotificationModal);
    if (closeNotificationBtn) closeNotificationBtn.addEventListener('click', closeNotificationModal);
    if (closeFooterBtn) closeFooterBtn.addEventListener('click', closeNotificationModal);

    // সব নোটিফিকেশন "পড়া" হিসাবে চিহ্নিত করা (আসলে শুধু লোকাল স্টোরেজ ক্লিয়ার)
    const clearAllBtn = document.getElementById('clear-all-notifications-btn');
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', () => {
            // এই ফাংশনটি এখন আর নোটিফিকেশন ডিলিট করবে না, শুধু seen স্ট্যাটাস রিসেট করবে
            localStorage.removeItem('lastSeenNotificationTimestamp');
            const notificationList = document.getElementById('notification-list');
            if (notificationList) {
                notificationList.innerHTML = "<li>সব নোটিফিকেশন পুনরায় আন-রিড করা হয়েছে।</li>";
            }
            updateNotificationBadge();
            setTimeout(closeNotificationModal, 1500);
        });
    }
    
    // মডালের বাইরে ক্লিক করলে বা Escape চাপলে বন্ধ করা
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

    // ---------------------------------------------------
    // বিভাগ ৩: ফায়ারবেস অথেন্টিকেশন এবং UI আপডেট
    // ---------------------------------------------------

    function initializeFirebaseServices() {
        if (typeof firebase === 'undefined') {
            setTimeout(initializeFirebaseServices, 100);
            return;
        }

        const auth = firebase.auth();
        const db = firebase.firestore();

        auth.onAuthStateChanged(user => {
            updateNavUI(user);
            if (user) {
                // ব্যবহারকারী লগইন করা থাকলেই নোটিফিকেশন ব্যাজ আপডেট হবে
                updateNotificationBadge(); 
            } else {
                // লগ আউট হলে ব্যাজ হাইড করে দেওয়া
                const notificationBadge = document.getElementById('notification-badge');
                if (notificationBadge) notificationBadge.style.display = 'none';
            }
        });

        // লগআউট বাটনে ইভেন্ট যোগ করা
        document.body.addEventListener('click', (e) => {
            if (e.target.id === 'logout-btn-desktop' || e.target.id === 'logout-btn-mobile') {
                e.preventDefault();
                auth.signOut().catch(error => console.error('লগ আউট করতে সমস্যা হয়েছে:', error));
            }
        });
    }

    function updateNavUI(user) {
        const isLoggedIn = !!user;
        const elements = {
            guestDesktop: document.getElementById('guest-link-desktop'),
            userDesktop: document.getElementById('user-info-cluster'),
            logoutDesktop: document.getElementById('logout-link-desktop'),
            adminDesktop: document.getElementById('admin-link-desktop'),
            userNameDisplay: document.getElementById('user-name-display'),
            guestMobile: document.getElementById('guest-link-mobile'),
            userMobile: document.getElementById('user-link-mobile'),
            logoutMobile: document.getElementById('logout-link-mobile'),
            adminMobile: document.getElementById('admin-link-mobile')
        };

        if (elements.guestDesktop) elements.guestDesktop.style.display = isLoggedIn ? 'none' : 'block';
        if (elements.guestMobile) elements.guestMobile.style.display = isLoggedIn ? 'none' : 'block';
        
        if (elements.userDesktop) elements.userDesktop.style.display = isLoggedIn ? 'flex' : 'none';
        if (elements.logoutDesktop) elements.logoutDesktop.style.display = isLoggedIn ? 'block' : 'none';
        
        if (elements.userMobile) elements.userMobile.style.display = 'none'; // মোবাইল মেনুতে আর ইউজার নেম দেখাচ্ছি না
        if (elements.logoutMobile) elements.logoutMobile.style.display = isLoggedIn ? 'block' : 'none';
        
        if (isLoggedIn) {
            if (elements.userNameDisplay) {
                elements.userNameDisplay.textContent = user.displayName ? `${user.displayName.split(' ')[0]}` : 'User';
            }
            // অ্যাডমিন রোল চেক
            firebase.firestore().collection('users').doc(user.uid).get().then(doc => {
                const isAdmin = doc.exists && doc.data().role === 'admin';
                if (elements.adminDesktop) elements.adminDesktop.style.display = isAdmin ? 'block' : 'none';
                if (elements.adminMobile) elements.adminMobile.style.display = isAdmin ? 'block' : 'none';
            });
        } else {
            if (elements.adminDesktop) elements.adminDesktop.style.display = 'none';
            if (elements.adminMobile) elements.adminMobile.style.display = 'none';
        }
    }
    
    // সবশেষে ফায়ারবেস সার্ভিস চালু করা
    initializeFirebaseServices();
});

// === হেল্পার ফাংশন: সময় ফরম্যাট করার জন্য ===
function formatTimeAgo(timestamp) {
    if (!timestamp || !timestamp.toDate) return '';
    const now = new Date();
    const seconds = Math.floor((now - timestamp.toDate()) / 1000);
    if (seconds < 60) return "এইমাত্র";
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " বছর আগে";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " মাস আগে";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " দিন আগে";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " ঘন্টা আগে";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " মিনিট আগে";
    return Math.floor(seconds) + " সেকেন্ড আগে";
}