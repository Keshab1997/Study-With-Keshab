// functions/index.js

const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.sendPushNotification = functions.firestore
    .document("notificationQueue/{docId}")
    .onCreate(async (snap, context) => {
      const notificationData = snap.data();
      const title = notificationData.title;
      const body = notificationData.body;
      const siteUrl = "https://keshab1997.github.io/Study-With-Keshab"; // আপনার GitHub Pages URL
      const link = notificationData.link ? `${siteUrl}/${notificationData.link}` : siteUrl;

      console.log(`Sending notification: "${title}"`);

      const usersSnapshot = await admin.firestore().collection("users").get();
      const tokens = [];
      usersSnapshot.forEach((doc) => {
        const user = doc.data();
        if (user.fcmToken) {
          tokens.push(user.fcmToken);
        }
      });

      if (tokens.length === 0) {
        console.log("No user tokens found to send notification.");
        return snap.ref.delete();
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
      await admin.messaging().sendToDevice(tokens, payload);
      return snap.ref.delete();
    });