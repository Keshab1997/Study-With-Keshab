// js/notification.js

document.addEventListener('DOMContentLoaded', () => {
    // DOM елементগুলি সিলেক্ট করা
    const notificationBellBtn = document.getElementById('show-notification-btn');
    const notificationModal = document.getElementById('notification-modal');
    const closeModalBtn = document.getElementById('close-notification-modal');
    const closeModalFooterBtn = document.getElementById('close-notification-btn-footer');
    const notificationList = document.getElementById('notification-list');
    const notificationBadge = document.getElementById('notification-badge');
    const clearAllBtn = document.getElementById('clear-all-notifications-btn');
    const recentFeedContainer = document.getElementById('realtime-notification-feed');

    let readNotifications = JSON.parse(localStorage.getItem('readNotifications')) || [];
    let clearedNotifications = JSON.parse(localStorage.getItem('clearedNotifications')) || [];

    // নোটিফিকেশন রেন্ডার করার ফাংশন
    const renderNotifications = () => {
        notificationList.innerHTML = '';
        recentFeedContainer.innerHTML = '';
        
        let unreadCount = 0;
        let visibleNotificationCount = 0;

        // ডেটা সোর্স থেকে নোটিফিকেশনগুলো ফিল্টার করে নেওয়া (মোছা নোটিফিকেশন বাদ দিয়ে)
        const visibleNotifications = allNotifications.filter(
            notification => !clearedNotifications.includes(notification.id)
        );

        visibleNotifications.forEach(notification => {
            visibleNotificationCount++;
            const isRead = readNotifications.includes(notification.id);

            if (!isRead) {
                unreadCount++;
            }

            const timeAgo = formatTimeAgo(notification.timestamp);

            // ১. নোটিফিকেশন মডালের জন্য লিস্ট আইটেম তৈরি
            const listItem = document.createElement('li');
            listItem.dataset.id = notification.id;
            listItem.className = isRead ? 'read' : '';
            // নতুন কোড: প্রতিটি আইটেমের জন্য একটি ডিলিট বাটন যোগ করা হয়েছে
            listItem.innerHTML = `
                <a href="${notification.link}" class="notification-link">
                    <div class="notification-content">
                        <strong>${notification.title}</strong>
                        <p>${notification.message}</p>
                        <small>${timeAgo}</small>
                    </div>
                </a>
                <div class="notification-actions">
                    ${!isRead ? '<button class="mark-as-read-btn" title="পড়া হয়েছে হিসেবে চিহ্নিত করুন"><i class="fa-solid fa-check"></i></button>' : ''}
                    <button class="delete-notification-btn" title="মুছে ফেলুন"><i class="fa-solid fa-times"></i></button>
                </div>
            `;
            notificationList.appendChild(listItem);

            // ২. হোম পেজের সাম্প্রতিক ফিডের জন্য আইটেম তৈরি (শুধুমাত্র নতুন ৩টি)
            if (visibleNotificationCount <= 3) {
                 const feedItem = document.createElement('div');
                 feedItem.className = 'notification-feed-item';
                 feedItem.innerHTML = `
                    <a href="${notification.link}">
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

        if(visibleNotificationCount === 0) {
            notificationList.innerHTML = '<li class="no-notification-message"><p>আপনার জন্য কোনো নতুন বিজ্ঞপ্তি নেই।</p></li>';
            recentFeedContainer.innerHTML = '<p>এখনো কোনো নতুন বিজ্ঞপ্তি নেই।</p>';
            clearAllBtn.style.display = 'none';
        } else {
            clearAllBtn.style.display = 'inline-block';
        }

        if (unreadCount > 0) {
            notificationBadge.textContent = unreadCount;
            notificationBadge.style.display = 'block';
        } else {
            notificationBadge.style.display = 'none';
        }
    };

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

    const markAsRead = (notificationId) => {
        if (!readNotifications.includes(notificationId)) {
            readNotifications.push(notificationId);
            localStorage.setItem('readNotifications', JSON.stringify(readNotifications));
            renderNotifications();
        }
    };

    // নতুন কোড: একটি নির্দিষ্ট নোটিফিকেশন ডিলিট করার ফাংশন
    const deleteNotification = (notificationId) => {
        if (!clearedNotifications.includes(notificationId)) {
            clearedNotifications.push(notificationId);
            localStorage.setItem('clearedNotifications', JSON.stringify(clearedNotifications));
            renderNotifications();
        }
    };

    notificationBellBtn.addEventListener('click', () => { notificationModal.style.display = 'block'; });
    closeModalBtn.addEventListener('click', () => { notificationModal.style.display = 'none'; });
    closeModalFooterBtn.addEventListener('click', () => { notificationModal.style.display = 'none'; });
    window.addEventListener('click', (event) => { if (event.target === notificationModal) notificationModal.style.display = 'none'; });

    clearAllBtn.addEventListener('click', () => {
        const allVisibleIds = allNotifications
            .filter(n => !clearedNotifications.includes(n.id))
            .map(n => n.id);
        clearedNotifications.push(...allVisibleIds);
        localStorage.setItem('clearedNotifications', JSON.stringify(clearedNotifications));
        renderNotifications();
    });

    // পরিবর্তিত কোড: ডিলিট বাটনের জন্য নতুন লজিক যোগ করা হয়েছে
    notificationList.addEventListener('click', (event) => {
        const target = event.target;
        const listItem = target.closest('li');
        if (!listItem) return;

        const notificationId = listItem.dataset.id;
        
        // 'Mark as read' বাটনে ক্লিক করলে
        if (target.closest('.mark-as-read-btn')) {
            event.preventDefault();
            markAsRead(notificationId);
        }
        // 'Delete' বাটনে ক্লিক করলে
        else if (target.closest('.delete-notification-btn')) {
            event.preventDefault();
            deleteNotification(notificationId);
        }
        // লিঙ্কে ক্লিক করলে
        else if (target.closest('.notification-link')) {
            markAsRead(notificationId);
        }
    });

    renderNotifications();
});
