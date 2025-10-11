// js/notification.js

// notifications array আসবে notification-data.js থেকে

// Always overwrite notifications (so every refresh shows latest)
localStorage.setItem('allNotifications', JSON.stringify(notifications));

// Get seen notification ids
function getSeenNotifications() {
    return JSON.parse(localStorage.getItem('seenNotifications') || '[]');
}

// Get all notifications
function getAllNotifications() {
    return JSON.parse(localStorage.getItem('allNotifications') || '[]');
}

// Show badge if there are unseen notifications
function updateNotificationBadge() {
    const all = getAllNotifications();
    const seen = getSeenNotifications();
    const unseenCount = all.filter(n => !seen.includes(n.id)).length;
    const badge = document.getElementById('notification-badge');
    if (badge) {
        badge.textContent = unseenCount;
        badge.style.display = unseenCount > 0 ? 'inline-block' : 'none';
    }
}

// Show notification modal
function showNotificationModal() {
    const modal = document.getElementById('notification-modal');
    const list = document.getElementById('notification-list');
    const all = getAllNotifications();
    if (list) {
        list.innerHTML = all.length
            ? all.map(n => `<li>${n.message} <small style="color:#888;">(${n.date})</small></li>`).join('')
            : "<li>কোনো নোটিফিকেশন নেই।</li>";
    }
    if (modal) modal.style.display = 'flex';

    // Mark all as seen
    localStorage.setItem('seenNotifications', JSON.stringify(all.map(n => n.id)));
    updateNotificationBadge();
}

// Close modal function
function closeNotificationModal() {
    const modal = document.getElementById('notification-modal');
    if (modal) modal.style.display = 'none';
}

// Overlay click to close
function overlayClickClose(e) {
    if (e.target === e.currentTarget) {
        closeNotificationModal();
    }
}

// DOMContentLoaded ensures all elements exist before JS runs
document.addEventListener('DOMContentLoaded', function() {
    updateNotificationBadge();

    // Bell click
    const bellBtn = document.getElementById('show-notification-btn');
    if (bellBtn) {
        bellBtn.addEventListener('click', showNotificationModal);
    }

    // Close button
    const closeBtn = document.getElementById('close-notification-modal');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeNotificationModal);
    }

    // Overlay click
    const modal = document.getElementById('notification-modal');
    if (modal) {
        modal.addEventListener('click', overlayClickClose);
    }
});