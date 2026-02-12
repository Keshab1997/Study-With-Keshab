// ১. Supabase কনফিগারেশন
const supabaseUrl = 'https://yofmaciyxrwvqyzyltml.supabase.co'; 
const supabaseKey = 'sb_publishable_g1eUh3i6hpDQX8w_1-hrvw_ChYrhkc3'; 

// [SOLVED] 'supabase' এর বদলে 'supabaseClient' ব্যবহার করা হয়েছে যাতে লাইব্রেরির সাথে সংঘর্ষ না হয়
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

// HTML এলিমেন্ট সিলেক্ট করা
const feedContainer = document.getElementById('realtime-notification-feed'); 
const notificationList = document.getElementById('notification-list');

// ২. নোটিফিকেশন লোড করার ফাংশন
async function fetchNotifications() {
    // এখানেও supabaseClient ব্যবহার করা হয়েছে
    const { data, error } = await supabaseClient
        .from('notifications')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error:', error);
        return;
    }

    renderNotifications(data);
}

// ৩. রেন্ডার ফাংশন (আপডেটেড ডেট ফরম্যাট: English)
function renderNotifications(notifications) {
    const readNotifications = JSON.parse(localStorage.getItem('read_notifications')) || [];
    let unreadCount = 0;

    // কন্টেইনার ক্লিয়ার করা
    if (feedContainer) feedContainer.innerHTML = '';
    if (notificationList) notificationList.innerHTML = '';

    // যদি কোনো নোটিফিকেশন না থাকে
    if (notifications.length === 0) {
        if (feedContainer) feedContainer.innerHTML = '<p class="text-center">No new notifications.</p>';
        if (notificationList) notificationList.innerHTML = '<li class="no-notification-message">No notifications</li>';
        const badge = document.getElementById('notification-badge');
        if (badge) badge.style.display = 'none';
        return;
    }

    // লুপ শুরু
    notifications.forEach(notif => {
        const isRead = readNotifications.includes(notif.id);
        if (!isRead) unreadCount++;

        // === পরিবর্তন: তারিখ ইংরেজিতে দেখানোর জন্য 'en-US' করা হয়েছে ===
        const dateStr = new Date(notif.created_at).toLocaleDateString('en-US', {
            day: 'numeric', month: 'long', year: 'numeric'
        });

        // --- ক) হোম পেজের ফিড ---
        if (feedContainer) {
            const feedItem = document.createElement('div');
            feedItem.className = `notification-feed-item ${isRead ? 'read' : 'unread'}`;
            feedItem.innerHTML = `
                <a href="#" onclick="markAsRead(${notif.id}, this)">
                    <div class="feed-icon">
                        <i class="fas fa-bell"></i>
                    </div>
                    <div class="feed-content">
                        <h4>${notif.title}</h4>
                        <p>${notif.message}</p>
                        <span><i class="far fa-clock"></i> ${dateStr}</span>
                    </div>
                </a>
            `;
            feedContainer.appendChild(feedItem);
        }

        // --- খ) মডালের লিস্ট ---
        if (notificationList) {
            const listItem = document.createElement('li');
            listItem.className = `notification-list-item ${isRead ? 'read' : ''}`;
            listItem.innerHTML = `
                <a href="#" class="notification-link" onclick="markAsRead(${notif.id}, this)">
                    <div class="feed-icon"><i class="fas fa-bell"></i></div>
                    <div class="feed-content">
                        <h4>${notif.title}</h4>
                        <p>${notif.message}</p>
                        <small>${dateStr}</small>
                    </div>
                </a>
            `;
            notificationList.appendChild(listItem);
        }
    });

    // ব্যাজ আপডেট করা
    const badge = document.getElementById('notification-badge');
    if (badge) {
        if (unreadCount > 0) {
            badge.style.display = 'inline-block';
            badge.innerText = unreadCount;
        } else {
            badge.style.display = 'none';
        }
    }
}

// ৪. নোটিফিকেশন "পঠিত" মার্ক করা
window.markAsRead = function(id, element) {
    let readNotifications = JSON.parse(localStorage.getItem('read_notifications')) || [];
    if (!readNotifications.includes(id)) {
        readNotifications.push(id);
        localStorage.setItem('read_notifications', JSON.stringify(readNotifications));
        
        // তাৎক্ষণিক UI আপডেট
        const container = element.closest('.notification-feed-item') || element.closest('.notification-list-item');
        if (container) {
            container.classList.remove('unread');
            container.classList.add('read');
        }
        
        // ব্যাজ কমানো
        const badge = document.getElementById('notification-badge');
        if (badge) {
            let currentCount = parseInt(badge.innerText);
            if (currentCount > 0) {
                badge.innerText = currentCount - 1;
                if (badge.innerText == '0') badge.style.display = 'none';
            }
        }
    }
};

// ৫. রিয়েলটাইম লিসেনার
let lastNotificationCount = 0;

supabaseClient
    .channel('public:notifications')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => {
        // নতুন notification এলে audio play করা
        const audio = new Audio('audio/notification.wav');
        audio.play().catch(err => console.log('Audio play failed:', err));
        
        // Notification fetch করা
        fetchNotifications();
        
        // Badge update করা
        const badge = document.getElementById('notification-badge');
        if (badge) {
            const currentCount = parseInt(badge.innerText) || 0;
            badge.style.display = 'inline-block';
            badge.innerText = currentCount + 1;
        }
    })
    .subscribe();

// ৬. মডাল ওপেন/ক্লোজ লজিক
function setupModalListeners() {
    const bellBtn = document.getElementById('show-notification-btn');
    const modal = document.getElementById('notification-modal');
    const closeBtn = document.getElementById('close-notification-modal');
    const closeFooterBtn = document.getElementById('close-notification-btn-footer');

    if(bellBtn && modal) {
        bellBtn.addEventListener('click', () => {
            modal.style.display = modal.style.display === 'flex' ? 'none' : 'flex';
        });
    }

    const closeModal = () => { if(modal) modal.style.display = 'none'; };
    if(closeBtn) closeBtn.addEventListener('click', closeModal);
    if(closeFooterBtn) closeFooterBtn.addEventListener('click', closeModal);
}

// পেজ লোড হলে রান হবে
setTimeout(() => {
    setupModalListeners();
    fetchNotifications();
}, 1000);
