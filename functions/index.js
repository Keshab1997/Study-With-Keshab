const functions = require('firebase-functions');
const admin = require('firebase-admin');
const https = require('https');
const { defineSecret } = require('firebase-functions/params');

admin.initializeApp();

const ONESIGNAL_API_KEY = defineSecret('ONESIGNAL_API_KEY');

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

exports.sendOneSignalNotification = functions.runWith({ secrets: ['ONESIGNAL_API_KEY'] }).https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');
    }

    const { title, message, url } = data;

    if (!title || !message) {
        throw new functions.https.HttpsError('invalid-argument', 'Title and message are required');
    }

    const APP_ID = '610e57c7-37f0-4dc5-9c67-7718ed094a9b';
    const REST_API_KEY = ONESIGNAL_API_KEY.value();

    const payload = JSON.stringify({
        app_id: APP_ID,
        included_segments: ['All'],
        headings: { en: title },
        contents: { en: message },
        url: url || 'https://studywithkeshab.netlify.app'
    });

    const options = {
        hostname: 'onesignal.com',
        port: 443,
        path: '/api/v1/notifications',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${REST_API_KEY}`,
            'Content-Length': Buffer.byteLength(payload)
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let responseData = '';

            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                try {
                    const result = JSON.parse(responseData);
                    if (res.statusCode === 200) {
                        resolve({ success: true, recipients: result.recipients });
                    } else {
                        reject(new functions.https.HttpsError('internal', result.errors ? result.errors.join(', ') : 'Unknown error'));
                    }
                } catch (error) {
                    reject(new functions.https.HttpsError('internal', 'Failed to parse response'));
                }
            });
        });

        req.on('error', (error) => {
            reject(new functions.https.HttpsError('internal', error.message));
        });

        req.write(payload);
        req.end();
    });
});
