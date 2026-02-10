// Web Push Notification Setup
const publicVapidKey = 'BFXBN-Bic5LmU0JT7g_REhog_O_FVtSJotQUIMhN-l4W7udrXsk9UiR3bwP_ANgDU18SByPg7NQFBx0qRTCwRYQ';

console.log('=== PUSH NOTIFICATION SCRIPT LOADED ===');
console.log('VAPID Key:', publicVapidKey);

// Check notification permission
async function requestNotificationPermission() {
  console.log('=== REQUEST NOTIFICATION PERMISSION ===');
  
  if (!('Notification' in window)) {
    console.error('This browser does not support notifications');
    return false;
  }
  console.log('Notification API supported');

  if (Notification.permission === 'granted') {
    console.log('Permission already granted');
    return true;
  }

  if (Notification.permission !== 'denied') {
    console.log('Requesting permission...');
    const permission = await Notification.requestPermission();
    console.log('Permission result:', permission);
    return permission === 'granted';
  }

  console.error('Permission denied');
  return false;
}

// Subscribe to push notifications
async function subscribeToPush() {
  console.log('=== SUBSCRIBE TO PUSH ===');
  
  const permission = await requestNotificationPermission();
  if (!permission) {
    console.error('Permission not granted, cannot subscribe');
    return;
  }

  if ('serviceWorker' in navigator) {
    try {
      console.log('Waiting for service worker...');
      const registration = await navigator.serviceWorker.ready;
      console.log('Service worker ready:', registration);
      
      console.log('Subscribing to push...');
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
      });
      console.log('Push subscription:', subscription);
      console.log('Push notification subscribed successfully!');
      alert('নোটিফিকেশন চালু হয়েছে!');
    } catch (error) {
      console.error('Failed to subscribe:', error);
      alert('Error: ' + error.message);
    }
  } else {
    console.error('Service Worker not supported');
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

console.log('Current permission:', Notification.permission);
if (Notification.permission === 'default') {
  console.log('Showing notification button');
  notifyBtn.style.display = 'block';
} else {
  console.log('Permission already set, hiding button');
}

notifyBtn.onclick = () => {
  console.log('Notification button clicked');
  subscribeToPush();
};
document.body.appendChild(notifyBtn);
console.log('Notification button added to page');
