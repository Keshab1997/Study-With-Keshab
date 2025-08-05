// js/notifications.js

document.addEventListener('DOMContentLoaded', () => {
    const allNotificationsList = document.getElementById('all-notifications-list');
    
    if (!allNotificationsList) return;

    // Firestore থেকে সব নোটিফিকেশন লোড করার ফাংশন
    function loadAllNotifications() {
        // নিশ্চিত করুন যে db ভেরিয়েবলটি লোড হয়েছে
        if (typeof db === 'undefined') {
            setTimeout(loadAllNotifications, 100); // ১০০ মিলিসেকেন্ড পর আবার চেষ্টা করুন
            return;
        }

        db.collection('notifications')
          .orderBy('createdAt', 'desc') // নতুনগুলো আগে দেখাবে
          .get()
          .then(snapshot => {
              allNotificationsList.innerHTML = ''; // তালিকা খালি করুন
              if (snapshot.empty) {
                  allNotificationsList.innerHTML = '<div class="notification-list-empty">এখনও কোনো বিজ্ঞপ্তি পাঠানো হয়নি।</div>';
                  return;
              }

              snapshot.forEach(doc => {
                  const notification = doc.data();
                  const timeAgo = formatTimeAgo(notification.createdAt);

                  const item = document.createElement('a');
                  item.href = notification.link || '#';
                  item.classList.add('notification-list-item');
                  item.innerHTML = `
                      <div class="notification-title">${notification.title}</div>
                      <div class="notification-body">${notification.body}</div>
                      <div class="notification-time">${timeAgo}</div>
                  `;
                  allNotificationsList.appendChild(item);
              });

          })
          .catch(error => {
              console.error("Error fetching all notifications:", error);
              allNotificationsList.innerHTML = '<div class="notification-list-empty">বিজ্ঞপ্তি লোড করতে সমস্যা হয়েছে।</div>';
          });
    }
    
    // সময়কে "x minutes ago" ফরম্যাটে দেখানোর জন্য একটি হেল্পার ফাংশন
    function formatTimeAgo(timestamp) {
        if (!timestamp || !timestamp.toDate) return '';
        const now = new Date();
        const seconds = Math.floor((now - timestamp.toDate()) / 1000);

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
        return "এইমাত্র";
    }

    // পেজ লোড হলে নোটিফিকেশন লোড শুরু হবে
    loadAllNotifications();
});