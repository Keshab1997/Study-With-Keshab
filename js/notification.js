// js/notification.js

document.addEventListener('DOMContentLoaded', () => {
  // প্রয়োজনীয় DOM এলিমেন্টগুলো নিয়ে নেওয়া হলো
  const notificationBellBtn = document.getElementById('show-notification-btn');
  const notificationBadge = document.getElementById('notification-badge');
  const modal = document.getElementById('notification-modal');
  const modalList = document.getElementById('notification-list');
  const closeModalBtn = document.getElementById('close-notification-modal');
  const closeModalFooterBtn = document.getElementById('close-notification-btn-footer');
  const clearAllBtn = document.getElementById('clear-all-notifications-btn');
  const homePageFeedContainer = document.getElementById('realtime-notification-feed');

  // LocalStorage থেকে ডেটা লোড করার ফাংশন
  const getStorageData = (key) => JSON.parse(localStorage.getItem(key) || '[]');

  let readIds = getStorageData('readNotificationIds');
  let deletedIds = getStorageData('deletedNotificationIds');

  // স্টোরেজে ডেটা সেভ করার ফাংশন
  const saveToStorage = (key, data) => localStorage.setItem(key, JSON.stringify(data));

  // সকল নোটিফিকেশন (ডিলিট করা বাদে) ফিল্টার করা
  const getActiveNotifications = () => notificationData.filter(n => !deletedIds.includes(n.id));

  /**
   * ব্যাজ আপডেট করার ফাংশন
   */
  const updateBadge = () => {
    const unreadCount = getActiveNotifications().filter(n => !readIds.includes(n.id)).length;
    if (notificationBadge) {
      notificationBadge.textContent = unreadCount;
      notificationBadge.style.display = unreadCount > 0 ? 'flex' : 'none';
    }
  };

  /**
   * নোটিফিকেশন রেন্ডার করার মূল ফাংশন
   * @param {HTMLElement} targetElement - কোথায় রেন্ডার হবে (মডাল বা হোমপেজ ফিড)
   * @param {number|null} count - কতগুলো আইটেম দেখানো হবে (null হলে সব)
   */
  const renderNotifications = (targetElement, count = null) => {
    if (!targetElement) return;

    let notificationsToRender = getActiveNotifications();
    if (count) {
      notificationsToRender = notificationsToRender.slice(0, count);
    }
    
    if (notificationsToRender.length === 0) {
      targetElement.innerHTML = `<li class="no-notification-message">কোনো নতুন বিজ্ঞপ্তি নেই।</li>`;
      return;
    }

    targetElement.innerHTML = notificationsToRender.map(n => {
      const isRead = readIds.includes(n.id);
      const readClass = isRead ? 'read' : 'unread';
      
      return `
        <li class="notification-list-item ${readClass}" data-id="${n.id}">
          <a href="${n.link || '#'}" class="notification-link">
            <div class="feed-icon"><i class="${n.icon || 'fa-solid fa-bell'}"></i></div>
            <div class="feed-content">
              <h4>${n.title}</h4>
              <p>${n.message}</p>
              <small>${n.date}</small>
            </div>
          </a>
          <div class="notification-actions">
            ${!isRead ? `<button class="mark-as-read-btn" title="পড়া হয়েছে হিসেবে চিহ্নিত করুন"><i class="fa-solid fa-check"></i></button>` : ''}
            <button class="delete-notification-btn" title="মুছে ফেলুন"><i class="fa-solid fa-trash"></i></button>
          </div>
        </li>
      `;
    }).join('');
  };
  
  // হোমপেজের ফিড রেন্ডার করার ফাংশন
  const renderHomePageFeed = () => {
      if (!homePageFeedContainer) return;
      const notifications = getActiveNotifications().slice(0, 4); // সাম্প্রতিক ৪টি দেখানো হবে

      if(notifications.length === 0){
        homePageFeedContainer.innerHTML = '<p>এখন কোনো বিজ্ঞপ্তি নেই।</p>';
        return;
      }
      
      homePageFeedContainer.innerHTML = notifications.map(n => {
        const isRead = readIds.includes(n.id);
        const readClass = isRead ? 'read' : 'unread';
        return `
            <div class="notification-feed-item ${readClass}" data-id="${n.id}">
                <a href="${n.link || '#'}">
                    <div class="feed-icon"><i class="${n.icon || 'fa-solid fa-bell'}"></i></div>
                    <div class="feed-content">
                        <h4>${n.title}</h4>
                        <p>${n.message}</p>
                        <span>${n.date}</span>
                    </div>
                </a>
            </div>
        `;
    }).join('');
  }

  // কোনো নোটিফিকেশন পড়া হিসেবে চিহ্নিত করা
  const markAsRead = (id) => {
    if (!readIds.includes(id)) {
      readIds.push(id);
      saveToStorage('readNotificationIds', readIds);
      refreshUI();
    }
  };

  // কোনো নোটিফিকেশন ডিলিট করা
  const deleteNotification = (id) => {
    if (!deletedIds.includes(id)) {
      deletedIds.push(id);
      saveToStorage('deletedNotificationIds', deletedIds);
      // যদি এটি পড়া না থাকে, তাহলে readIds থেকেও বাদ দেওয়া যেতে পারে (ঐচ্ছিক)
      readIds = readIds.filter(readId => readId !== id);
      saveToStorage('readNotificationIds', readIds);
      refreshUI();
    }
  };
  
  // সব নোটিফিকেশন ক্লিয়ার করা
  const clearAllNotifications = () => {
      const activeNotifications = getActiveNotifications();
      deletedIds = [...deletedIds, ...activeNotifications.map(n => n.id)];
      saveToStorage('deletedNotificationIds', deletedIds);
      readIds = [];
      saveToStorage('readNotificationIds', readIds);
      refreshUI();
  }

  // UI রিফ্রেশ করার ফাংশন
  const refreshUI = () => {
    renderNotifications(modalList);
    renderHomePageFeed();
    updateBadge();
  };

  // ইভেন্ট লিসেনার সেটআপ
  if (notificationBellBtn) {
    notificationBellBtn.addEventListener('click', () => {
      modal.style.display = 'flex';
      // মডাল খোলার সাথে সাথে সব unread নোটিফিকেশন পড়া হয়ে যাবে
      const unread = getActiveNotifications().filter(n => !readIds.includes(n.id));
      unread.forEach(n => readIds.push(n.id));
      saveToStorage('readNotificationIds', readIds);
      refreshUI();
    });
  }

  // মডাল বন্ধ করার বাটন
  const closeTheModal = () => modal.style.display = 'none';
  if (closeModalBtn) closeModalBtn.addEventListener('click', closeTheModal);
  if (closeModalFooterBtn) closeModalFooterBtn.addEventListener('click', closeTheModal);

  // মডালের বাইরে ক্লিক করলে বন্ধ হবে
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeTheModal();
      }
    });
  }
  
  if(clearAllBtn) {
      clearAllBtn.addEventListener('click', clearAllNotifications);
  }

  // নোটিফিকেশন লিস্টের মধ্যেকার বাটনের জন্য Event Delegation
  if (modalList) {
    modalList.addEventListener('click', (e) => {
      const markReadBtn = e.target.closest('.mark-as-read-btn');
      const deleteBtn = e.target.closest('.delete-notification-btn');
      
      if (markReadBtn) {
        const id = parseInt(markReadBtn.closest('.notification-list-item').dataset.id, 10);
        markAsRead(id);
      }
      
      if (deleteBtn) {
        const id = parseInt(deleteBtn.closest('.notification-list-item').dataset.id, 10);
        deleteNotification(id);
      }
    });
  }

  // পেজ লোড হওয়ার সাথে সাথে সবকিছু চালু করা
  refreshUI();
});