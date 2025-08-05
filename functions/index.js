// functions/index.js (সাউন্ড সহ আপডেট করা v2 কোড)

const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { getMessaging } = require("firebase-admin/messaging");
const admin = require("firebase-admin");

admin.initializeApp();

exports.sendPushNotification = onDocumentCreated("notificationQueue/{docId}", async (event) => {
    const snap = event.data;
    if (!snap) {
        console.log("No data associated with the event");
        return;
    }
    const notificationData = snap.data();

    const title = notificationData.title;
    const body = notificationData.body;
    const siteUrl = "https://keshab1997.github.io/Study-With-Keshab";
    const link = notificationData.link ? `${siteUrl}/${notificationData.link}` : siteUrl;

    console.log(`Preparing notification: "${title}"`);

    const db = getFirestore();
    try {
        await db.collection("notifications").add({
            title: title,
            body: body,
            link: link,
            createdAt: FieldValue.serverTimestamp(),
        });
        console.log("Notification saved to 'notifications' collection.");
    } catch (error) {
        console.error("Error saving notification to Firestore:", error);
    }

    const usersSnapshot = await db.collection("users").get();
    const tokens = [];
    usersSnapshot.forEach((doc) => {
        const user = doc.data();
        if (user.fcmToken) {
            tokens.push(user.fcmToken);
        }
    });

    if (tokens.length === 0) {
        console.log("No user tokens found. Deleting queue item.");
        return snap.ref.delete();
    }

    // ================== পেলোড আপডেট করা হয়েছে ==================
    const payload = {
        data: {
            title: title,
            body: body,
            icon: `${siteUrl}/images/logo.jpg`,
            link: link,
        },
        // --- সাউন্ড এবং ভাইব্রেশন যোগ করা হয়েছে ---
        webpush: {
            notification: {
                // আপনার ওয়েবসাইটের রুট থেকে সাউন্ড ফাইলের পাথ
                // GitHub Pages-এ এটি হবে: /Study-With-Keshab/audio/notification.wav
                // কিন্তু <base> ট্যাগ থাকায় শুধু /audio/notification.wav লিখলেই হবে।
                sound: "/audio/notification.wav",
                vibrate: [200, 100, 200], // (ঐচ্ছিক) মোবাইল ডিভাইসের জন্য
            },
            fcm_options: {
                link: link // নোটিফিকেশনে ক্লিক করলে এই লিঙ্ক খুলবে
            }
        },
    };
    // ========================================================

    console.log(`Sending notification to ${tokens.length} tokens.`);

    const messaging = getMessaging();
    await messaging.sendToDevice(tokens, payload);

    return snap.ref.delete();
});