const VAPID_KEY = 'BFXBN-Bic5LmU0JT7g_REhog_O_FVtSJotQUIMhN-l4W7udrXsk9UiR3bwP_ANgDU18SByPg7NQFBx0qRTCwRYQ';

async function subscribeToPush() {
  console.log('=== SUBSCRIBE TO PUSH START ===');
  
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.log('Push not supported');
    return;
  }

  try {
    const permission = await Notification.requestPermission();
    console.log('Permission:', permission);
    
    if (permission !== 'granted') {
      console.log('Permission denied');
      return;
    }

    const registration = await navigator.serviceWorker.ready;
    console.log('Service Worker ready');
    
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_KEY)
    });

    console.log('Subscribed successfully:', subscription);
    localStorage.setItem('push_subscribed', 'true');
  } catch (error) {
    console.error('Subscribe error:', error);
  }
}

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

window.addEventListener('load', () => {
  if (localStorage.getItem('push_subscribed') !== 'true') {
    setTimeout(() => subscribeToPush(), 3000);
  } else {
    console.log('Already subscribed');
  }
});
