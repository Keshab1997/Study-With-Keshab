// App Update Notification Handler
let updateAvailable = false;

// Service Worker থেকে message শুনুন
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data.type === 'UPDATE_AVAILABLE') {
      updateAvailable = true;
      showUpdateNotification();
    }
  });

  // Check for updates
  navigator.serviceWorker.register('sw.js').then(registration => {
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          showUpdateNotification();
        }
      });
    });
  });
}

// Update notification দেখান
function showUpdateNotification() {
  const updateBanner = document.createElement('div');
  updateBanner.id = 'update-banner';
  updateBanner.innerHTML = `
    <div style="position:fixed;top:0;left:0;right:0;background:#4a90e2;color:white;padding:15px;text-align:center;z-index:10000;box-shadow:0 2px 10px rgba(0,0,0,0.2);">
      <span style="margin-right:15px;">🎉 নতুন আপডেট এসেছে!</span>
      <button onclick="updateApp()" style="background:white;color:#4a90e2;border:none;padding:8px 20px;border-radius:20px;cursor:pointer;font-weight:600;">
        এখনই আপডেট করুন
      </button>
      <button onclick="dismissUpdate()" style="background:transparent;color:white;border:1px solid white;padding:8px 15px;border-radius:20px;cursor:pointer;margin-left:10px;">
        পরে করব
      </button>
    </div>
  `;
  document.body.appendChild(updateBanner);
}

// Update করুন
function updateApp() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistration().then(registration => {
      if (registration && registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
    });
  }
  window.location.reload();
}

// Dismiss করুন
function dismissUpdate() {
  const banner = document.getElementById('update-banner');
  if (banner) banner.remove();
}

// Service Worker এ skip waiting handler
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload();
  });
}
