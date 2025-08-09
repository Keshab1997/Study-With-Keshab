// js/all-notifications.js

document.addEventListener('DOMContentLoaded', () => {
    const allNotificationsList = document.getElementById('all-notifications-list');

    // LocalStorage থেকে ডিলিট করা আইডিগুলো আনা হচ্ছে
    const getDeletedIds = () => JSON.parse(localStorage.getItem('deletedNotificationIds') || '[]');
    const deletedIds = getDeletedIds();

    // notificationData থেকে ডিলিট করা বাদে বাকিগুলো ফিল্টার করা হচ্ছে
    const activeNotifications = notificationData.filter(n => !deletedIds.includes(n.id));

    if (activeNotifications.length === 0) {
        allNotificationsList.innerHTML = '<div class="notification-list-empty">আপাতত কোনো বিজ্ঞপ্তি নেই।</div>';
        return;
    }

    // তালিকা তৈরি করে দেখানো হচ্ছে
    allNotificationsList.innerHTML = activeNotifications.map(n => `
        <div class="notification-list-item">
            <a href="${n.link || '#'}" class="notification-link" style="text-decoration:none; color:inherit;">
                <div class="feed-icon"><i class="${n.icon || 'fa-solid fa-bell'}"></i></div>
                <div class="feed-content">
                    <h4>${n.title}</h4>
                    <p>${n.message}</p>
                    <small>${n.date}</small>
                </div>
            </a>
        </div>
    `).join('');
});