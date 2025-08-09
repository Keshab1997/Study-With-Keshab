// js/notification.js - সম্পূর্ণ এবং আপডেটেড সংস্করণ

document.addEventListener('DOMContentLoaded', () => {
    // DOM এলিমেন্টগুলি সিলেক্ট করা
    const notificationBellBtn = document.getElementById('show-notification-btn');
    const notificationModal = document.getElementById('notification-modal');
    const closeModalBtn = document.getElementById('close-notification-modal');
    const closeModalFooterBtn = document.getElementById('close-notification-btn-footer');
    const notificationList = document.getElementById('notification-list');
    const notificationBadge = document.getElementById('notification-badge');
    const clearAllBtn = document.getElementById('clear-all-notifications-btn');
    const recentFeedContainer = document.getElementById('realtime-notification-feed');

    // localStorage থেকে ডেটা লোড করা
    let readNotifications = JSON.parse(localStorage.getItem('readNotifications')) || [];
    let clearedNotifications = JSON.parse(localStorage.getItem('clearedNotifications')) || [];

    // নোটিফিকেশন রেন্ডার করার মূল ফাংশন
    const renderNotifications = () => {
        if (!notificationList || !recentFeedContainer) return;

        notificationList.innerHTML = '';
        recentFeedContainer.innerHTML = '';
        
        let unreadCount = 0;

        // মোছা নোটিফিকেশন বাদ দিয়ে বাকিগুলো ফিল্টার করা
        const visibleNotifications = allNotifications
            .filter(notification => !clearedNotifications.includes(notification.id))
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // নতুনগুলো আগে

        // ১. মডাল এবং হোমপেজ ফিড তৈরি করা
        visibleNotifications.forEach((notification, index) => {
            const isRead = readNotifications.includes(notification.id);
            if (!isRead) {
                unreadCount++;
            }
            const timeAgo = formatTimeAgo(notification.timestamp);

            // নোটিফিকেশন মডালের জন্য লিস্ট আইটেম
            const listItem = document.createElement('li');
            listItem.dataset.id = notification.id;
            listItem.className = isRead ? 'read' : '';
            listItem.innerHTML = `
                <a href="${notification.link}" class="notification-link">
                    <div class="notification-content">
                        <strong>${notification.title}</strong>
                        <p>${notification.message}</p>
                        <small>${timeAgo}</small>
                    </div>
                </a>
                <div class="notification-actions">
                    ${!isRead ? '<button class="mark-as-read-btn" title="পড়া হয়েছে"><i class="fa-solid fa-check"></i></button>' : ''}
                    <button class="delete-notification-btn" title="মুছে ফেলুন"><i class="fa-solid fa-times"></i></button>
                </div>
            `;
            notificationList.appendChild(listItem);

            // হোম পেজের সাম্প্রতিক ফিডের জন্য আইটেম (প্রথম ৩টি)
            if (index < 3) {
                 const feedItem = document.createElement('div');
                 feedItem.className = isRead ? 'notification-feed-item read' : 'notification-feed-item unread';
                 feedItem.dataset.id = notification.id;
                 feedItem.innerHTML = `
                    <a href="${notification.link}" class="feed-link">
                        <div class="feed-icon"><i class="fa-solid fa-bell"></i></div>
                        <div class="feed-content">
                            <h4>${notification.title}</h4>
                            <p>${notification.message}</p>
                            <span>${timeAgo}</span>
                        </div>
                    </a>
                 `;
                 recentFeedContainer.appendChild(feedItem);
            }
        });

        // ২. UI আপডেট করা
        // যদি কোনো নোটিফিকেশন না থাকে
        if (visibleNotifications.length === 0) {
            notificationList.innerHTML = '<li class="no-notification-message">কোনো নতুন বিজ্ঞপ্তি নেই।</li>';
            recentFeedContainer.innerHTML = '<p>এখনো কোনো নতুন বিজ্ঞপ্তি নেই।</p>';
            if(clearAllBtn) clearAllBtn.style.display = 'none';
        } else {
            if(clearAllBtn) clearAllBtn.style.display = 'inline-block';
        }
        
        // ব্যাজ আপডেট
        if (notificationBadge) {
            if (unreadCount > 0) {
                notificationBadge.textContent = unreadCount;
                notificationBadge.style.display = 'flex';
            } else {
                notificationBadge.style.display = 'none';
            }
        }
    };

    // হেল্পার ফাংশন: সময় ফরম্যাট করা
    const formatTimeAgo = (timestamp) => {
        const now = new Date();
        const past = new Date(timestamp);
        const diffInSeconds = Math.floor((now - past) / 1000);
        const intervals = { বছর: 31536000, মাস: 2592000, দিন: 86400, ঘন্টা: 3600, মিনিট: 60 };
        for (let key in intervals) {
            const count = Math.floor(diffInSeconds / intervals[key]);
            if (count > 0) return `${count} ${key} আগে`;
        }
        return 'এইমাত্র';
    };

    // হেল্পার ফাংশন: 'পড়া' হিসেবে চিহ্নিত করা
    const markAsRead = (notificationId) => {
        if (!readNotifications.includes(notificationId)) {
            readNotifications.push(notificationId);
            localStorage.setItem('readNotifications', JSON.stringify(readNotifications));
            renderNotifications();
        }
    };

    // হেল্পার ফাংশন: একটি নোটিফিকেশন ডিলিট করা
    const deleteNotification = (notificationId) => {
        if (!clearedNotifications.includes(notificationId)) {
            clearedNotifications.push(notificationId);
            localStorage.setItem('clearedNotifications', JSON.stringify(clearedNotifications));
            renderNotifications();
        }
    };

    // --- ইভেন্ট লিসেনার সেট আপ ---
    if(notificationBellBtn) notificationBellBtn.addEventListener('click', () => { notificationModal.style.display = 'block'; });
    if(closeModalBtn) closeModalBtn.addEventListener('click', () => { notificationModal.style.display = 'none'; });
    if(closeModalFooterBtn) closeModalFooterBtn.addEventListener('click', () => { notificationModal.style.display = 'none'; });
    window.addEventListener('click', (event) => { if (event.target === notificationModal) notificationModal.style.display = 'none'; });

    // সব নোটিফিকেশন ক্লিয়ার করার বাটন
    if(clearAllBtn) {
        clearAllBtn.addEventListener('click', () => {
            const allVisibleIds = allNotifications
                .filter(n => !clearedNotifications.includes(n.id))
                .map(n => n.id);
            clearedNotifications.push(...allVisibleIds);
            localStorage.setItem('clearedNotifications', JSON.stringify(clearedNotifications));
            renderNotifications();
        });
    }

    // নোটিফিকেশন লিস্টের ভেতর ক্লিক হ্যান্ডেল করা (পড়া ও মুছে ফেলার জন্য)
    if(notificationList) {
        notificationList.addEventListener('click', (event) => {
            const listItem = event.target.closest('li');
            if (!listItem || !listItem.dataset.id) return;

            const notificationId = listItem.dataset.id;
            
            if (event.target.closest('.mark-as-read-btn')) {
                event.preventDefault();
                markAsRead(notificationId);
            } else if (event.target.closest('.delete-notification-btn')) {
                event.preventDefault();
                deleteNotification(notificationId);
            } else if (event.target.closest('.notification-link')) {
                markAsRead(notificationId);
            }
        });
    }

    // হোমপেজের ফিডে ক্লিক করলে 'পড়া' হিসেবে চিহ্নিত করা
    if (recentFeedContainer) {
        recentFeedContainer.addEventListener('click', (event) => {
            const feedLink = event.target.closest('.feed-link');
            if (feedLink) {
                const feedItem = feedLink.closest('.notification-feed-item');
                if (feedItem && feedItem.dataset.id) {
                    markAsRead(feedItem.dataset.id);
                }
            }
        });
    }

    // প্রথমবার পেজ লোড হওয়ার সময় নোটিফিকেশন রেন্ডার করা
    renderNotifications();
});
