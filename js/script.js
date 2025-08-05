// =======================================================
// সমন্বিত ওয়েবসাইট স্ক্রিপ্ট (সংস্করণ ৪.০ - রিয়েল-টাইম ফিড সহ)
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
    // বিভাগ ১: সাধারণ UI ফাংশনালিটি
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
    // বিভাগ ২: ডাইনামিক নোটিফিকেশন সিস্টেম (মডাল ও ব্যাজ)
    // ---------------------------------------------------

    let lastSeenTimestamp = null;

    function updateNotificationBadge() {
        if (typeof firebase === 'undefined' || !firebase.auth().currentUser) return;
        const db = firebase.firestore();
        const notificationBadge = document.getElementById('notification-badge');
        if (!notificationBadge) return;
        lastSeenTimestamp = localStorage.getItem('lastSeenNotificationTimestamp');
        let query = db.collection('notifications');
        if (lastSeenTimestamp) {
            query = query.where('createdAt', '>', new Date(parseInt(lastSeenTimestamp)));
        }
        query.get().then(snapshot => {
            const unseenCount = snapshot.size;
            notificationBadge.textContent = unseenCount;
            notificationBadge.style.display = unseenCount > 0 ? 'inline-block' : 'none';
        }).catch(err => console.error("Error fetching unseen notifications count:", err));
    }

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
                            <a href="${notification.link || '#'}" class="notification-item-link" target="_blank">
                                <div class="modal-notif-title">${notification.title}</div>
                                <div class="modal-notif-body">${notification.body}</div>
                                <small>${formatTimeAgo(notification.createdAt)}</small>
                            </a>`;
                        notificationList.appendChild(item);
                    });
                    if (clearAllBtn) clearAllBtn.disabled = false;
                }
                notificationModal.classList.add('is-visible');
                document.body.style.overflow = 'hidden';
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

    const clearAllBtn = document.getElementById('clear-all-notifications-btn');
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', () => {
            localStorage.removeItem('lastSeenNotificationTimestamp');
            const notificationList = document.getElementById('notification-list');
            if (notificationList) {
                notificationList.innerHTML = "<li>সব নোটিফিকেশন পুনরায় আন-রিড করা হয়েছে।</li>";
            }
            updateNotificationBadge();
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

    // ---------------------------------------------------
    // বিভাগ ৩: ফায়ারবেস অথেন্টিকেশন এবং UI আপডেট
    // ---------------------------------------------------

    function initializeFirebaseServices() {
        if (typeof firebase === 'undefined') {
            setTimeout(initializeFirebaseServices, 100);
            return;
        }

        const auth = firebase.auth();
        auth.onAuthStateChanged(user => {
            updateNavUI(user);
            if (user) {
                updateNotificationBadge(); 
            } else {
                const notificationBadge = document.getElementById('notification-badge');
                if (notificationBadge) notificationBadge.style.display = 'none';
            }
        });

        document.body.addEventListener('click', (e) => {
            if (e.target.id === 'logout-btn-desktop' || e.target.id === 'logout-btn-mobile') {
                e.preventDefault();
                auth.signOut().catch(error => console.error('লগ আউট করতে সমস্যা হয়েছে:', error));
            }
        });
    }

    function updateNavUI(user) {
        // ... এই ফাংশনটি অপরিবর্তিত আছে ...
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
        if (elements.userMobile) elements.userMobile.style.display = 'none';
        if (elements.logoutMobile) elements.logoutMobile.style.display = isLoggedIn ? 'block' : 'none';
        if (isLoggedIn) {
            if (elements.userNameDisplay) {
                elements.userNameDisplay.textContent = user.displayName ? `${user.displayName.split(' ')[0]}` : 'User';
            }
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
    
    // ---------------------------------------------------
    // বিভাগ ৪: রিয়েল-টাইম নোটিফিকেশন ফিড (নতুন যুক্ত করা হয়েছে)
    // ---------------------------------------------------

    function initializeRealtimeNotificationFeed() {
        if (typeof firebase === 'undefined') {
            setTimeout(initializeRealtimeNotificationFeed, 100);
            return;
        }

        firebase.auth().onAuthStateChanged(user => {
            const feedContainer = document.getElementById('realtime-notification-feed');
            if (!feedContainer) return;

            if (user) {
                const db = firebase.firestore();
                db.collection('notifications').orderBy('createdAt', 'desc').limit(10)
                  .onSnapshot(snapshot => {
                      feedContainer.innerHTML = '';
                      if (snapshot.empty) {
                          feedContainer.innerHTML = '<p>এখনও কোনো বিজ্ঞপ্তি পাঠানো হয়নি।</p>';
                          return;
                      }
                      snapshot.forEach(doc => {
                          const notification = doc.data();
                          const item = document.createElement('a');
                          item.href = notification.link || '#';
                          item.target = "_blank";
                          item.classList.add('notification-feed-item');
                          item.innerHTML = `
                              <div class="notification-feed-title">${notification.title}</div>
                              <div class="notification-feed-body">${notification.body}</div>
                              <div class="notification-feed-time">${formatTimeAgo(notification.createdAt)}</div>
                          `;
                          feedContainer.appendChild(item);
                      });
                  }, error => {
                      console.error("Error fetching realtime notifications:", error);
                      feedContainer.innerHTML = '<p>বিজ্ঞপ্তি লোড করতে সমস্যা হয়েছে।</p>';
                  });
            } else {
                feedContainer.innerHTML = '<p>সাম্প্রতিক বিজ্ঞপ্তি দেখতে অনুগ্রহ করে <a href="login.html">লগইন</a> করুন।</p>';
            }
        });
    }

    // সবশেষে সব সার্ভিস চালু করা
    initializeFirebaseServices();
    initializeRealtimeNotificationFeed();
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