# Firestore Rules Deploy করার নির্দেশনা

## সমস্যা:
Profile page এ "Missing or insufficient permissions" error আসছে কারণ Firestore rules এ `examResults` collection এর permission নেই।

## সমাধান:

### ১. Firebase Console থেকে Rules আপডেট করুন:

1. Firebase Console এ যান: https://console.firebase.google.com
2. আপনার প্রজেক্ট সিলেক্ট করুন
3. বাম পাশের মেনু থেকে **Firestore Database** ক্লিক করুন
4. **Rules** ট্যাবে ক্লিক করুন
5. নিচের rules কপি করে পেস্ট করুন:

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    match /users/{userId} {
      allow get, update: if request.auth.uid == userId;
      allow list: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      allow create: if request.auth != null;
    }

    match /quiz_scores/{scoreId} {
      allow read: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update, delete: if false;
    }

    match /notificationQueue/{docId} {
      allow create: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      allow read, update, delete: if false;
    }

    match /notifications/{notificationId} {
      allow read: if request.auth != null;
      allow write: if false;
    }

    match /class_notes/{noteId} {
      allow read: if true;
      allow write: if request.auth != null && 
                   get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    match /chapters/{chapterId} {
      allow read: if true;
      allow write: if request.auth != null && 
                   get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // নতুন যোগ করা - Exam Results এর জন্য
    match /examResults/{resultId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow list: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

6. **Publish** বাটনে ক্লিক করুন

### ২. অথবা Firebase CLI দিয়ে:

যদি Firebase CLI ইনস্টল থাকে:
```bash
firebase deploy --only firestore:rules
```

## কিভাবে কাজ করবে:

✅ **examResults collection এ এখন:**
- User নিজের exam results পড়তে পারবে
- User নিজের exam results তৈরি করতে পারবে
- Admin সব users এর results দেখতে পারবে

✅ **Profile page এ দেখাবে:**
- সাম্প্রতিক ৫টি পরীক্ষার ফলাফল
- যদি কোনো পরীক্ষা না থাকে: "এখনো কোনো পরীক্ষা দেওয়া হয়নি"
- Error হলেও gracefully handle হবে

## পরীক্ষা করুন:
1. Rules deploy করার পর profile.html পেজে যান
2. Error আর আসবে না
3. Recent Activity section এ message দেখাবে
