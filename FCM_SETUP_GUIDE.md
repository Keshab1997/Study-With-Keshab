# Firebase Cloud Messaging (FCM) Setup Guide - FREE

## ধাপ ১: Firebase Console এ যান
1. https://console.firebase.google.com/ এ যান
2. আপনার existing project select করুন

## ধাপ ২: Cloud Messaging Enable করুন
1. Project Settings > Cloud Messaging
2. "Web Push certificates" এ যান
3. "Generate key pair" ক্লিক করুন
4. VAPID key copy করুন

## ধাপ ৩: Code এ VAPID Key যোগ করুন
js/push-notification.js ফাইলে:
```javascript
const publicVapidKey = 'YOUR_COPIED_VAPID_KEY_HERE';
```

## ধাপ ৪: Admin Panel থেকে Notification পাঠান
Admin panel এ notification create করলে automatically সবাইকে push notification যাবে।

## খরচ: ০ টাকা (সম্পূর্ণ বিনামূল্যে)
- Daily limit: Unlimited
- Monthly limit: Unlimited
- Forever FREE

## বিকল্প (যদি FCM না চান):
1. OneSignal - Free (10,000 subscribers পর্যন্ত)
2. Pusher Beams - Free (1,000 devices পর্যন্ত)
3. Web Push API - Completely free (no service needed)
