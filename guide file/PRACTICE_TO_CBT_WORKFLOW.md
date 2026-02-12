# Practice-to-CBT Workflow Guide
## CBT Exam এ প্রশ্ন add করার আগে Practice করার সম্পূর্ণ System

---

## 🎯 তোমার Requirement

তুমি চাও:
1. নতুন Math প্রশ্ন CBT Exam এ add করার **আগে**
2. সেই প্রশ্নগুলো **ভালো করে practice** করতে
3. Practice করে নিশ্চিত হয়ে তারপর CBT Exam এ add করতে

---

## 📋 Complete Workflow

```
Step 1: নতুন প্রশ্ন তৈরি করো
    ↓
Step 2: Practice Section এ add করো
    ↓
Step 3: Practice করো (বারবার)
    ↓
Step 4: নিশ্চিত হলে CBT Exam এ add করো
```

---

## ✅ Step-by-Step Process

### Step 1: নতুন Math প্রশ্ন তৈরি করো

একটা আলাদা file তৈরি করো: `practice/new-questions.js`

```javascript
// নতুন প্রশ্ন যেগুলো practice করতে চাও
const newMathQuestions = [
    {
        qNo: 1,
        questionText: "একটি ট্রেন 60 কিমি/ঘণ্টা বেগে 9 সেকেন্ডে একটি খুঁটি অতিক্রম করে। ট্রেনের দৈর্ঘ্য কত?",
        options: ["120 মিটার", "150 মিটার", "180 মিটার", "200 মিটার"],
        answer: 1,
        explanation: "দূরত্ব = গতিবেগ × সময়। 60 কিমি/ঘণ্টা = 60×1000/3600 = 50/3 মি/সে। দূরত্ব = (50/3) × 9 = 150 মিটার",
        topic: "Speed & Distance",
        difficulty: "Medium"
    },
    {
        qNo: 2,
        questionText: "5000 টাকার 3 বছরের সরল সুদ 1500 টাকা। সুদের হার কত?",
        options: ["8%", "10%", "12%", "15%"],
        answer: 1,
        explanation: "সুদের হার = (সুদ × 100) / (মূলধন × সময়) = (1500 × 100) / (5000 × 3) = 10%",
        topic: "Simple Interest",
        difficulty: "Easy"
    }
    // আরো প্রশ্ন যোগ করো...
];
```

---

### Step 2: Practice Mode তৈরি করো

`practice/practice-mode.js` তৈরি করো:

```javascript
// Practice Mode - নতুন প্রশ্ন practice করার জন্য
let practiceMode = {
    currentSet: 'new-questions', // কোন set practice করছো
    showExplanation: true,       // explanation দেখাবে
    repeatWrong: true,           // ভুল প্রশ্ন আবার আসবে
    trackProgress: true          // progress track করবে
};

// Practice করার সময় statistics track করো
let practiceStats = {
    totalAttempts: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    questionsNeedReview: [],     // যেগুলো আবার practice করতে হবে
    readyForCBT: []              // যেগুলো CBT এ add করা যাবে
};

function markQuestionReady(questionId) {
    // যখন একটা প্রশ্ন 3 বার সঠিক উত্তর দিবে
    // তখন এটা CBT ready হবে
    if (!practiceStats.readyForCBT.includes(questionId)) {
        practiceStats.readyForCBT.push(questionId);
        console.log(`Question ${questionId} is ready for CBT!`);
    }
}
```

---

### Step 3: Practice করার HTML Page

`practice-new.html` তৈরি করো:

```html
<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <title>নতুন প্রশ্ন Practice</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <div class="container">
        <h1>🎯 নতুন Math প্রশ্ন Practice</h1>
        <p>এই প্রশ্নগুলো ভালো করে practice করো। 3 বার সঠিক উত্তর দিলে CBT Exam এ add করতে পারবে।</p>
        
        <!-- Progress Tracker -->
        <div class="progress-tracker">
            <h3>Progress</h3>
            <p>মোট প্রশ্ন: <span id="total-questions">0</span></p>
            <p>Practice সম্পন্ন: <span id="completed">0</span></p>
            <p>CBT Ready: <span id="ready-for-cbt">0</span></p>
        </div>
        
        <!-- Practice Container -->
        <div id="practice-container">
            <!-- Questions will load here -->
        </div>
        
        <!-- Action Buttons -->
        <div class="action-buttons">
            <button onclick="repeatWrongQuestions()">ভুল প্রশ্ন আবার করো</button>
            <button onclick="exportToCBT()">CBT Exam এ Export করো</button>
        </div>
    </div>
    
    <script src="practice/new-questions.js"></script>
    <script src="practice/practice-mode.js"></script>
</body>
</html>
```

---

### Step 4: CBT Exam এ Export করো

যখন practice শেষ হবে, তখন automatically CBT format এ convert করো:

```javascript
function exportToCBT() {
    // শুধু ready questions নিবে
    const readyQuestions = newMathQuestions.filter((q, idx) => 
        practiceStats.readyForCBT.includes(idx)
    );
    
    if (readyQuestions.length === 0) {
        alert('কোনো প্রশ্ন এখনো CBT ready নয়! আরো practice করো।');
        return;
    }
    
    // CBT format এ convert করো
    const cbtFormat = readyQuestions.map(q => ({
        qNo: q.qNo,
        questionText: q.questionText,
        options: q.options,
        answer: q.answer
        // explanation CBT তে লাগবে না
    }));
    
    // JSON format এ download করো
    const dataStr = "const quizData = " + JSON.stringify(cbtFormat, null, 4) + ";";
    const dataBlob = new Blob([dataStr], {type: 'text/javascript'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'cbt-ready-questions.js';
    link.click();
    
    alert(`${readyQuestions.length}টি প্রশ্ন CBT format এ export হয়েছে!`);
}
```

---

## 🎨 Enhanced Practice Features

### Feature 1: Difficulty-wise Practice

```javascript
// সহজ থেকে কঠিন - ধাপে ধাপে practice করো
const practiceByDifficulty = {
    easy: newMathQuestions.filter(q => q.difficulty === 'Easy'),
    medium: newMathQuestions.filter(q => q.difficulty === 'Medium'),
    hard: newMathQuestions.filter(q => q.difficulty === 'Hard')
};

// প্রথমে Easy, তারপর Medium, শেষে Hard
```

### Feature 2: Topic-wise Practice

```javascript
// Topic অনুযায়ী practice করো
const practiceByTopic = {
    'Speed & Distance': [],
    'Simple Interest': [],
    'Ratio & Proportion': [],
    'Percentage': []
};

newMathQuestions.forEach(q => {
    if (!practiceByTopic[q.topic]) {
        practiceByTopic[q.topic] = [];
    }
    practiceByTopic[q.topic].push(q);
});
```

### Feature 3: Repeat Until Perfect

```javascript
// যতক্ষণ না 100% সঠিক হচ্ছে, ততক্ষণ practice করো
function repeatUntilPerfect(question) {
    let attempts = 0;
    let correctCount = 0;
    
    // 3 বার পরপর সঠিক উত্তর দিতে হবে
    while (correctCount < 3) {
        // Show question
        // If correct: correctCount++
        // If wrong: correctCount = 0 (reset)
        attempts++;
    }
    
    return {
        question: question,
        attempts: attempts,
        status: 'CBT Ready'
    };
}
```

---

## 📊 Practice Dashboard

একটা dashboard তৈরি করো যেখানে দেখতে পারবে:

```html
<div class="practice-dashboard">
    <h2>📊 Practice Dashboard</h2>
    
    <div class="stats-grid">
        <div class="stat-card">
            <h3>মোট নতুন প্রশ্ন</h3>
            <p class="big-number">25</p>
        </div>
        
        <div class="stat-card">
            <h3>Practice সম্পন্ন</h3>
            <p class="big-number">15</p>
        </div>
        
        <div class="stat-card">
            <h3>CBT Ready</h3>
            <p class="big-number success">10</p>
        </div>
        
        <div class="stat-card">
            <h3>আরো Practice লাগবে</h3>
            <p class="big-number warning">5</p>
        </div>
    </div>
    
    <!-- Topic-wise Progress -->
    <div class="topic-progress">
        <h3>Topic-wise Progress</h3>
        <div class="progress-bar">
            <span>Speed & Distance</span>
            <div class="bar"><div class="fill" style="width: 80%">80%</div></div>
        </div>
        <div class="progress-bar">
            <span>Simple Interest</span>
            <div class="bar"><div class="fill" style="width: 60%">60%</div></div>
        </div>
    </div>
</div>
```

---

## 🚀 Quick Workflow Example

### তুমি যা করবে:

1. **নতুন 10টি Math প্রশ্ন লিখো** → `new-questions.js`

2. **Practice করো** → `practice-new.html` খুলো
   - প্রতিটি প্রশ্ন 3 বার সঠিক উত্তর দাও
   - Explanation পড়ো
   - ভুল হলে আবার practice করো

3. **Progress দেখো** → Dashboard এ
   - কতগুলো CBT ready
   - কোন topic এ weak

4. **Export করো** → CBT Exam এ
   - "Export to CBT" button চাপো
   - File download হবে
   - সেটা `cbt-exam/exams/` এ copy করো

5. **CBT Exam এ add করো**
   - `index.html` এ option যোগ করো
   - `app.js` এ case যোগ করো

---

## 💡 Pro Tips

### Tip 1: Practice Checklist

প্রতিটি প্রশ্নের জন্য:
- [ ] 1st attempt - সঠিক?
- [ ] 2nd attempt - সঠিক?
- [ ] 3rd attempt - সঠিক?
- [ ] Explanation বুঝেছো?
- [ ] নিজে solve করতে পারো?

### Tip 2: Difficulty Progression

```
Week 1: Easy questions (10টি)
Week 2: Medium questions (10টি)
Week 3: Hard questions (10টি)
Week 4: Mixed practice (সব মিলিয়ে)
```

### Tip 3: Daily Practice Goal

```
প্রতিদিন: 5টি নতুন প্রশ্ন practice
প্রতি সপ্তাহে: 35টি প্রশ্ন CBT ready
প্রতি মাসে: 140টি প্রশ্ন CBT Exam এ add
```

---

## 📁 File Structure

```
cbt-exam/
├── practice/
│   ├── new-questions.js       ← নতুন প্রশ্ন
│   ├── practice-mode.js       ← Practice logic
│   ├── practice-stats.json    ← Progress tracking
│   └── cbt-ready/             ← Export করা প্রশ্ন
│       ├── batch-1.js
│       ├── batch-2.js
│       └── ...
├── exams/
│   ├── cbt1_questions.js      ← Final CBT Exam
│   └── ...
└── practice-new.html          ← Practice page
```

---

## ✨ Summary

**তোমার Workflow:**

1. নতুন Math প্রশ্ন লিখো
2. Practice page এ practice করো
3. 3 বার সঠিক = CBT Ready
4. Export করো
5. CBT Exam এ add করো

**Benefits:**
- ✅ ভালো করে practice হবে
- ✅ Weak topics খুঁজে পাবে
- ✅ Confident হয়ে CBT দিতে পারবে
- ✅ Quality questions CBT এ যাবে

**এই system follow করলে তুমি Math এ expert হয়ে যাবে!** 🎯
