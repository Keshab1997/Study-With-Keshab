const VAPID_KEY = 'BFXBN-Bic5LmU0JT7g_REhog_O_FVtSJotQUIMhN-l4W7udrXsk9UiR3bwP_ANgDU18SByPg7NQFBx0qRTCwRYQ';

async function subscribeToPush() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.log('Push not supported');
    return;
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    console.log('Permission denied');
    return;
  }

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_KEY)
  });

  console.log('Subscribed:', subscription);
  localStorage.setItem('push_subscribed', 'true');
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

if (localStorage.getItem('push_subscribed') !== 'true') {
  setTimeout(() => subscribeToPush(), 3000);
}
