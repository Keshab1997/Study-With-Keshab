# CBT Practice Section Setup Guide
## Class এর মধ্যে Practice Section যোগ করার গাইড

---

## 🎯 কী করতে হবে?

তুমি চাও:
1. **Class Content** → পড়াশোনার material
2. **Practice Section** → MCQ practice করার জন্য
3. **CBT Exam Link** → Full exam দেওয়ার জন্য

---

## 📂 Structure

```
cbt-exam/
├── class/
│   ├── class1.html          ← Class + Practice
│   ├── practice/
│   │   └── practice1.js     ← Practice questions
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── script.js
│       └── practice.js      ← Practice logic
└── index.html               ← Main CBT Exam
```

---

## ✅ Step-by-Step Setup

### Step 1: Practice Questions File তৈরি করো

`cbt-exam/class/practice/practice1.js` তৈরি করো:

```javascript
// Practice Questions for Class 1
const practiceQuestions = [
    {
        qNo: 1,
        questionText: "5 : 7 এর ব্যস্ত অনুপাত কত?",
        options: ["5 : 7", "7 : 5", "25 : 49", "1 : 1"],
        answer: 1,
        explanation: "ব্যস্ত অনুপাত মানে জায়গা বদল। 5 : 7 → 7 : 5"
    },
    {
        qNo: 2,
        questionText: "4 এবং 9 এর মধ্যসমানুপাতী কত?",
        options: ["5", "6", "36", "13"],
        answer: 1,
        explanation: "মধ্যসমানুপাতী = √(4 × 9) = √36 = 6"
    },
    {
        qNo: 3,
        questionText: "2 : 3 এবং 4 : 5 এর মিশ্র অনুপাত কত?",
        options: ["6 : 8", "8 : 15", "10 : 12", "15 : 8"],
        answer: 1,
        explanation: "মিশ্র অনুপাত = (2×4) : (3×5) = 8 : 15"
    }
];
```

---

### Step 2: Practice Logic JavaScript তৈরি করো

`cbt-exam/class/js/practice.js` তৈরি করো:

```javascript
// Practice Section Logic
let currentQuestion = 0;
let score = 0;
let answered = [];

function loadPracticeQuestion() {
    if (currentQuestion >= practiceQuestions.length) {
        showPracticeResult();
        return;
    }

    const q = practiceQuestions[currentQuestion];
    
    document.getElementById('practice-question-no').textContent = `প্রশ্ন ${q.qNo}/${practiceQuestions.length}`;
    document.getElementById('practice-question-text').textContent = q.questionText;
    
    const optionsHTML = q.options.map((opt, idx) => `
        <div class="practice-option" onclick="selectPracticeOption(${idx})">
            <input type="radio" name="practice-answer" id="opt${idx}" value="${idx}">
            <label for="opt${idx}">${opt}</label>
        </div>
    `).join('');
    
    document.getElementById('practice-options').innerHTML = optionsHTML;
    document.getElementById('practice-explanation').style.display = 'none';
}

function selectPracticeOption(selectedIdx) {
    const q = practiceQuestions[currentQuestion];
    const isCorrect = selectedIdx === q.answer;
    
    if (isCorrect) {
        score++;
    }
    
    // Show explanation
    const explanationDiv = document.getElementById('practice-explanation');
    explanationDiv.innerHTML = `
        <div class="${isCorrect ? 'correct' : 'wrong'}">
            <strong>${isCorrect ? '✅ সঠিক!' : '❌ ভুল!'}</strong>
            <p>সঠিক উত্তর: ${q.options[q.answer]}</p>
            <p>${q.explanation}</p>
        </div>
    `;
    explanationDiv.style.display = 'block';
    
    // Disable options
    document.querySelectorAll('.practice-option').forEach(opt => {
        opt.style.pointerEvents = 'none';
        opt.style.opacity = '0.6';
    });
    
    // Show next button
    document.getElementById('practice-next-btn').style.display = 'block';
}

function nextPracticeQuestion() {
    currentQuestion++;
    loadPracticeQuestion();
    document.getElementById('practice-next-btn').style.display = 'none';
}

function showPracticeResult() {
    const percentage = (score / practiceQuestions.length * 100).toFixed(0);
    document.getElementById('practice-container').innerHTML = `
        <div class="practice-result">
            <h2>🎉 Practice সম্পন্ন!</h2>
            <div class="result-stats">
                <p>মোট প্রশ্ন: ${practiceQuestions.length}</p>
                <p>সঠিক উত্তর: ${score}</p>
                <p>ভুল উত্তর: ${practiceQuestions.length - score}</p>
                <p>শতাংশ: ${percentage}%</p>
            </div>
            <button onclick="restartPractice()" class="btn-primary">আবার Practice করো</button>
            <a href="../../index.html" class="btn-secondary">CBT Exam দাও</a>
        </div>
    `;
}

function restartPractice() {
    currentQuestion = 0;
    score = 0;
    location.reload();
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('practice-container')) {
        loadPracticeQuestion();
    }
});
```

---

### Step 3: class1.html এ Practice Section যোগ করো

Class content এর পরে এই HTML যোগ করো:

```html
<!-- Practice Section -->
<div class="practice-section">
    <h2>📝 Practice করো</h2>
    <p>পরীক্ষার আগে এই প্রশ্নগুলো practice করে নাও!</p>
    
    <div id="practice-container" class="practice-container">
        <div class="practice-header">
            <h3 id="practice-question-no">প্রশ্ন 1/10</h3>
        </div>
        
        <div class="practice-question">
            <p id="practice-question-text"></p>
        </div>
        
        <div id="practice-options" class="practice-options">
            <!-- Options will be loaded here -->
        </div>
        
        <div id="practice-explanation" class="practice-explanation" style="display: none;">
            <!-- Explanation will be shown here -->
        </div>
        
        <button id="practice-next-btn" onclick="nextPracticeQuestion()" style="display: none;">
            পরবর্তী প্রশ্ন →
        </button>
    </div>
</div>

<!-- CBT Exam Link -->
<div class="cbt-exam-link">
    <h2>🎯 CBT Exam দিতে প্রস্তুত?</h2>
    <p>Practice শেষ হলে এখন Full CBT Exam দাও!</p>
    <a href="../../index.html" class="btn-cbt-exam">
        <i class="fas fa-laptop"></i> CBT Exam শুরু করো
    </a>
</div>

<!-- Scripts -->
<script src="practice/practice1.js"></script>
<script src="js/practice.js"></script>
```

---

### Step 4: CSS Styling যোগ করো

`css/style.css` এ যোগ করো:

```css
/* Practice Section */
.practice-section {
    margin: 40px 0;
    padding: 30px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 15px;
    color: white;
}

.practice-container {
    background: white;
    padding: 30px;
    border-radius: 10px;
    margin-top: 20px;
    color: #333;
}

.practice-header h3 {
    color: #667eea;
    margin-bottom: 20px;
}

.practice-question {
    font-size: 1.2rem;
    margin: 20px 0;
    padding: 20px;
    background: #f8f9fa;
    border-radius: 8px;
}

.practice-options {
    display: flex;
    flex-direction: column;
    gap: 15px;
    margin: 20px 0;
}

.practice-option {
    padding: 15px;
    border: 2px solid #ddd;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    gap: 10px;
}

.practice-option:hover {
    background: #f0f0f0;
    border-color: #667eea;
}

.practice-option input[type="radio"] {
    width: 20px;
    height: 20px;
}

.practice-option label {
    cursor: pointer;
    flex: 1;
}

.practice-explanation {
    margin: 20px 0;
    padding: 20px;
    border-radius: 8px;
}

.practice-explanation .correct {
    background: #d4edda;
    border: 2px solid #28a745;
    color: #155724;
}

.practice-explanation .wrong {
    background: #f8d7da;
    border: 2px solid #dc3545;
    color: #721c24;
}

#practice-next-btn {
    padding: 12px 30px;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s;
}

#practice-next-btn:hover {
    background: #764ba2;
    transform: translateX(5px);
}

/* Practice Result */
.practice-result {
    text-align: center;
    padding: 40px;
}

.result-stats {
    margin: 30px 0;
    padding: 20px;
    background: #f8f9fa;
    border-radius: 10px;
}

.result-stats p {
    font-size: 1.2rem;
    margin: 10px 0;
}

/* CBT Exam Link */
.cbt-exam-link {
    margin: 40px 0;
    padding: 40px;
    text-align: center;
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    border-radius: 15px;
    color: white;
}

.btn-cbt-exam {
    display: inline-block;
    padding: 15px 40px;
    background: white;
    color: #f5576c;
    text-decoration: none;
    border-radius: 10px;
    font-size: 1.2rem;
    font-weight: bold;
    margin-top: 20px;
    transition: all 0.3s;
    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
}

.btn-cbt-exam:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.3);
}

.btn-cbt-exam i {
    margin-right: 10px;
}

/* Buttons */
.btn-primary {
    padding: 12px 30px;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    margin: 10px;
}

.btn-secondary {
    padding: 12px 30px;
    background: #6c757d;
    color: white;
    text-decoration: none;
    border-radius: 8px;
    display: inline-block;
    margin: 10px;
}
```

---

## 🎯 Complete Example

### Folder Structure:
```
cbt-exam/
├── class/
│   ├── class1.html
│   ├── practice/
│   │   └── practice1.js
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── script.js
│       └── practice.js
└── index.html
```

### Flow:
```
1. Student পড়ে (Class Content)
   ↓
2. Practice করে (Practice Section)
   ↓
3. CBT Exam দেয় (Full Exam)
```

---

## 🚀 Quick Setup

### নতুন Class এর জন্য:

1. **Practice questions তৈরি করো:**
```bash
cp practice/practice1.js practice/practice2.js
```

2. **class2.html এ যোগ করো:**
```html
<script src="practice/practice2.js"></script>
<script src="js/practice.js"></script>
```

3. **Questions edit করো:**
- `practice2.js` খুলো
- প্রশ্ন পরিবর্তন করো

---

## 💡 Pro Tips

1. **Practice questions সংখ্যা:** 5-10টি যথেষ্ট
2. **Explanation দাও:** প্রতিটি প্রশ্নে কেন সঠিক তা বলো
3. **Difficulty level:** সহজ থেকে কঠিন
4. **CBT link:** Practice শেষে prominently দেখাও

---

## ✨ Summary

**3টা জিনিস যোগ করো:**
1. Practice questions file (`practice/practice1.js`)
2. Practice logic (`js/practice.js`)
3. HTML section (class1.html এ)

**Result:** Class → Practice → CBT Exam! 🎉
