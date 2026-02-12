# 📚 নতুন Chapter Setup করার Complete Guide

## ধাপ ১: Folder Structure তৈরি করুন

```
subject/Math/YourNewChapter/
├── index.html
├── dashboard-features.js
├── css/
│   ├── style.css
│   └── pdf-viewer.css
├── js/
│   ├── script.js
│   ├── firebase-config.js
│   └── pdf-viewer.js
├── images/
│   └── default-avatar.png
├── class/
│   ├── class1.html
│   ├── class2.html
│   └── ...
└── pdf/
    ├── note1.pdf
    ├── note2.pdf
    └── ...
```

## ধাপ ২: HTML File এ যা পরিবর্তন করতে হবে

### 2.1 Title এবং Favicon (Line 7-10)
```html
<title>Your Chapter Name | Study With Keshab</title>
<link rel="icon" type="image/png" href="YOUR_ICON_URL" />
```

### 2.2 Header Logo এবং Title (Line 58-62)
```html
<img src="YOUR_LOGO_URL" alt="লোগো" class="profile-pic" />
<h1>অধ্যায়: Your Chapter Name (বাংলা নাম)</h1>
```

### 2.3 Chapter Name Variable (Line 86)
```javascript
const CURRENT_CHAPTER_NAME = "Your-Chapter-Name";
```
**গুরুত্বপূর্ণ:** 
- Space এর জায়গায় hyphen (-) ব্যবহার করুন
- উদাহরণ: "Algebra-Basics", "Simple-Interest", "Geometry-Basics"

## ধাপ ৩: Class Notes Links পরিবর্তন করুন (Line 140-148)

```html
<a href="class/class1.html"><i class="fa-solid fa-person-chalkboard fa-fw"></i> Class 01: Your Topic</a>
<a href="class/class2.html"><i class="fa-solid fa-person-chalkboard fa-fw"></i> Class 02: Your Topic</a>
<!-- আরও class যোগ করুন -->
```

## ধাপ ৪: Quiz Sets Links পরিবর্তন করুন (Line 160-163)

```html
<a href="#"><i class="fa-solid fa-puzzle-piece fa-fw"></i> Quiz Set 01</a>
<a href="#"><i class="fa-solid fa-puzzle-piece fa-fw"></i> Quiz Set 02</a>
<!-- আরও quiz যোগ করুন -->
```

## ধাপ ৫: JavaScript Files Setup

### 5.1 dashboard-features.js এর শেষে
```javascript
// Load Dashboard Features when page loads
document.addEventListener('DOMContentLoaded', function() {
    firebase.auth().onAuthStateChanged((user) => {
        if (user && typeof loadDashboardFeatures === 'function') {
            loadDashboardFeatures('Your-Chapter-Name'); // এখানে পরিবর্তন করুন
        }
    });
});
```

### 5.2 js/script.js এ (যদি থাকে)
Chapter name variable check করুন এবং প্রয়োজনে update করুন।

## ধাপ ৬: Firebase এ Chapter Data Structure

আপনার Firebase Firestore এ user document এ এই structure থাকবে:

```javascript
users/{userId}/chapters/{Your-Chapter-Name}/
{
    completedQuizzesCount: 0,
    totalCorrect: 0,
    totalWrong: 0,
    totalScore: 0,
    quiz_sets: {
        Quiz_Set_01: {
            score: 10,
            totalQuestions: 20,
            attemptedAt: timestamp
        }
    }
}
```

## ধাপ ৭: PDF Files Setup

### 7.1 PDF folder এ files রাখুন
```
pdf/
├── note1.pdf
├── note2.pdf
└── ...
```

### 7.2 js/script.js এ PDF list update করুন
```javascript
const pdfFiles = [
    { name: "Note 1", file: "pdf/note1.pdf" },
    { name: "Note 2", file: "pdf/note2.pdf" },
    // আরও যোগ করুন
];
```

## ধাপ ৮: Icon/Logo খুঁজে নিন

### Popular Icon Sites:
1. **Flaticon**: https://www.flaticon.com/
2. **Icons8**: https://icons8.com/
3. **Font Awesome**: https://fontawesome.com/

### উদাহরণ Icons:
- Algebra: https://cdn-icons-png.flaticon.com/512/3655/3655580.png
- Geometry: https://cdn-icons-png.flaticon.com/512/2784/2784461.png
- Percentage: https://cdn-icons-png.flaticon.com/512/2920/2920277.png
- Simple Interest: https://cdn-icons-png.flaticon.com/512/3135/3135706.png

## ধাপ ৯: Testing Checklist

✅ Page load হচ্ছে কিনা
✅ Logo এবং Favicon দেখা যাচ্ছে কিনা
✅ Dashboard features কাজ করছে কিনা
✅ Class notes links সঠিক কিনা
✅ PDF viewer কাজ করছে কিনা
✅ Quiz links সঠিক কিনা
✅ Firebase data save হচ্ছে কিনা
✅ Leaderboard এ data দেখা যাচ্ছে কিনা

## ধাপ ১০: Quick Setup Command (আমাকে বলুন)

আমাকে শুধু এই তথ্য দিন:

```
Chapter Name: [English Name]
Chapter Name (Bangla): [বাংলা নাম]
Icon URL: [Icon link]
Number of Classes: [সংখ্যা]
Number of Quizzes: [সংখ্যা]
```

আমি automatically সব setup করে দেব!

## উদাহরণ:

```
Chapter Name: Simple Interest
Chapter Name (Bangla): সরল সুদ
Icon URL: https://cdn-icons-png.flaticon.com/512/3135/3135706.png
Number of Classes: 5
Number of Quizzes: 3
```

---

## 🚀 Quick Tips:

1. **Chapter Name সবসময় consistent রাখুন** - HTML, JavaScript, Firebase সব জায়গায় same name
2. **Space এর জায়গায় hyphen** - "Simple-Interest" না "Simple Interest"
3. **Icon size 512x512 best** - Clear এবং sharp দেখায়
4. **PDF files ছোট রাখুন** - Fast loading এর জন্য
5. **Class notes আগে তৈরি করুন** - তারপর links যোগ করুন

---

## 📞 Need Help?

আমাকে বলুন:
- "Setup করে দাও [Chapter Name]"
- অথবা উপরের format এ তথ্য দিন

আমি সব automatically করে দেব! 🎉
