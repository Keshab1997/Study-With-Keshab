// ১. Supabase কনফিগারেশন
const supabaseUrl = 'https://yofmaciyxrwvqyzyltml.supabase.co'; 
const supabaseKey = 'sb_publishable_g1eUh3i6hpDQX8w_1-hrvw_ChYrhkc3'; 

// [SOLVED] 'supabase' এর বদলে 'supabaseClient' ব্যবহার করা হয়েছে যাতে লাইব্রেরির সাথে সংঘর্ষ না হয়
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

// HTML এলিমেন্ট সিলেক্ট করা
const feedContainer = document.getElementById('realtime-notification-feed'); 
const notificationList = document.getElementById('notification-list'); 
const badge = document.getElementById('notification-badge'); 

// ২. নোটিফিকেশন লোড করার ফাংশন
async function fetchNotifications() {
    // এখানেও supabaseClient ব্যবহার করা হয়েছে
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

// ৩. রেন্ডার ফাংশন
function renderNotifications(notifications) {
    const readNotifications = JSON.parse(localStorage.getItem('read_notifications')) || [];
    let unreadCount = 0;

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

    if (badge) {
        if (unreadCount > 0) {
            badge.style.display = 'flex';
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
        
        const container = element.closest('.notification-feed-item') || element.closest('.notification-list-item');
        if (container) {
            container.classList.remove('unread');
            container.classList.add('read');
        }
        
        let currentCount = parseInt(badge.innerText);
        if (currentCount > 0) {
            badge.innerText = currentCount - 1;
            if (badge.innerText == '0') badge.style.display = 'none';
        }
    }
};

// ৫. রিয়েলটাইম লিসেনার
// এখানেও supabaseClient ব্যবহার করা হয়েছে
supabaseClient
    .channel('public:notifications')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, () => {
        fetchNotifications();
    })
    .subscribe();

// পেজ লোড হলে রান হবে
document.addEventListener('DOMContentLoaded', fetchNotifications);

// ৬. মডাল ওপেন/ক্লোজ লজিক
const bellBtn = document.getElementById('show-notification-btn');
const modal = document.getElementById('notification-modal');
const closeBtn = document.getElementById('close-notification-modal');
const closeFooterBtn = document.getElementById('close-notification-btn-footer');
const clearBtn = document.getElementById('clear-read-notifications-btn'); // নতুন যোগ করা বাটনের লজিক যদি লাগে

if(bellBtn && modal) {
    bellBtn.addEventListener('click', () => {
        modal.style.display = modal.style.display === 'flex' ? 'none' : 'flex';
    });
}

const closeModal = () => { if(modal) modal.style.display = 'none'; };
if(closeBtn) closeBtn.addEventListener('click', closeModal);
if(closeFooterBtn) closeFooterBtn.addEventListener('click', closeModal);

// অতিরিক্ত: পঠিত সব মুছুন বাটন (যদি প্রয়োজন হয়)
if(clearBtn) {
    clearBtn.addEventListener('click', () => {
        // এখানে আপনি চাইলে লোকাল স্টোরেজ ক্লিয়ার করতে পারেন অথবা UI থেকে সরাতে পারেন
        // উদাহরণ: localStorage.removeItem('read_notifications'); fetchNotifications();
        alert('ফিচারটি শীঘ্রই আসছে!'); 
    });
}