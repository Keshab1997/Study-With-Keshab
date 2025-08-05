// functions/index.js (সংশোধিত ও সঠিক কোড)

const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { getFirestore } = require("firebase-admin/firestore");
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

    // ============= নতুন সংযোজন: নোটিফিকেশন হিস্ট্রি সেভ করা =============
    const db = getFirestore();
    try {
        await db.collection("notifications").add({
            title: title,
            body: body,
            link: link,
            createdAt: new Date(), // বর্তমান সময় যোগ করা হলো
        });
        console.log("Notification saved to 'notifications' collection.");
    } catch (error) {
        console.error("Error saving notification to Firestore:", error);
    }
    // =================================================================

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

    // ============= সবচেয়ে গুরুত্বপূর্ণ পরিবর্তন: Payload-এর গঠন =============
    const payload = {
        // 'notification' অবজেক্টের পরিবর্তে 'data' ব্যবহার করুন
        data: {
            title: title,
            body: body,
            icon: `${siteUrl}/images/logo.jpg`, // সম্পূর্ণ URL ব্যবহার করুন
            link: link,
        }
    };
    // ===================================================================

    console.log(`Sending notification to ${tokens.length} tokens.`);

    const messaging = getMessaging();
    await messaging.sendToDevice(tokens, payload);

    // কাজ শেষ, অনুরোধ ডিলিট করুন
    return snap.ref.delete();
});