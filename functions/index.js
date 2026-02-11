const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

exports.sendAndroidNotification = functions.https.onRequest(async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(204).send('');
    }

    if (req.method !== 'POST') {
        return res.status(405).json({error: 'Method not allowed'});
    }

    const { title, message } = req.body;

    if (!title || !message) {
        return res.status(400).json({error: 'Title and message are required'});
    }

    try {
        const response = await admin.messaging().sendToTopic('all_android_users', {
            notification: {
                title: title,
                body: message,
                icon: 'ic_notification',
                sound: 'default'
            },
            android: {
                priority: 'high'
            }
        });
        
        res.json({ 
            success: true, 
            messageId: response.messageId,
            successCount: response.successCount 
        });
    } catch (error) {
        console.error('FCM Error:', error);
        res.status(500).json({error: error.message});
    }
});
