// functions/index.js (সামান্য আপডেট সহ আপনার v2 কোড)

const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { getFirestore, FieldValue } = require("firebase-admin/firestore"); // FieldValue ইম্পোর্ট করুন
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
            createdAt: FieldValue.serverTimestamp(), // <-- new Date() এর পরিবর্তে এটি ব্যবহার করুন
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

    const payload = {
        data: {
            title: title,
            body: body,
            icon: `${siteUrl}/images/logo.jpg`,
            link: link,
        }
    };

    console.log(`Sending notification to ${tokens.length} tokens.`);

    const messaging = getMessaging();
    await messaging.sendToDevice(tokens, payload);

    return snap.ref.delete();
});