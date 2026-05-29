document.addEventListener('DOMContentLoaded', function() {
    const messaging = firebase.messaging();
    const db = firebase.firestore();
    const auth = firebase.auth();
    const vapidKey = "BFXBN-Bic5LmU0JT7g_REhog_O_FVtSJotQUIMhN-l4W7udrXsk9UiR3bwP_ANgDU18SByPg7NQFBx0qRTCwRYQ";

    window.requestNotificationPermission = function() {
        if (Notification.permission === 'denied') {
            if (window.showToast) showToast('নোটিফিকেশন বন্ধ আছে। ব্রাউজার সেটিংস থেকে অনুমতি দিন।', 'error');
            return;
        }
        if (Notification.permission === 'granted') {
            getAndSaveToken();
            return;
        }
        Notification.requestPermission().then((permission) => {
            if (permission === 'granted') {
                console.log('Notification permission granted.');
                getAndSaveToken();
            } else {
                console.log('Unable to get permission to notify.');
            }
        }).catch((err) => {
            console.log('An error occurred while requesting permission. ', err);
        });
    };

    function getAndSaveToken() {
        messaging.getToken({ vapidKey: vapidKey }).then((currentToken) => {
            if (currentToken) {
                console.log('FCM Token:', currentToken);
                saveTokenToFirestore(currentToken);
            } else {
                console.log('No registration token available.');
            }
        }).catch((err) => {
            console.log('An error occurred while retrieving token. ', err);
        });
    }

    function saveTokenToFirestore(token) {
        auth.onAuthStateChanged(function(user) {
            if (user) {
                const userRef = db.collection('users').doc(user.uid);
                userRef.set({
                    fcmToken: token
                }, { merge: true })
                .catch(err => console.error("Error updating token:", err));
            }
        });
    }
});
