// =======================================================
// সমন্বিত ওয়েবসাইট স্ক্রিপ্ট (সংস্করণ ৫.০ - লোকাল স্টোরেজ নোটিফিকেশন সিস্টেম)
// =======================================================

// === পেজ লোড হলে সকল ফাংশনালিটি চালু করা ===
document.addEventListener('DOMContentLoaded', function () {

    // ---------------------------------------------------
    // বিভাগ ১: সাধারণ UI ফাংশনালিটি
    // ---------------------------------------------------

    const header = document.querySelector('.site-header');
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    const navToggle = document.querySelector('.mobile-nav-toggle');
    const mobileNavMenu = document.getElementById('mobile-navigation-menu');

    // স্ক্রল করলে হেডার এবং স্ক্রল-টু-টপ বাটন নিয়ন্ত্রণ
    window.addEventListener('scroll', () => {
        if (header) {
            header.classList.toggle('scrolled', window.scrollY > 10);
        }
        if (scrollTopBtn) {
            scrollTopBtn.style.display = (window.scrollY > 100) ? "block" : "none";
        }
    });

    // স্ক্রল-টু-টপ বাটনের ক্লিক ইভেন্ট
    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // মোবাইল মেনু খোলার এবং বন্ধ করার ফাংশন
    function toggleMobileMenu(show) {
        if (!mobileNavMenu || !navToggle) return;
        
        const isVisible = show;
        const overlay = document.getElementById('menu-overlay');
        
        mobileNavMenu.setAttribute('data-visible', isVisible);
        navToggle.setAttribute('aria-expanded', isVisible);
        
        // Overlay toggle
        if (overlay) {
            overlay.classList.toggle('active', isVisible);
        }
        
        // স্ক্রলিং লক করা বা আনলক করা
        document.body.style.overflow = isVisible ? 'hidden' : '';
    }

    // মোবাইল মেনু টগল বাটনের ক্লিক ইভেন্ট
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            const isVisible = mobileNavMenu.getAttribute('data-visible') === 'true';
            toggleMobileMenu(!isVisible);
        });
    }

    // Overlay click করলে menu বন্ধ
    const menuOverlay = document.getElementById('menu-overlay');
    if (menuOverlay) {
        menuOverlay.addEventListener('click', () => {
            toggleMobileMenu(false);
        });
    }

    // Escape কী চেপে মেনু এবং মডাল বন্ধ করা
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            // মোবাইল মেনু বন্ধ করা
            if (mobileNavMenu && mobileNavMenu.getAttribute('data-visible') === 'true') {
                toggleMobileMenu(false);
            }
            
            // notification.js এর মডাল বন্ধ করা (যদি খোলা থাকে)
            const notificationModal = document.getElementById('notification-modal');
            if (notificationModal && notificationModal.style.display === 'flex') {
                notificationModal.style.display = 'none';
            }
        }
    });


    // ---------------------------------------------------
    // বিভাগ ২: ফুটারের কপিরাইট বছর স্বয়ংক্রিয়ভাবে আপডেট করা
    // ---------------------------------------------------
    
    const footerCopyright = document.querySelector('.footer-bottom');
    if (footerCopyright) {
        const currentYear = new Date().getFullYear();
        footerCopyright.innerHTML = `&copy; ${currentYear} | Study With Keshab | সর্বস্বত্ব সংরক্ষিত`;
    }


    // ---------------------------------------------------
    // বিভাগ ৩: Firebase এবং সাধারণ ফাংশনালিটি শুরু করা
    // ---------------------------------------------------

    // এই ফাংশনটি এখন আর ফায়ারবেস নোটিফিকেশন নিয়ন্ত্রণ করে না,
    // শুধুমাত্র পেজের সাধারণ স্ক্রিপ্ট পরিচালনা করে।
    function initializeGeneralScripts() {
        console.log("General UI scripts initialized.");
        // ভবিষ্যতে কোনো সাধারণ স্ক্রিপ্ট যোগ করার প্রয়োজন হলে এখানে যোগ করতে পারেন।
    }

    // সবশেষে সব সার্ভিস চালু করা
    initializeGeneralScripts();
    
});