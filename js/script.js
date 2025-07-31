// =======================================================
// সমন্বিত ওয়েবসাইট স্ক্রিপ্ট (সংস্করণ ২.১ - সংশোধিত)
// মোবাইল মেনু এবং নোটিফিকেশন সিস্টেম একত্রিত এবং উন্নত করা হয়েছে
// =======================================================

document.addEventListener('DOMContentLoaded', function () {
    
    // --- ১. গ্লোবাল ভ্যারিয়েবল এবং এলিমেন্ট সিলেকশন ---
    const header = document.querySelector('.site-header');
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    
    // মোবাইল নেভিগেশন এলিমেন্টস
    const navToggle = document.querySelector('.mobile-nav-toggle');
    const mobileNavMenu = document.getElementById('mobile-navigation-menu'); // HTML থেকে সরাসরি সিলেক্ট করা

    // নোটিফিকেশন এলিমেন্টস
    const notificationBtn = document.getElementById('show-notification-btn');
    const notificationModal = document.getElementById('notification-modal');
    const closeNotificationBtn = document.getElementById('close-notification-modal');
    const notificationList = document.getElementById('notification-list');
    const notificationBadge = document.getElementById('notification-badge');

    // --- ২. হেডার এবং স্ক্রল-টু-টপ ---
    window.addEventListener('scroll', () => {
        // হেডার শ্যাডো
        header.classList.toggle('scrolled', window.scrollY > 10);
        
        // স্ক্রল টু টপ বাটন
        if (scrollTopBtn) {
            scrollTopBtn.style.display = (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) ? "block" : "none";
        }
    });

    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // --- ৩. মোবাইল মেনু সিস্টেম (সরলীকৃত) ---
    function toggleMobileMenu(show) {
        if (!mobileNavMenu || !navToggle) return;
        
        const isVisible = show;
        mobileNavMenu.setAttribute('data-visible', isVisible);
        navToggle.setAttribute('aria-expanded', isVisible);
        
        // মেনু খোলা থাকলে পেজের স্ক্রলিং বন্ধ করা
        document.body.style.overflow = isVisible ? 'hidden' : '';
    }

    if (navToggle && mobileNavMenu) {
        navToggle.addEventListener('click', () => {
            const isVisible = mobileNavMenu.getAttribute('data-visible') === 'true';
            toggleMobileMenu(!isVisible);
        });

        // মোবাইল মেনুর ভেতরের লিঙ্কে ক্লিক করলে মেনু বন্ধ হবে
        mobileNavMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => toggleMobileMenu(false));
        });
    }
    
    // --- ৪. নোটিফিকেশন সিস্টেম (একত্রিত এবং উন্নত) ---

    // notification-data.js থেকে আসা 'notifications' ভ্যারিয়েবল ব্যবহার করা হবে।
    // এই অ্যারেটি না পেলে কোড যাতে ক্র্যাশ না করে তার জন্য typeof চেক করা হয়েছে।
    if (typeof notifications === 'undefined') {
        console.error("Error: notification-data.js is not loaded or 'notifications' array is missing.");
        return;
    }

    function playNotificationSound() {
        // নিশ্চিত করুন audio ফাইলটি সঠিক পথে আছে।
        // উদাহরণস্বরূপ, যদি আপনার audio ফোল্ডারটি রুট ডিরেক্টরিতে থাকে: /audio/notification.wav
        const audio = new Audio('audio/notification.wav'); 
        audio.play().catch(e => console.error("Sound play error:", e));
    }

    function getSeenNotifications() {
        return JSON.parse(localStorage.getItem('seenNotifications') || '[]');
    }

    function updateNotificationBadge() {
        if (!notificationBadge) return;
        
        const allNotificationIds = notifications.map(n => n.id);
        const seenNotificationIds = getSeenNotifications();
        const unseenCount = allNotificationIds.filter(id => !seenNotificationIds.includes(id)).length;
        
        const currentBadgeCount = parseInt(notificationBadge.textContent) || 0;
        
        // যদি নতুন অদেখা নোটিফিকেশন থাকে, তাহলেই সাউন্ড বাজবে
        if (unseenCount > 0 && unseenCount > currentBadgeCount) {
             playNotificationSound();
        }

        notificationBadge.textContent = unseenCount;
        notificationBadge.style.display = unseenCount > 0 ? 'inline-block' : 'none';

        // নতুন নোটিফিকেশনগুলো লোকাল স্টোরেজেও সেভ করা ভালো অভ্যাস
        localStorage.setItem('allNotifications', JSON.stringify(notifications));
    }

    function showNotificationModal() {
        if (!notificationModal || !notificationList) return;

        notificationList.innerHTML = notifications.length
            ? [...notifications].reverse().map(n => `<li>${n.message} <small style="color:#888;">(${n.date})</small></li>`).join('')
            : "<li>কোনো নতুন নোটিফিকেশন নেই।</li>";
        
        notificationModal.classList.add('is-visible');
        document.body.style.overflow = 'hidden'; // মডাল খোলা থাকলে স্ক্রলিং বন্ধ

        // সব নোটিফিকেশনকে 'seen' হিসেবে মার্ক করুন
        const allNotificationIds = notifications.map(n => n.id);
        localStorage.setItem('seenNotifications', JSON.stringify(allNotificationIds));
        
        // ব্যাজ আপডেট করুন (কাউন্ট ০ হয়ে যাবে)
        // একটি ছোট ডিলে দেওয়া হলো যাতে ব্যবহারকারী পরিবর্তনটা লক্ষ্য করতে পারে
        setTimeout(updateNotificationBadge, 300);
    }

    function closeNotificationModal() {
        if (notificationModal) {
            notificationModal.classList.remove('is-visible');
            document.body.style.overflow = ''; // মডাল বন্ধ হলে স্ক্রলিং চালু
        }
    }
    
    // নোটিফিকেশন ইভেন্ট লিসেনার
    if (notificationBtn) {
        notificationBtn.addEventListener('click', showNotificationModal);
    }
    if (closeNotificationBtn) {
        closeNotificationBtn.addEventListener('click', closeNotificationModal);
    }
    if (notificationModal) {
        notificationModal.addEventListener('click', (event) => {
            // মডালের বাইরের কালো অংশে ক্লিক করলে বন্ধ হবে
            if (event.target === notificationModal) {
                closeNotificationModal();
            }
        });
    }

    // --- ৫. গ্লোবাল কী-বোর্ড ইভেন্ট ---
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            // মোবাইল মেনু বন্ধ করুন
            if (mobileNavMenu && mobileNavMenu.getAttribute('data-visible') === 'true') {
                toggleMobileMenu(false);
            }
            // নোটিফিকেশন মডাল বন্ধ করুন
            if (notificationModal && notificationModal.classList.contains('is-visible')) {
                closeNotificationModal();
            }
        }
    });

    // --- ৬. ইনিশিয়ালাইজেশন ---
    updateNotificationBadge(); // পেজ লোড হলে ব্যাজ আপডেট করুন
});