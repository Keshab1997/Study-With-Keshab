# Dashboard Features Update Guide
## কীভাবে Dashboard Features Update হয় এবং বাড়ে

---

## 🎯 মূল ধারণা

Dashboard এর সব features **Firebase থেকে real-time data** নিয়ে **automatically update** হয়। যখন তুমি:
- ✅ কুইজ দাও
- ✅ স্কোর পাও
- ✅ Class পড়ো

তখন Firebase এ data save হয় এবং Dashboard automatically update হয়ে যায়!

---

## 📊 প্রতিটি Feature কীভাবে Update হয়

### 1️⃣ **সাপ্তাহিক কার্যকলাপ (Weekly Activity Chart)**

#### কীভাবে বাড়ে:
- যখন তুমি **কুইজ দাও**, তখন সেই দিনের bar বাড়ে
- প্রতিটি কুইজ = 1 unit height বৃদ্ধি

#### Firebase Data:
```javascript
users/{userId}/chapters/{Chapter-Name}/quiz_sets/{quiz_name}/
  - attemptedAt: Timestamp  // কোন দিন কুইজ দিয়েছো
```

#### Code Logic:
```javascript
// সপ্তাহের প্রতিটি দিনের জন্য count করে
const weekActivity = { sun: 0, mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0 };

// Quiz এর date থেকে day বের করে count বাড়ায়
Object.values(quizSets).forEach(set => {
    const date = set.attemptedAt.toDate();
    const dayIndex = date.getDay(); // 0=রবি, 1=সোম...
    weekActivity[dayNames[dayIndex]]++; // সেই দিনের count বাড়ে
});
```

#### উদাহরণ:
- **রবিবার** 2টি কুইজ দিলে → রবির bar 2 unit উঁচু
- **সোমবার** 3টি কুইজ দিলে → সোমের bar 3 unit উঁচু

---

### 2️⃣ **সাম্প্রতিক কার্যকলাপ (Recent Activity)**

#### কীভাবে বাড়ে:
- যখন তুমি **নতুন কুইজ দাও**, তখন list এ add হয়
- সবচেয়ে নতুন 3টি কুইজ দেখায়

#### Firebase Data:
```javascript
users/{userId}/chapters/{Chapter-Name}/quiz_sets/{quiz_name}/
  - score: 15           // তোমার স্কোর
  - totalQuestions: 20  // মোট প্রশ্ন
  - attemptedAt: Timestamp
```

#### Code Logic:
```javascript
// সব quiz নিয়ে date অনুযায়ী sort করে
const activities = Object.entries(quizSets)
    .sort((a, b) => b.date - a.date)  // নতুন আগে
    .slice(0, 3);  // শুধু 3টি নেয়

// List এ দেখায়
activityList.innerHTML = activities.map(activity => `
    <li>
        <h4>${activity.name}</h4>
        <p>স্কোর: ${activity.score}/${activity.total}</p>
    </li>
`).join('');
```

#### উদাহরণ:
- Quiz 1 দিলে → 1টি activity দেখাবে
- Quiz 2 দিলে → 2টি activity দেখাবে
- Quiz 5 দিলে → শুধু শেষের 3টি দেখাবে

---

### 3️⃣ **আজকের পড়াশোনার সময় (Study Time)**

#### কীভাবে বাড়ে:
- **আজকে** যতগুলো কুইজ দিবে, ততটা বাড়বে
- প্রতিটি কুইজ = 15 মিনিট (ধরে নেওয়া)

#### Code Logic:
```javascript
// আজকের date
const today = new Date();
today.setHours(0, 0, 0, 0);

// আজকে কতগুলো quiz দিয়েছো count করে
let todayQuizzes = 0;
Object.values(quizSets).forEach(set => {
    const quizDate = set.attemptedAt.toDate();
    quizDate.setHours(0, 0, 0, 0);
    if (quizDate.getTime() === today.getTime()) {
        todayQuizzes++;  // আজকের quiz হলে count বাড়ে
    }
});

// সময় calculate করে
const estimatedMinutes = todayQuizzes * 15;
```

#### উদাহরণ:
- আজকে 0টি কুইজ → **0 মিনিট**
- আজকে 2টি কুইজ → **30 মিনিট** (2 × 15)
- আজকে 4টি কুইজ → **60 মিনিট** (4 × 15)

---

### 4️⃣ **এই অধ্যায়ে আপনার র্যাঙ্ক (Chapter Rank)**

#### কীভাবে বাড়ে/কমে:
- তোমার **total score** অন্যদের সাথে compare করে
- বেশি score = ভালো rank (ছোট number)

#### Firebase Data:
```javascript
users/{userId}/chapters/{Chapter-Name}/
  - totalScore: 150  // তোমার মোট স্কোর
```

#### Code Logic:
```javascript
// সব user এর score নিয়ে আসে
db.collection('users').get().then(snapshot => {
    const scores = [];
    snapshot.forEach(doc => {
        const score = doc.data().chapters?.[chapterKey]?.totalScore || 0;
        if (score > 0) {
            scores.push(score);
        }
    });

    // Score অনুযায়ী sort করে (বড় থেকে ছোট)
    scores.sort((a, b) => b - a);
    
    // তোমার position খুঁজে বের করে
    const rank = scores.indexOf(userScore) + 1;
});
```

#### উদাহরণ:
```
সব User এর Score:
- User A: 200 → Rank #1
- User B: 150 → Rank #2
- তুমি:  100 → Rank #3
- User C:  50 → Rank #4
```

যদি তুমি আরো কুইজ দিয়ে 180 score করো:
```
- User A: 200 → Rank #1
- তুমি:  180 → Rank #2 ⬆️ (উন্নতি!)
- User B: 150 → Rank #3
- User C:  50 → Rank #4
```

---

### 5️⃣ **Study Streak (পড়াশোনার ধারাবাহিকতা)**

#### কীভাবে বাড়ে:
- **প্রতিদিন** কুইজ দিলে streak বাড়ে
- একদিন miss করলে streak reset হয়ে 0 হয়

#### Code Logic:
```javascript
// সব quiz এর date নিয়ে sort করে
const dates = Object.values(quizSets)
    .map(set => set.attemptedAt?.toDate())
    .sort((a, b) => b - a);  // নতুন আগে

let streak = 0;
let currentDate = new Date();

// একটা একটা করে check করে
for (let date of dates) {
    const diffDays = Math.floor((currentDate - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === streak) {
        streak++;  // পরপর দিন হলে বাড়ে
    } else if (diffDays > streak) {
        break;  // gap পেলে থেমে যায়
    }
}
```

#### উদাহরণ:
```
আজ (শনিবার):    কুইজ দিয়েছো ✅ → Streak = 1
গতকাল (শুক্র):   কুইজ দিয়েছো ✅ → Streak = 2
পরশু (বৃহঃ):     কুইজ দিয়েছো ✅ → Streak = 3
তার আগের দিন:   কুইজ দাওনি ❌   → Streak থেমে গেছে

Final Streak: 3 দিন
```

---

### 6️⃣ **Quick Stats Cards**

#### 🎯 মোট কুইজ (Total Quizzes):
```javascript
const totalQuizzes = chapterData.completedQuizzesCount || 0;
```
- প্রতিটি নতুন কুইজ = +1

#### 📊 মোট স্কোর (Total Score):
```javascript
const totalScore = chapterData.totalScore || 0;
```
- প্রতিটি কুইজের score যোগ হয়

#### ⭐ গড় স্কোর (Average Score):
```javascript
const averageScore = totalScore / totalQuizzes;
```
- মোট স্কোর ÷ মোট কুইজ

#### উদাহরণ:
```
Quiz 1: 15/20 → Total = 15, Avg = 15
Quiz 2: 18/20 → Total = 33, Avg = 16.5
Quiz 3: 12/20 → Total = 45, Avg = 15
```

---

### 7️⃣ **Target Progress (লক্ষ্য অগ্রগতি)**

#### কীভাবে বাড়ে:
- মাসিক লক্ষ্য = 10টি কুইজ (পরিবর্তনযোগ্য)
- যতগুলো কুইজ দিবে, percentage বাড়বে

#### Code Logic:
```javascript
const monthlyTarget = 10;  // মাসিক লক্ষ্য
const percentage = (completedQuizzes / monthlyTarget) * 100;

// Progress bar fill করে
document.getElementById('target-fill').style.width = `${percentage}%`;
```

#### উদাহরণ:
```
0/10 কুইজ → 0%   ▱▱▱▱▱▱▱▱▱▱
3/10 কুইজ → 30%  ▰▰▰▱▱▱▱▱▱▱
5/10 কুইজ → 50%  ▰▰▰▰▰▱▱▱▱▱
10/10 কুইজ → 100% ▰▰▰▰▰▰▰▰▰▰
```

---

### 8️⃣ **Motivational Quote (প্রেরণামূলক উক্তি)**

#### কীভাবে পরিবর্তন হয়:
- **প্রতিদিন** নতুন quote দেখায়
- বছরের দিন অনুযায়ী rotate করে

#### Code Logic:
```javascript
// বছরের কততম দিন তা বের করে
const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);

// সেই দিন অনুযায়ী quote select করে
const quote = motivationalQuotes[dayOfYear % motivationalQuotes.length];
```

#### উদাহরণ:
- দিন 1 → Quote 1
- দিন 2 → Quote 2
- দিন 6 → Quote 1 (আবার শুরু, কারণ 5টি quote আছে)

---

## 🔥 কীভাবে Data Update হয়

### যখন তুমি কুইজ দাও:

1. **Quiz শেষ হলে** → Firebase এ data save হয়:
```javascript
firebase.firestore().collection('users').doc(userId).set({
    chapters: {
        'Ratio-Proportion': {
            completedQuizzesCount: increment(1),  // +1
            totalScore: increment(score),         // score যোগ
            totalCorrect: increment(correct),
            totalWrong: increment(wrong),
            quiz_sets: {
                'Quiz_Set_1': {
                    score: 15,
                    totalQuestions: 20,
                    attemptedAt: new Date()
                }
            }
        }
    }
}, { merge: true });
```

2. **Page reload হলে** → Dashboard features load হয়:
```javascript
document.addEventListener('DOMContentLoaded', function() {
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            loadDashboardFeatures('Ratio-Proportion');  // সব features update
        }
    });
});
```

3. **Automatically সব features update** হয়ে যায়!

---

## 🎯 Summary: কোন Feature কখন বাড়ে

| Feature | কখন বাড়ে | কীভাবে |
|---------|----------|--------|
| **Weekly Activity** | প্রতিটি কুইজে | সেই দিনের bar +1 |
| **Recent Activity** | নতুন কুইজে | List এ add হয় |
| **Study Time** | আজকের কুইজে | প্রতি কুইজ +15 min |
| **Rank** | Score বাড়লে | অন্যদের সাথে compare |
| **Streak** | প্রতিদিন কুইজে | পরপর দিন count |
| **Total Quizzes** | প্রতিটি কুইজে | +1 |
| **Total Score** | প্রতিটি কুইজে | score যোগ |
| **Average Score** | প্রতিটি কুইজে | total ÷ count |
| **Target Progress** | প্রতিটি কুইজে | percentage বাড়ে |
| **Quote** | প্রতিদিন | নতুন quote |

---

## 💡 Pro Tips

1. **প্রতিদিন কুইজ দাও** → Streak বাড়বে
2. **বেশি score করো** → Rank improve হবে
3. **নিয়মিত পড়ো** → Weekly activity chart ভরে যাবে
4. **মাসিক লক্ষ্য পূরণ করো** → Target progress 100% হবে

---

## 🚀 Quick Test

Dashboard features test করতে চাইলে:

1. একটা কুইজ দাও
2. Page reload করো
3. দেখো:
   - Total Quizzes +1 হয়েছে কিনা
   - Total Score বেড়েছে কিনা
   - Weekly Activity তে আজকের bar বেড়েছে কিনা
   - Recent Activity তে নতুন entry এসেছে কিনা
   - Study Time বেড়েছে কিনা

**সব automatic! কোনো manual update লাগবে না!** 🎉
