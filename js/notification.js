// js/notification.js (সম্পূর্ণ নতুন এবং উন্নত কোড - সাউন্ডসহ)

document.addEventListener('DOMContentLoaded', () => {
  // প্রয়োজনীয় সব DOM এলিমেন্টগুলো একসাথে নিয়ে নেওয়া হলো
  const notificationBellBtn = document.getElementById('show-notification-btn');
  const notificationBadge = document.getElementById('notification-badge');
  const modal = document.getElementById('notification-modal');
  const modalList = document.getElementById('notification-list');
  const closeModalBtn = document.getElementById('close-notification-modal');
  const closeModalFooterBtn = document.getElementById('close-notification-btn-footer');
  const clearReadBtn = document.getElementById('clear-read-notifications-btn');
  const homePageFeedContainer = document.getElementById('realtime-notification-feed');

  // ===============================================
  // ধাপ ১: অডিও ফাইল প্রস্তুত করা
  // ===============================================
  // আপনার audio ফোল্ডার থেকে সাউন্ড ফাইলটি লোড করা হলো
  const notificationSound = new Audio('audio/notification.wav');
  
  /**
   * সাউন্ড প্লে করার জন্য একটি নিরাপদ ফাংশন।
   * ব্রাউজারের অটোপ্লে পলিসির কারণে সরাসরি প্লে করলে অনেক সময় ব্লক হতে পারে,
   * তাই .catch() দিয়ে এরর হ্যান্ডেল করা হলো।
   */
  const playNotificationSound = () => {
    notificationSound.play().catch(error => {
      // এই এররটি দেখানো মানে ব্রাউজার সাউন্ড ব্লক করেছে। ব্যবহারকারী সাইটে ক্লিক করার পর এটি ঠিক হয়ে যাবে।
      console.warn("Notification sound was blocked by the browser. It will play after the first user interaction.");
    });
  };
  // নতুন কোড শেষ

  // LocalStorage থেকে ডেটা লোড করার ফাংশন
  const getStorageData = (key) => JSON.parse(localStorage.getItem(key) || '[]');
  // স্টোরেজে ডেটা সেভ করার ফাংশন
  const saveToStorage = (key, data) => localStorage.setItem(key, JSON.stringify(data));

  let readIds = getStorageData('readNotificationIds');
  let deletedIds = getStorageData('deletedNotificationIds');

  // সকল নোটিফিকেশন (ডিলিট করা বাদে) ফিল্টার করা
  const getActiveNotifications = () => notificationData.filter(n => !deletedIds.includes(n.id));

  /**
   * ব্যাজ আপডেট করার ফাংশন (না পড়া নোটিফিকেশনের সংখ্যা দেখাবে)
   */
  const updateBadge = () => {
    const unreadCount = getActiveNotifications().filter(n => !readIds.includes(n.id)).length;
    if (notificationBadge) {
      notificationBadge.textContent = unreadCount;
      notificationBadge.style.display = unreadCount > 0 ? 'flex' : 'none';
    }

    // ========================================================
    // ধাপ ২: কখন সাউন্ড বাজবে তা নির্ধারণ করা
    // ========================================================
    // যদি নতুন নোটিফিকেশন থাকে এবং এই সেশনে আগে সাউন্ড না বেজে থাকে, তাহলে সাউন্ড প্লে হবে।
    // sessionStorage ব্যবহার করা হয়েছে যাতে প্রতিবার পেজ রিলোড করলেই সাউন্ড না বাজে।
    if (unreadCount > 0 && !sessionStorage.getItem('soundPlayedThisSession')) {
      playNotificationSound();
      // সাউন্ড বেজে যাওয়ার পর sessionStorage-এ একটি চিহ্ন রাখা হলো।
      sessionStorage.setItem('soundPlayedThisSession', 'true');
    }
    // নতুন কোড শেষ
  };

  /**
   * মডালের ভেতরে নোটিফিকেশন লিস্ট তৈরি করার ফাংশন
   */
  const renderModalList = () => {
    if (!modalList) return;

    const notificationsToRender = getActiveNotifications();
    
    if (notificationsToRender.length === 0) {
      modalList.innerHTML = `<li class="no-notification-message">কোনো বিজ্ঞপ্তি নেই।</li>`;
      return;
    }

    modalList.innerHTML = notificationsToRender.map(n => {
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
  
  /**
   * হোমপেজের ফিড রেন্ডার করার ফাংশন
   */
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
  };

  // UI রিফ্রেশ করার কেন্দ্রীয় ফাংশন
  const refreshUI = () => {
    renderModalList();
    renderHomePageFeed();
    updateBadge();
  };

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
      readIds = readIds.filter(readId => readId !== id); // read list থেকেও বাদ দেওয়া হলো
      saveToStorage('deletedNotificationIds', deletedIds);
      saveToStorage('readNotificationIds', readIds);
      refreshUI();
    }
  };
  
  // শুধু পঠিত নোটিফিকেশনগুলো ক্লিয়ার করা
  const clearReadNotifications = () => {
      const activeNotifications = getActiveNotifications();
      const readToDelete = activeNotifications.filter(n => readIds.includes(n.id));
      
      if (readToDelete.length === 0) {
          alert('মোছার জন্য কোনো পঠিত বিজ্ঞপ্তি নেই।');
          return;
      }

      const idsToDelete = readToDelete.map(n => n.id);
      deletedIds.push(...idsToDelete);
      readIds = readIds.filter(id => !idsToDelete.includes(id));
      
      saveToStorage('deletedNotificationIds', deletedIds);
      saveToStorage('readNotificationIds', readIds);
      refreshUI();
  };

  // ==================== Event Listeners ====================

  if (notificationBellBtn) {
    notificationBellBtn.addEventListener('click', () => {
      modal.style.display = 'flex';
    });
  }

  const closeTheModal = () => modal.style.display = 'none';
  if (closeModalBtn) closeModalBtn.addEventListener('click', closeTheModal);
  if (closeModalFooterBtn) closeModalFooterBtn.addEventListener('click', closeTheModal);

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeTheModal();
    });
  }
  
  if(clearReadBtn) {
      clearReadBtn.addEventListener('click', clearReadNotifications);
  }

  if (modalList) {
    modalList.addEventListener('click', (e) => {
      const item = e.target.closest('.notification-list-item');
      if (!item) return;
      const id = parseInt(item.dataset.id, 10);
      
      if (e.target.closest('.mark-as-read-btn')) {
        markAsRead(id);
      }
      
      if (e.target.closest('.delete-notification-btn')) {
        if (confirm('আপনি কি এই বিজ্ঞপ্তিটি মুছে ফেলতে চান?')) {
          deleteNotification(id);
        }
      }
    });
  }

  // পেজ লোড হওয়ার সাথে সাথে সবকিছু চালু করা
  refreshUI();
});
