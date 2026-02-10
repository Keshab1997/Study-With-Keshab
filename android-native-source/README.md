# Android Native Source Files

এই ফোল্ডারে Android Studio-তে ব্যবহার করার জন্য প্রয়োজনীয় ফাইলগুলো রয়েছে।

## ফাইলের তালিকা:
1. **MainActivity.java** - ওয়েবসাইট লোড করে এবং Firebase Topic-এ সাবস্ক্রাইব করে
2. **MyFirebaseMessagingService.java** - নোটিফিকেশন রিসিভ করে এবং দেখায়
3. **AndroidManifest.xml** - অ্যাপের পারমিশন এবং কনফিগারেশন

## Android Studio সেটআপ স্টেপ:

### ১. নতুন প্রজেক্ট তৈরি করুন:
- Android Studio খুলুন
- "New Project" → "Empty Views Activity" সিলেক্ট করুন
- Package name: `com.studywithkeshab.app`
- Language: Java
- Minimum SDK: API 21 (Android 5.0)

### ২. Firebase সেটআপ:
- Firebase Console (https://console.firebase.google.com) এ যান
- আপনার প্রজেক্ট সিলেক্ট করুন
- "Add App" → "Android" ক্লিক করুন
- Package name দিন: `com.studywithkeshab.app`
- `google-services.json` ফাইল ডাউনলোড করুন
- এই ফাইলটি `app/` ফোল্ডারে রাখুন

### ৩. build.gradle (Project level) এ যোগ করুন:
```gradle
buildscript {
    dependencies {
        classpath 'com.google.gms:google-services:4.4.0'
    }
}
```

### ৪. build.gradle (App level) এ যোগ করুন:
```gradle
plugins {
    id 'com.google.gms.google-services'
}

dependencies {
    implementation 'com.google.firebase:firebase-messaging:23.4.0'
    implementation 'androidx.appcompat:appcompat:1.6.1'
}
```

### ৫. ফাইলগুলো কপি করুন:
- `MainActivity.java` → `app/src/main/java/com/studywithkeshab/app/`
- `MyFirebaseMessagingService.java` → `app/src/main/java/com/studywithkeshab/app/`
- `AndroidManifest.xml` এর কন্টেন্ট আপনার প্রজেক্টের Manifest-এ মার্জ করুন

### ৬. Layout ফাইল (activity_main.xml):
```xml
<?xml version="1.0" encoding="utf-8"?>
<RelativeLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent">

    <WebView
        android:id="@+id/webview"
        android:layout_width="match_parent"
        android:layout_height="match_parent" />

</RelativeLayout>
```

### ৭. Notification Icon:
- `res/drawable/` ফোল্ডারে `ic_notification.xml` তৈরি করুন অথবা PNG আইকন রাখুন

### ৮. Build এবং Run:
- "Build" → "Make Project"
- "Run" → "Run 'app'"

## নোট:
- Firebase Server Key: `AIzaSyA_s7CWYwcKkcNIPoSJ5riuMwkixViHt-o`
- Topic Name: `all_android_users`
- Website URL: `https://keshab1997.github.io/Study-With-Keshab/`
