// ১. Supabase কনফিগারেশন
const supabaseUrl = 'https://yofmaciyxrwvqyzyltml.supabase.co'; // আপনার URL বসান
const supabaseKey = 'sb_publishable_g1eUh3i6hpDQX8w_1-hrvw_ChYrhkc3'; // আপনার KEY বসান
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// HTML এলিমেন্ট সিলেক্ট করা
const feedContainer = document.getElementById('realtime-notification-feed'); // হোম পেজের ফিড
const notificationList = document.getElementById('notification-list'); // মডালের লিস্ট
const badge = document.getElementById('notification-badge'); // বেল আইকনের ব্যাজ

// ২. নোটিফিকেশন লোড করার ফাংশন
async function fetchNotifications() {
    const { data, error } = await supabase
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

// ৩. রেন্ডার ফাংশন (ফিড এবং মডাল দুই জায়গাতেই দেখাবে)
function renderNotifications(notifications) {
    // লোকাল স্টোরেজ থেকে পঠিত (Read) নোটিফিকেশনের লিস্ট নেওয়া
    const readNotifications = JSON.parse(localStorage.getItem('read_notifications')) || [];
    let unreadCount = 0;

    // ক্লিয়ার করা
    if (feedContainer) feedContainer.innerHTML = '';
    if (notificationList) notificationList.innerHTML = '';

    if (notifications.length === 0) {
        if (feedContainer) feedContainer.innerHTML = '<p class="text-center">কোনো নতুন বিজ্ঞপ্তি নেই।</p>';
        if (notificationList) notificationList.innerHTML = '<li class="no-notification-message">কোনো বিজ্ঞপ্তি নেই</li>';
        if (badge) badge.style.display = 'none';
        return;
    }

    notifications.forEach(notif => {
        const isRead = readNotifications.includes(notif.id);
        if (!isRead) unreadCount++;

        const dateStr = new Date(notif.created_at).toLocaleDateString('bn-BD', {
            day: 'numeric', month: 'long', year: 'numeric'
        });

        // --- ক) হোম পেজের ফিড তৈরি ---
        if (feedContainer) {
            const feedItem = document.createElement('div');
            // CSS ক্লাস: read অথবা unread যোগ করা হচ্ছে
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

        // --- খ) মডালের লিস্ট তৈরি ---
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
    if (badge) {
        if (unreadCount > 0) {
            badge.style.display = 'flex';
            badge.innerText = unreadCount;
        } else {
            badge.style.display = 'none';
        }
    }
}

// ৪. নোটিফিকেশন "পঠিত" (Read) মার্ক করার ফাংশন
window.markAsRead = function(id, element) {
    // লোকাল স্টোরেজে আইডি সেভ করা
    let readNotifications = JSON.parse(localStorage.getItem('read_notifications')) || [];
    if (!readNotifications.includes(id)) {
        readNotifications.push(id);
        localStorage.setItem('read_notifications', JSON.stringify(readNotifications));
        
        // তাৎক্ষণিক UI আপডেট করা (পুরো পেজ রিলোড না করে)
        const container = element.closest('.notification-feed-item') || element.closest('.notification-list-item');
        if (container) {
            container.classList.remove('unread');
            container.classList.add('read');
        }
        
        // ব্যাজ কমানো
        let currentCount = parseInt(badge.innerText);
        if (currentCount > 0) {
            badge.innerText = currentCount - 1;
            if (badge.innerText == '0') badge.style.display = 'none';
        }
    }
};

// ৫. রিয়েলটাইম লিসেনার
supabase
    .channel('public:notifications')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, () => {
        fetchNotifications();
    })
    .subscribe();

// পেজ লোড হলে রান হবে
document.addEventListener('DOMContentLoaded', fetchNotifications);

// ৬. মডাল ওপেন/ক্লোজ লজিক (আপনার HTML এ থাকা আইডি অনুযায়ী)
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