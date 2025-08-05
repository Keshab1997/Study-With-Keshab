// নতুন এবং সংশোধিত কোড
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { getFirestore } = require("firebase-admin/firestore");
const { getMessaging } = require("firebase-admin/messaging");
const admin = require("firebase-admin");

admin.initializeApp();

// যখন 'notificationQueue' কালেকশনে নতুন কিছু যোগ হয়, তখন এই ফাংশনটি চলবে
exports.sendPushNotification = onDocumentCreated("notificationQueue/{docId}", async (event) => {
    const snap = event.data;
    if (!snap) {
        console.log("No data associated with the event");
        return;
    }
    const notificationData = snap.data();

    const title = notificationData.title;
    const body = notificationData.body;
    // আপনার সাইটের আসল URL ব্যবহার করুন
    const siteUrl = "https://keshab1997.github.io/Study-With-Keshab";
    const link = notificationData.link ? `${siteUrl}/${notificationData.link}` : siteUrl;

    console.log(`Sending notification: "${title}"`);

    const db = getFirestore();
    const usersSnapshot = await db.collection("users").get();
    const tokens = [];
    usersSnapshot.forEach((doc) => {
        const user = doc.data();
        if (user.fcmToken) {
            tokens.push(user.fcmToken);
        }
    });

    if (tokens.length === 0) {
        console.log("No user tokens found to send notification.");
        return snap.ref.delete(); // কাজ শেষ, অনুরোধ ডিলিট করুন
    }

    const payload = {
        notification: {
            title: title,
            body: body,
            icon: `${siteUrl}/images/logo.jpg`, // লোগোর সম্পূর্ণ URL
        },
        webpush: {
            fcm_options: {
                link: link,
            },
        },
    };

    console.log(`Sending notification to ${tokens.length} tokens.`);

    const messaging = getMessaging();
    await messaging.sendToDevice(tokens, payload);

    return snap.ref.delete();
});