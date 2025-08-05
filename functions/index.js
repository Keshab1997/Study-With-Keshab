// functions/index.js (ডিলিট ফাংশন সহ চূড়ান্ত)

const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { onCall } = require("firebase-functions/v2/https"); // onCall ইম্পোর্ট করুন
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { getMessaging } = require("firebase-admin/messaging");
const admin = require("firebase-admin");

admin.initializeApp();

// --- নোটিফিকেশন পাঠানোর ফাংশন ---
exports.sendPushNotification = onDocumentCreated("notificationQueue/{docId}", async (event) => {
    // ... আপনার এই ফাংশনটি অপরিবর্তিত থাকবে ...
    const snap = event.data;
    if (!snap) { return; }
    const notificationData = snap.data();
    const { title, body } = notificationData;
    const siteUrl = "https://keshab1997.github.io/Study-With-Keshab";
    const link = notificationData.link ? `${siteUrl}/${notificationData.link}` : siteUrl;
    
    const db = getFirestore();
    try {
        await db.collection("notifications").add({ title, body, link, createdAt: FieldValue.serverTimestamp() });
    } catch (error) { console.error("Error saving notification to Firestore:", error); }

    const usersSnapshot = await db.collection("users").get();
    const tokens = usersSnapshot.docs.map(doc => doc.data().fcmToken).filter(token => token);
    if (tokens.length === 0) { return snap.ref.delete(); }

    const payload = {
        data: { title, body, icon: `${siteUrl}/images/logo.jpg`, link },
        webpush: {
            notification: { sound: "/audio/notification.wav", vibrate: [200, 100, 200] },
            fcm_options: { link }
        },
    };
    await getMessaging().sendToDevice(tokens, payload);
    return snap.ref.delete();
});

// --- একটি নির্দিষ্ট বিজ্ঞপ্তি মুছে ফেলার ফাংশন (নতুন) ---
exports.deleteNotification = onCall(async (request) => {
    const uid = request.auth?.uid;
    const { docId } = request.data;
    if (!uid) { throw new functions.https.HttpsError('unauthenticated', 'You must be logged in.'); }

    const db = getFirestore();
    const userDoc = await db.collection('users').doc(uid).get();
    if (userDoc.data()?.role !== 'admin') {
        throw new functions.https.HttpsError('permission-denied', 'You must be an admin.');
    }
    if (!docId) { throw new functions.https.HttpsError('invalid-argument', 'Document ID is required.'); }
    
    await db.collection('notifications').doc(docId).delete();
    return { message: `Notification ${docId} deleted successfully.` };
});

// --- সমস্ত বিজ্ঞপ্তি মুছে ফেলার ফাংশন (নতুন) ---
exports.deleteAllNotifications = onCall(async (request) => {
    const uid = request.auth?.uid;
    if (!uid) { throw new functions.https.HttpsError('unauthenticated', 'You must be logged in.'); }

    const db = getFirestore();
    const userDoc = await db.collection('users').doc(uid).get();
    if (userDoc.data()?.role !== 'admin') {
        throw new functions.https.HttpsError('permission-denied', 'You must be an admin.');
    }
    
    const collectionRef = db.collection('notifications');
    const snapshot = await collectionRef.limit(500).get(); // একবারে ৫০০টি পর্যন্ত ডিলিট করবে
    if (snapshot.size === 0) { return { message: 'No notifications to delete.' }; }

    const batch = db.batch();
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();

    return { message: `Successfully deleted ${snapshot.size} notifications.` };
});