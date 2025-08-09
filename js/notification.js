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

    // localStorage থেকে পড়া এবং মোছা নোটিফিকেশন আইডি আনা
    let readNotifications = JSON.parse(localStorage.getItem('readNotifications')) || [];
    // নতুন কোড: মোছা নোটিফিকেশনের আইডি সংরক্ষণের জন্য
    let clearedNotifications = JSON.parse(localStorage.getItem('clearedNotifications')) || [];

    // নোটিফিকেশন রেন্ডার করার ফাংশন
    const renderNotifications = () => {
        // লিস্ট ও ফিড খালি করা
        notificationList.innerHTML = '';
        recentFeedContainer.innerHTML = '';
        
        let unreadCount = 0;
        let visibleNotificationCount = 0; // দৃশ্যমান নোটিফিকেশনের সংখ্যা গণনার জন্য

        // ডেটা সোর্স থেকে নোটিফিকেশনগুলো লুপ করা (allNotifications আসছে notification-data.js থেকে)
        allNotifications.forEach(notification => {
            // পরিবর্তিত কোড: যদি নোটিফিকেশনটি 'cleared' লিস্টে থাকে, তবে এটিকে রেন্ডার করা হবে না
            if (clearedNotifications.includes(notification.id)) {
                return; // এই নোটিফিকেশনটি এড়িয়ে যান
            }

            visibleNotificationCount++; // দৃশ্যমান নোটিফিকেশন গণনা
            const isRead = readNotifications.includes(notification.id);

            // অপঠিত নোটিফিকেশনের সংখ্যা গণনা
            if (!isRead) {
                unreadCount++;
            }

            // সময়কে ফরম্যাট করা (যেমন: ২ দিন আগে)
            const timeAgo = formatTimeAgo(notification.timestamp);

            // ১. নোটিফিকেশন মডালের জন্য লিস্ট আইটেম তৈরি
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
                ${!isRead ? '<button class="mark-as-read-btn" title="পড়া হয়েছে হিসেবে চিহ্নিত করুন"><i class="fa-solid fa-check"></i></button>' : ''}
            `;
            notificationList.appendChild(listItem);


            // ২. হোম পেজের সাম্প্রতিক ফিডের জন্য আইটেম তৈরি (শুধুমাত্র নতুন ৩টি)
            if (visibleNotificationCount <= 3) { // শুধুমাত্র প্রথম ৩টি দৃশ্যমান নোটিফিকেশন দেখানো হবে
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

        // যদি কোনো দৃশ্যমান বিজ্ঞপ্তি না থাকে, তাহলে মেসেজ দেখানো
        if(visibleNotificationCount === 0) {
            notificationList.innerHTML = '<li class="no-notification-message"><p>আপনার জন্য কোনো নতুন বিজ্ঞপ্তি নেই।</p></li>';
            recentFeedContainer.innerHTML = '<p>এখনো কোনো নতুন বিজ্ঞপ্তি নেই।</p>';
            clearAllBtn.style.display = 'none'; // মোছার বাটন লুকিয়ে দিন
        } else {
            clearAllBtn.style.display = 'inline-block'; // বাটন দেখান
        }

        // ব্যাজ আপডেট করা
        if (unreadCount > 0) {
            notificationBadge.textContent = unreadCount;
            notificationBadge.style.display = 'block';
        } else {
            notificationBadge.style.display = 'none';
        }
    };

    // সময় ফরম্যাট করার হেল্পার ফাংশন (কোনো পরিবর্তন নেই)
    const formatTimeAgo = (timestamp) => {
        const now = new Date();
        const past = new Date(timestamp);
        const diffInSeconds = Math.floor((now - past) / 1000);
        
        const intervals = {
            বছর: 31536000,
            মাস: 2592000,
            দিন: 86400,
            ঘন্টা: 3600,
            মিনিট: 60
        };

        for (let key in intervals) {
            const interval = intervals[key];
            const count = Math.floor(diffInSeconds / interval);
            if (count > 0) {
                return `${count} ${key} আগে`;
            }
        }
        return 'এইমাত্র';
    };

    // একটি নোটিফিকেশনকে 'পড়া' হিসেবে চিহ্নিত করা (কোনো পরিবর্তন নেই)
    const markAsRead = (notificationId) => {
        if (!readNotifications.includes(notificationId)) {
            readNotifications.push(notificationId);
            localStorage.setItem('readNotifications', JSON.stringify(readNotifications));
            renderNotifications(); // UI আপডেট করার জন্য আবার রেন্ডার
        }
    };

    // ইভেন্ট লিসেনার সেট আপ (কোনো পরিবর্তন নেই)
    notificationBellBtn.addEventListener('click', () => {
        notificationModal.style.display = 'block';
    });

    closeModalBtn.addEventListener('click', () => {
        notificationModal.style.display = 'none';
    });

    closeModalFooterBtn.addEventListener('click', () => {
        notificationModal.style.display = 'none';
    });
    
    window.addEventListener('click', (event) => {
        if (event.target === notificationModal) {
            notificationModal.style.display = 'none';
        }
    });

    // পরিবর্তিত কোড: সব নোটিফিকেশন তালিকা থেকে মোছার জন্য
    clearAllBtn.addEventListener('click', () => {
        // সকল নোটিফিকেশনের আইডি সংগ্রহ করুন
        const allNotificationIds = allNotifications.map(n => n.id);
        
        // সব আইডি 'clearedNotifications' অ্যারেতে যোগ করুন
        clearedNotifications = [...new Set([...clearedNotifications, ...allNotificationIds])];
        
        // localStorage-এ সেভ করুন
        localStorage.setItem('clearedNotifications', JSON.stringify(clearedNotifications));
        
        // UI আপডেট করতে আবার রেন্ডার করুন
        renderNotifications();
    });

    // নির্দিষ্ট নোটিফিকেশনে ক্লিক ইভেন্ট (কোনো পরিবর্তন নেই)
    notificationList.addEventListener('click', (event) => {
        const target = event.target;
        const listItem = target.closest('li');
        if (!listItem) return;

        const notificationId = listItem.dataset.id;
        
        if (target.closest('.mark-as-read-btn')) {
            event.preventDefault();
            markAsRead(notificationId);
        }
        else if (target.closest('.notification-link')) {
            markAsRead(notificationId);
        }
    });

    // প্রথমবার পেজ লোড হওয়ার সময় নোটিফিকেশন রেন্ডার করা
    renderNotifications();
});
