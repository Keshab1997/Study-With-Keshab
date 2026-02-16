# নতুন Chapter Setup Guide

এই guide অনুসরণ করে আপনি সহজেই নতুন chapter তৈরি করতে পারবেন। শুধুমাত্র JSON files এ content add করলেই সব কিছু automatic হয়ে যাবে।

---

## 📁 Folder Structure

```
subject/Math/YOUR_CHAPTER_NAME/
├── data/
│   ├── chapter-info.json    (Chapter এর main info)
│   ├── class1.json          (Class 1 এর content)
│   ├── class2.json          (Class 2 এর content)
│   ├── Qset1.json           (Quiz Set 1)
│   └── Qset2.json           (Quiz Set 2)
├── class/
│   └── class.html           (Class page - copy from LCM_HCF)
├── quiz/
│   └── quiz.html            (Quiz page - copy from LCM_HCF)
├── css/                     (Copy all CSS files from LCM_HCF)
├── js/                      (Copy all JS files from LCM_HCF)
└── index.html               (Main chapter page - copy from LCM_HCF)
```

---

## 🎯 Step 1: Chapter Info Setup (chapter-info.json)

**File Location:** `data/chapter-info.json`

```json
{
  "chapterID": "YOUR-CHAPTER-ID",
  "chapterName": "Chapter Name (বাংলা নাম)",
  "description": "Chapter এর সংক্ষিপ্ত বর্ণনা",
  "logoURL": "https://cdn-icons-png.flaticon.com/512/993/993872.png",
  "classes": [
    { "title": "Class 1 Title", "id": "1" },
    { "title": "Class 2 Title", "id": "2" },
    { "title": "Class 3 Title", "id": "3" }
  ],
  "quizzes": [
    { "title": "Quiz Set 01: Topic Name", "set": "Qset1" },
    { "title": "Quiz Set 02: Topic Name", "set": "Qset2" }
  ],
  "pdfs": [
    { "title": "PDF Title", "driveID": "GOOGLE_DRIVE_FILE_ID" }
  ]
}
```

**Important Notes:**
- `chapterID`: Unique ID (use hyphen, e.g., "Algebra-Basics")
- `logoURL`: Image URL for logo
- `driveID`: Google Drive file ID থেকে নিন (share link এর মধ্যে থাকে)

---

## 📚 Step 2: Class Content Setup (class1.json, class2.json)

**File Location:** `data/class1.json`

```json
{
  "chapterName": "Chapter Name (বাংলা নাম)",
  "classNumber": "01",
  "sections": [
    {
      "type": "title",
      "content": "Section Title"
    },
    {
      "type": "header",
      "content": "Sub-heading"
    },
    {
      "type": "text",
      "content": "Normal paragraph text here."
    },
    {
      "type": "math",
      "content": "Mathematical equation: x² + y² = z²"
    },
    {
      "type": "box",
      "content": "<strong>Important Note:</strong> This will appear in a colored box."
    },
    {
      "type": "list",
      "items": [
        "List item 1",
        "List item 2",
        "List item 3"
      ]
    },
    {
      "type": "question",
      "qText": "Question text here?",
      "explanation": "Detailed explanation and solution here."
    }
  ]
}
```

**Content Types:**
- `title`: Main section heading (h3)
- `header`: Sub-heading (h4)
- `text`: Normal paragraph
- `math`: Mathematical equations (styled box)
- `box`: Highlighted content box
- `list`: Bullet point list
- `question`: Question with explanation

---

## ❓ Step 3: Quiz Setup (Qset1.json, Qset2.json)

**File Location:** `data/Qset1.json`

```json
{
  "chapterName": "Chapter Name",
  "setName": "Quiz Set 01: Topic Name",
  "questions": [
    {
      "id": 1,
      "question": "প্রশ্ন এখানে লিখুন?",
      "options": [
        "Option A",
        "Option B",
        "Option C",
        "Option D"
      ],
      "correctAnswer": 0,
      "explanation": "সঠিক উত্তরের ব্যাখ্যা এখানে লিখুন।"
    },
    {
      "id": 2,
      "question": "দ্বিতীয় প্রশ্ন?",
      "options": [
        "Option A",
        "Option B",
        "Option C",
        "Option D"
      ],
      "correctAnswer": 2,
      "explanation": "ব্যাখ্যা..."
    }
  ]
}
```

**Important Notes:**
- `correctAnswer`: 0-based index (0 = first option, 1 = second, etc.)
- `explanation`: প্রতিটি প্রশ্নের জন্য বিস্তারিত ব্যাখ্যা দিন

---

## 📄 Step 4: PDF Setup

**Google Drive থেকে File ID নেওয়ার নিয়ম:**

1. Google Drive এ PDF upload করুন
2. File এ right-click করে "Get link" select করুন
3. Link এর format হবে: `https://drive.google.com/file/d/FILE_ID_HERE/view`
4. `FILE_ID_HERE` অংশটি copy করে `chapter-info.json` এ paste করুন

**Example:**
```
Link: https://drive.google.com/file/d/1ScBMw_gEaZsvJq7itgow2p5tZYR7JyfH/view
File ID: 1ScBMw_gEaZsvJq7itgow2p5tZYR7JyfH
```

---

## 🚀 Step 5: Files Copy করুন

**LCM_HCF folder থেকে এই files copy করুন:**

1. **index.html** - Main chapter page
2. **class/class.html** - Class page
3. **quiz/quiz.html** - Quiz page
4. **All CSS files** from `css/` folder
5. **All JS files** from `js/` folder

**শুধু এই files এ chapter name update করুন:**
- `index.html` - Line 6: Update title
- `class/class.html` - Line 9: Update title

---

## ✅ Checklist

নতুন chapter তৈরি করার আগে এই checklist follow করুন:

- [ ] Folder structure তৈরি করেছেন
- [ ] `chapter-info.json` তৈরি করেছেন
- [ ] সব class এর JSON files তৈরি করেছেন (class1.json, class2.json, etc.)
- [ ] সব quiz এর JSON files তৈরি করেছেন (Qset1.json, Qset2.json, etc.)
- [ ] PDF files Google Drive এ upload করেছেন এবং File ID নিয়েছেন
- [ ] LCM_HCF থেকে HTML, CSS, JS files copy করেছেন
- [ ] Title update করেছেন

---

## 🤖 Google Studio System Instruction

নিচের instruction Google Studio তে paste করুন:

```
You are a content creator for an educational platform. Your task is to create JSON files for chapters, classes, and quizzes based on the content provided by the user.

IMPORTANT RULES:
1. Always follow the exact JSON structure provided in the examples
2. Use Bengali language for all content
3. For class content, use appropriate content types: title, header, text, math, box, list, question
4. For quizzes, correctAnswer must be 0-based index (0, 1, 2, or 3)
5. Always provide detailed explanations for quiz answers
6. Keep content clear, concise, and educational

When user provides content, ask which file they want to create:
- chapter-info.json
- class1.json, class2.json, etc.
- Qset1.json, Qset2.json, etc.

Then generate the complete JSON file based on their content.
```

---

## 📝 Example Usage

**User বলবে:**
"আমি Algebra chapter এর জন্য class 1 এর content তৈরি করতে চাই। Topic: Basic Equations"

**AI Response করবে:**
```json
{
  "chapterName": "Algebra (বীজগণিত)",
  "classNumber": "01",
  "sections": [
    {
      "type": "title",
      "content": "মৌলিক সমীকরণ (Basic Equations)"
    },
    ...
  ]
}
```

---

## 🎨 Design Features

এই system এ automatic features:
- ✅ Dynamic chapter loading
- ✅ Automatic navigation buttons
- ✅ Premium gradient design
- ✅ Mobile responsive
- ✅ Dark mode support
- ✅ Theme customization
- ✅ Progress tracking
- ✅ Leaderboard
- ✅ PDF viewer with zoom/rotate
- ✅ Quiz with timer and scoring

---

## 🆘 Troubleshooting

**Problem:** Content দেখাচ্ছে না
**Solution:** Browser console check করুন, JSON syntax error আছে কিনা

**Problem:** PDF খুলছে না
**Solution:** Google Drive file এর sharing setting "Anyone with the link" করুন

**Problem:** Quiz score save হচ্ছে না
**Solution:** Firebase configuration ঠিক আছে কিনা check করুন

---

## 📞 Support

কোনো সমস্যা হলে:
1. Console error check করুন
2. JSON syntax validator দিয়ে check করুন
3. File paths ঠিক আছে কিনা verify করুন

---

**Happy Teaching! 🎓**
