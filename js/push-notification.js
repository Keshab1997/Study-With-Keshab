// Web Push Notification Setup
const publicVapidKey = 'BFXBN-Bic5LmU0JT7g_REhog_O_FVtSJotQUIMhN-l4W7udrXsk9UiR3bwP_ANgDU18SByPg7NQFBx0qRTCwRYQ';

// Check notification permission
async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

// Subscribe to push notifications
async function subscribeToPush() {
  const permission = await requestNotificationPermission();
  if (!permission) return;

  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Subscribe to push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
      });

      // Send subscription to server
      await fetch('/api/subscribe', {
        method: 'POST',
        body: JSON.stringify(subscription),
        headers: { 'Content-Type': 'application/json' }
      });

      console.log('Push notification subscribed');
    } catch (error) {
      console.error('Failed to subscribe:', error);
    }
  }
}

// Helper function
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Show notification button
const notifyBtn = document.createElement('button');
notifyBtn.textContent = '🔔 নোটিফিকেশন চালু করুন';
notifyBtn.style.cssText = 'position:fixed;bottom:80px;right:20px;z-index:1000;background:#4a90e2;color:white;border:none;padding:12px 20px;border-radius:25px;cursor:pointer;box-shadow:0 4px 15px rgba(74,144,226,0.3);display:none;';

if (Notification.permission === 'default') {
  notifyBtn.style.display = 'block';
}

notifyBtn.onclick = subscribeToPush;
document.body.appendChild(notifyBtn);
