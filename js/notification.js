// js/notification.js (Firebase Integration)
import { db } from './firebase-config.js';
import { collection, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const notificationBellBtn = document.getElementById('show-notification-btn');
  const notificationBadge = document.getElementById('notification-badge');
  const modal = document.getElementById('notification-modal');
  const modalList = document.getElementById('notification-list');
  const closeModalBtn = document.getElementById('close-notification-modal');
  const homePageFeedContainer = document.getElementById('realtime-notification-feed');

  // Audio Setup
  const notificationSound = new Audio('audio/notification.wav');
  const playSound = () => {
    notificationSound.play().catch(err => console.log("Audio blocked:", err));
  };

  // Local Storage Helpers
  const getStorageData = (key) => JSON.parse(localStorage.getItem(key) || '[]');
  
  // ভেরিয়েবল যেখানে ডেটাবেসের ডেটা জমা হবে
  let dbNotifications = []; 
  
  // ======================================================
  // 🔥 FIREBASE REALTIME LISTENER (মেইন কাজ এখানে)
  // ======================================================
  const q = query(collection(db, "notifications"), orderBy("timestamp", "desc"));

  // onSnapshot ফাংশনটি ডেটাবেসে কোনো চেঞ্জ হলেই অটো রান হয়
  onSnapshot(q, (snapshot) => {
    dbNotifications = []; // আগের লিস্ট ক্লিয়ার
    
    snapshot.forEach((doc) => {
      // ডেটাবেস থেকে ডেটা নিয়ে আমাদের অ্যারেতে রাখা হচ্ছে
      dbNotifications.push({ id: doc.id, ...doc.data() });
    });

    // ডেটা আসার পর UI আপডেট করা
    refreshUI(true); // true পাঠানো হলো যাতে বোঝা যায় এটা নতুন ডেটা
  });

  // ======================================================
  // UI Rendering Functions
  // ======================================================
  
  const refreshUI = (isNewUpdate = false) => {
    const readIds = getStorageData('readNotificationIds');
    const deletedIds = getStorageData('deletedNotificationIds');

    // ডিলিট করা নোটিফিকেশন বাদ দিয়ে বাকিগুলো ফিল্টার করা
    const activeNotifications = dbNotifications.filter(n => !deletedIds.includes(n.id));
    
    // Unread Count বের করা
    const unreadCount = activeNotifications.filter(n => !readIds.includes(n.id)).length;

    // ১. ব্যাজ আপডেট
    if (notificationBadge) {
      notificationBadge.textContent = unreadCount;
      notificationBadge.style.display = unreadCount > 0 ? 'flex' : 'none';
    }

    // ২. সাউন্ড বাজানো (যদি নতুন আপডেট আসে এবং আনরিড থাকে)
    if (isNewUpdate && unreadCount > 0) {
       // এখানে চেক করা হচ্ছে এটা পেজ লোড নাকি নতুন নোটিফিকেশন
       // পেজ লোডে সাউন্ড না বাজাতে চাইলে লজিক এড করা যাবে
       playSound();
    }

    // ৩. মডাল লিস্ট রেন্ডার
    renderModalList(activeNotifications, readIds);

    // ৪. হোম পেজ ফিড রেন্ডার
    renderHomePageFeed(activeNotifications);
  };

  const renderModalList = (notifications, readIds) => {
    if (!modalList) return;
    if (notifications.length === 0) {
      modalList.innerHTML = '<li>কোনো বিজ্ঞপ্তি নেই</li>';
      return;
    }

    modalList.innerHTML = notifications.map(n => {
      const isRead = readIds.includes(n.id);
      return `
        <li class="notification-list-item ${isRead ? 'read' : 'unread'}" data-id="${n.id}">
          <a href="${n.link}">
             <i class="${n.icon}"></i>
             <div>
               <h4>${n.title}</h4>
               <p>${n.message}</p>
               <small>${n.date}</small>
             </div>
          </a>
          <button class="delete-btn">🗑️</button>
        </li>
      `;
    }).join('');
  };

  const renderHomePageFeed = (notifications) => {
     if(!homePageFeedContainer) return;
     // প্রথম ৪টা দেখানো
     const latest = notifications.slice(0, 4);
     homePageFeedContainer.innerHTML = latest.map(n => `
        <div class="feed-item">
            <h4>${n.title}</h4>
            <p>${n.message}</p>
        </div>
     `).join('');
  };

  // ইভেন্ট লিসেনার (Read/Delete) আগের মতোই থাকবে...
  // শুধু মনে রাখতে হবে id এখন স্ট্রিং (Firebase ID), ইন্টিজার নয়।
  
  if (modalList) {
      modalList.addEventListener('click', (e) => {
          // ডিলিট বা রিড লজিক এখানে (আগের কোডের মতোই, শুধু id পার্স করার দরকার নেই)
          const item = e.target.closest('li');
          if(!item) return;
          const id = item.dataset.id; // Firebase ID String হয়

          if(e.target.classList.contains('delete-btn')) {
              const deleted = getStorageData('deletedNotificationIds');
              deleted.push(id);
              localStorage.setItem('deletedNotificationIds', JSON.stringify(deleted));
              refreshUI();
          } else {
              // ক্লিক করলে রিড হিসেবে মার্ক হবে
              const read = getStorageData('readNotificationIds');
              if(!read.includes(id)) {
                  read.push(id);
                  localStorage.setItem('readNotificationIds', JSON.stringify(read));
                  refreshUI();
              }
          }
      });
  }

  // মডাল ওপেন/ক্লোজ
  if(notificationBellBtn) notificationBellBtn.addEventListener('click', () => modal.style.display = 'flex');
  if(closeModalBtn) closeModalBtn.addEventListener('click', () => modal.style.display = 'none');
});