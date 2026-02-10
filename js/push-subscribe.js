document.addEventListener('DOMContentLoaded', function() {
    const messaging = firebase.messaging();
    const db = firebase.firestore();
    const auth = firebase.auth();
    const vapidKey = "BFXBN-Bic5LmU0JT7g_REhog_O_FVtSJotQUIMhN-l4W7udrXsk9UiR3bwP_ANgDU18SByPg7NQFBx0qRTCwRYQ";

    function requestPermission() {
        console.log('Requesting permission...');
        Notification.requestPermission().then((permission) => {
            if (permission === 'granted') {
                console.log('Notification permission granted.');
                return messaging.getToken({ vapidKey: vapidKey });
            } else {
                console.log('Unable to get permission to notify.');
            }
        }).then((currentToken) => {
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

    requestPermission();
});
