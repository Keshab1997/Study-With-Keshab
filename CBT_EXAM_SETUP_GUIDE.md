# CBT Exam Setup Guide
## নতুন CBT Exam তৈরি করার সম্পূর্ণ গাইড

---

## 🎯 CBT Exam কী?

CBT (Computer Based Test) হলো একটি online exam platform যেখানে:
- ✅ Multiple choice questions (MCQ)
- ✅ Timer সহ পরীক্ষা
- ✅ Question palette (প্রশ্ন তালিকা)
- ✅ Mark for review
- ✅ Result page with certificate
- ✅ Firebase এ data save

---

## 📂 Folder Structure

```
cbt-exam/
├── exams/
│   ├── cbt1_questions.js  ← প্রশ্ন ফাইল
│   ├── cbt2_questions.js
│   └── ...
├── index.html             ← Main page
├── app.js                 ← Main logic
├── certificate.js         ← Certificate generator
├── firebase-config.js     ← Firebase setup
├── style.css              ← Styling
└── script.js              ← Helper functions
```

---

## ✅ নতুন CBT Exam তৈরি করার Steps

### Step 1: Questions File তৈরি করো

`exams/` folder এ নতুন file তৈরি করো: `cbt9_questions.js`

```javascript
const quizData = [
    {
        qNo: 1,
        questionText: "প্রশ্ন এখানে লিখো",
        options: ["অপশন ১", "অপশন ২", "অপশন ৩", "অপশন ৪"],
        answer: 0  // সঠিক উত্তরের index (0-3)
    },
    {
        qNo: 2,
        questionText: "দ্বিতীয় প্রশ্ন",
        options: ["A", "B", "C", "D"],
        answer: 2
    }
    // আরো প্রশ্ন যোগ করো...
];
```

**গুরুত্বপূর্ণ:**
- `qNo` শুরু হয় 1 থেকে
- `answer` index শুরু হয় 0 থেকে (0=প্রথম, 1=দ্বিতীয়, 2=তৃতীয়, 3=চতুর্থ)
- প্রতিটি প্রশ্নে 4টি options থাকতে হবে

---

### Step 2: index.html এ Exam যোগ করো

`index.html` খুলে `<select id="exam-select">` এর ভিতরে নতুন option যোগ করো:

```html
<select id="exam-select">
    <option value="" disabled selected>-- একটি পরীক্ষা বাছুন --</option>
    <option value="cbt1">Practice Set 1</option>
    <option value="cbt2">Practice Set 2</option>
    <!-- নতুন exam যোগ করো -->
    <option value="cbt9">My New Exam</option>
</select>
```

**নোট:** `value="cbt9"` অবশ্যই file name এর সাথে মিলতে হবে (cbt9_questions.js)

---

### Step 3: app.js এ Exam Load করো

`app.js` ফাইলে `loadExamQuestions()` function এ নতুন case যোগ করো:

```javascript
async function loadExamQuestions(examId) {
    let scriptSrc = "";
    
    switch (examId) {
        case "cbt1":
            scriptSrc = "exams/cbt1_questions.js";
            break;
        case "cbt2":
            scriptSrc = "exams/cbt2_questions.js";
            break;
        // নতুন case যোগ করো
        case "cbt9":
            scriptSrc = "exams/cbt9_questions.js";
            break;
        default:
            alert("Invalid exam selected!");
            return;
    }
    
    // বাকি code...
}
```

---

## 🎨 Questions File Format বিস্তারিত

### Basic Format:

```javascript
const quizData = [
    {
        qNo: 1,                    // প্রশ্ন নম্বর
        questionText: "প্রশ্ন",    // প্রশ্নের টেক্সট
        options: ["A", "B", "C", "D"],  // 4টি অপশন
        answer: 0                  // সঠিক উত্তর (0-3)
    }
];
```

### Math/Science প্রশ্নের জন্য:

```javascript
{
    qNo: 5,
    questionText: "√16 এর মান কত?",
    options: ["2", "4", "8", "16"],
    answer: 1  // "4" সঠিক
}
```

### Long Question:

```javascript
{
    qNo: 10,
    questionText: "একটি ট্রেন 60 কিমি/ঘণ্টা বেগে একটি খুঁটিকে 9 সেকেন্ডে অতিক্রম করে। ট্রেনটির দৈর্ঘ্য কত?",
    options: ["120 মিটার", "180 মিটার", "324 মিটার", "150 মিটার"],
    answer: 3
}
```

---

## 🔢 Answer Index বোঝা

**খুবই গুরুত্বপূর্ণ!**

```javascript
options: ["অপশন ১", "অপশন ২", "অপশন ৩", "অপশন ৪"]
          ↑ index 0  ↑ index 1  ↑ index 2  ↑ index 3
```

উদাহরণ:
```javascript
{
    questionText: "2 + 2 = ?",
    options: ["3", "4", "5", "6"],
    answer: 1  // "4" হলো index 1 এ আছে
}
```

---

## 📝 প্রশ্ন লেখার Tips

### 1. Clear & Concise:
```javascript
// ❌ ভুল
questionText: "এই প্রশ্নটি হলো যে আপনাকে বলতে হবে..."

// ✅ সঠিক
questionText: "ভারতের রাজধানী কোথায়?"
```

### 2. Options সমান দৈর্ঘ্যের:
```javascript
// ✅ ভালো
options: ["দিল্লি", "মুম্বাই", "কলকাতা", "চেন্নাই"]

// ❌ এড়িয়ে চলো
options: ["দিল্লি", "মুম্বাই যা ভারতের বৃহত্তম শহর", "কলকাতা", "চেন্নাই"]
```

### 3. Bangla Unicode ব্যবহার করো:
```javascript
questionText: "ভারতের রাজধানী কোথায়?"  // ✅
questionText: "Bharater rajdhani kothay?"  // ❌
```

---

## 🚀 Quick Setup (5 মিনিটে)

### নতুন Exam তৈরি করতে:

1. **Copy existing file:**
```bash
cp exams/cbt1_questions.js exams/cbt9_questions.js
```

2. **Edit questions:**
- `cbt9_questions.js` খুলো
- প্রশ্ন পরিবর্তন করো
- Answer index ঠিক করো

3. **Add to index.html:**
```html
<option value="cbt9">My New Exam</option>
```

4. **Add to app.js:**
```javascript
case "cbt9":
    scriptSrc = "exams/cbt9_questions.js";
    break;
```

5. **Test করো:**
- Browser এ খুলো
- Exam select করো
- Start করো

---

## 🎓 Example: Complete Exam

```javascript
// exams/cbt9_questions.js
const quizData = [
    {
        qNo: 1,
        questionText: "ভারতের রাজধানী কোথায়?",
        options: ["দিল্লি", "মুম্বাই", "কলকাতা", "চেন্নাই"],
        answer: 0
    },
    {
        qNo: 2,
        questionText: "2 + 2 = ?",
        options: ["3", "4", "5", "6"],
        answer: 1
    },
    {
        qNo: 3,
        questionText: "পৃথিবীর বৃহত্তম মহাদেশ কোনটি?",
        options: ["আফ্রিকা", "এশিয়া", "ইউরোপ", "আমেরিকা"],
        answer: 1
    }
];
```

---

## ⚙️ Advanced Features

### Timer সেট করা:

`app.js` এ:
```javascript
let examDuration = 90 * 60;  // 90 মিনিট (seconds এ)
```

### Passing Marks:

Result page এ passing marks দেখানোর জন্য:
```javascript
const passingMarks = 40;  // 40% pass
```

---

## 🔥 Common Mistakes এড়িয়ে চলো

### ❌ Mistake 1: Wrong Answer Index
```javascript
// ভুল
options: ["A", "B", "C", "D"],
answer: 2  // কিন্তু সঠিক উত্তর "B" (index 1)
```

### ❌ Mistake 2: File Name Mismatch
```javascript
// index.html এ
<option value="cbt9">...</option>

// কিন্তু file name হলো
cbt10_questions.js  // ❌ মিলছে না!
```

### ❌ Mistake 3: Missing Comma
```javascript
const quizData = [
    {
        qNo: 1,
        questionText: "প্রশ্ন ১",
        options: ["A", "B", "C", "D"],
        answer: 0
    }  // ❌ comma নেই!
    {
        qNo: 2,
        // ...
    }
];
```

---

## 📊 Testing Checklist

নতুন exam তৈরি করার পর check করো:

- [ ] Questions file সঠিকভাবে তৈরি হয়েছে?
- [ ] index.html এ option যোগ করেছো?
- [ ] app.js এ case যোগ করেছো?
- [ ] সব answer index সঠিক আছে?
- [ ] Browser এ test করেছো?
- [ ] Timer কাজ করছে?
- [ ] Submit button কাজ করছে?
- [ ] Result page দেখাচ্ছে?
- [ ] Certificate generate হচ্ছে?

---

## 🎯 Summary

**3টা জিনিস করলেই হবে:**

1. **Questions file তৈরি করো** (`exams/cbt9_questions.js`)
2. **index.html এ option যোগ করো**
3. **app.js এ case যোগ করো**

**ব্যস! তোমার CBT Exam ready!** 🎉
