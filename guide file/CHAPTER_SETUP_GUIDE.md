# নতুন Chapter Setup Guide - AI দিয়ে সহজে তৈরি করুন

এই guide অনুসরণ করে আপনি AI কে দিয়ে সহজেই নতুন chapter তৈরি করতে পারবেন। শুধু নিচের commands copy-paste করুন এবং content দিন।

---

## 🤖 AI Setup (প্রথমে এটি করুন)

### Google Studio / ChatGPT তে এই System Instruction দিন:

```
You are an educational content creator for "Study With Keshab" platform. Your task is to create JSON files for Bengali educational content.

IMPORTANT RULES:
1. Always output ONLY valid JSON - no extra text, no markdown code blocks
2. Use Bengali language for all educational content
3. Follow the exact JSON structure provided
4. For class titles in chapter-info.json, DO NOT include "Class 1:", "Class 2:" prefix - just write the topic name
5. For quiz correctAnswer, use 0-based index (0=first option, 1=second, 2=third, 3=fourth)
6. Always provide detailed Bengali explanations for quiz answers
7. Use HTML tags in explanations: <span class='fraction'><span class='top'>numerator</span><span class='bottom'>denominator</span></span> for fractions
8. Use &times; for multiplication, &there4; for therefore, &rarr; for arrow

When user requests a file, generate complete valid JSON immediately.
```

---

## 📋 Step-by-Step Commands (AI কে এগুলো দিন)

### STEP 1: Chapter Info তৈরি করুন

**AI কে এই command দিন:**

```
Create chapter-info.json file with this information:

Chapter ID: [আপনার chapter ID, যেমন: "Algebra-Basics"]
Chapter Name: [বাংলা নাম (English Name), যেমন: "বীজগণিত (Algebra)"]
Description: [chapter এর সংক্ষিপ্ত বর্ণনা বাংলায়]
Logo URL: https://cdn-icons-png.flaticon.com/512/993/993872.png

Classes (শুধু topic name লিখুন, "Class 1:" লিখবেন না):
1. [Class 1 এর topic]
2. [Class 2 এর topic]
3. [Class 3 এর topic]
[আরো class থাকলে যোগ করুন]

Quizzes:
1. Quiz Set 01: [topic name]
2. Quiz Set 02: [topic name]
[আরো quiz থাকলে যোগ করুন]

PDFs:
1. [PDF title] - Drive ID: [Google Drive file ID]
2. [PDF title] - Drive ID: [Google Drive file ID]
[আরো PDF থাকলে যোগ করুন]

Generate complete chapter-info.json now.
```

**Example:**
```
Create chapter-info.json file with this information:

Chapter ID: "Compound-Interest"
Chapter Name: "চক্রবৃদ্ধি সুদ (Compound Interest)"
Description: "চক্রবৃদ্ধি সুদের প্রাথমিক ধারণা, সূত্রাবলি এবং বিভিন্ন জটিল গাণিতিক সমস্যার সহজ সমাধান নিয়ে এই অধ্যায়টি সাজানো হয়েছে।"
Logo URL: https://cdn-icons-png.flaticon.com/512/3771/3771278.png

Classes:
1. চক্রবৃদ্ধি সুদের মাস্টার গাইড ও সকল সূত্রাবলি
2. 2 বছরের চক্রবৃদ্ধি সুদ সংক্রান্ত গাণিতিক সমস্যা
3. 3 বছর ও ভিন্ন ভিন্ন সুদের হার সংক্রান্ত সমস্যা

Quizzes:
1. Quiz Set 01: প্রাথমিক ধারণা ও সহজ সমস্যা
2. Quiz Set 02: বার্ষিক চক্রবৃদ্ধি সুদের অংক

PDFs:
1. চক্রবৃদ্ধি সুদ: ক্লাস নোট ও সমাধান - Drive ID: 16MWVfQH7g3C7_8y7_uWjhWFySzqB_42z

Generate complete chapter-info.json now.
```

---

### STEP 2: Class Content তৈরি করুন (প্রতিটি class এর জন্য)

**AI কে এই command দিন:**

```
Create class[NUMBER].json file with this information:

Chapter Name: [বাংলা নাম (English Name)]
Class Number: [01, 02, 03, etc.]

Content:
[এখানে আপনার class এর পুরো content paste করুন - notes, formulas, examples, questions সব]

Use these content types appropriately:
- "title" for main headings
- "header" for sub-headings
- "text" for paragraphs
- "math" for mathematical equations
- "box" for important notes/formulas
- "list" for bullet points
- "question" for practice questions with explanations

Generate complete class[NUMBER].json now.
```

**Example:**
```
Create class1.json file with this information:

Chapter Name: চক্রবৃদ্ধি সুদ (Compound Interest)
Class Number: 01

Content:
চক্রবৃদ্ধি সুদ কী?
চক্রবৃদ্ধি সুদ হল এমন একটি পদ্ধতি যেখানে প্রতি নির্দিষ্ট সময় পর সুদকে মূলধনের সাথে যোগ করা হয়।

মূল সূত্র:
A = P(1 + r/100)^n
যেখানে:
A = সুদ-আসল
P = মূলধন
r = সুদের হার
n = সময়

গুরুত্বপূর্ণ নোট:
চক্রবৃদ্ধি সুদে প্রতি বছর সুদ বাড়তে থাকে কারণ সুদের উপরও সুদ যোগ হয়।

প্রশ্ন: 1000 টাকার 10% হারে 2 বছরের চক্রবৃদ্ধি সুদ কত?
সমাধান: A = 1000(1 + 10/100)^2 = 1000 × 1.21 = 1210 টাকা
সুদ = 1210 - 1000 = 210 টাকা

Generate complete class1.json now.
```

---

### STEP 3: Quiz Content তৈরি করুন (প্রতিটি quiz set এর জন্য)

**AI কে এই command দিন:**

```
Create Qset[NUMBER].json file with this information:

Chapter Name: [বাংলা নাম (English Name)]
Set Name: Quiz Set [NUMBER]: [topic name]

Questions:
[এখানে আপনার quiz questions paste করুন - প্রতিটি প্রশ্নের সাথে 4টি option এবং সঠিক উত্তর দিন]

IMPORTANT:
- correctAnswer must be 0 for first option, 1 for second, 2 for third, 3 for fourth
- Provide detailed explanation in Bengali for each answer
- Use HTML formatting for mathematical expressions

Generate complete Qset[NUMBER].json now.
```

**Example:**
```
Create Qset1.json file with this information:

Chapter Name: চক্রবৃদ্ধি সুদ (Compound Interest)
Set Name: Quiz Set 01: প্রাথমিক ধারণা ও সহজ সমস্যা

Questions:

1. এক ব্যক্তি 2 বছরে 8% চক্রবৃদ্ধি হারে 83.2 টাকা সুদ পেল। তার আসলের পরিমাণ কত টাকা?
A) 600
B) 503.2
C) 500 ✓
D) 540
ব্যাখ্যা: Rate = 8% = 2/25. Ratio Method (2 Years): P : A = 625 : 729. সুদ = 104 unit = 83.2 টাকা। আসল = 625 × 0.8 = 500 টাকা।

2. বার্ষিক 10% চক্রবৃদ্ধি সুদে 2 বছর পর সুদ-আসল ₹10,164 হয়, বিনিয়োগের পরিমাণ কত ছিল?
A) ₹8,300
B) ₹8,400 ✓
C) ₹8,200
D) ₹8,800
ব্যাখ্যা: P : A = 100 : 121 (2 years). 121 unit = 10164, তাই আসল = 100 × 84 = 8400 টাকা।

Generate complete Qset1.json now.
```

---

## 📁 File Structure Setup

### নতুন Chapter Folder তৈরি করুন:

```bash
subject/Math/YOUR_CHAPTER_NAME/
├── data/
│   ├── chapter-info.json
│   ├── class1.json
│   ├── class2.json
│   ├── Qset1.json
│   └── Qset2.json
├── class/
├── quiz/
├── css/
├── js/
└── index.html
```

### Files Copy করার Command:

**Terminal এ এই commands run করুন:**

```bash
# Replace YOUR_CHAPTER_NAME with your actual chapter folder name
cd "Study-With-Keshab/subject/Math"
cp -r Compound_Interest YOUR_CHAPTER_NAME
cd YOUR_CHAPTER_NAME/data
rm -f *.json
# এখন AI থেকে generated JSON files এখানে paste করুন
```

---

## 🎯 Quick Workflow (পুরো Process)

### 1. AI Setup করুন (একবার)
- Google Studio / ChatGPT খুলুন
- উপরের System Instruction paste করুন

### 2. Chapter Info তৈরি করুন
- STEP 1 এর command copy করুন
- আপনার chapter details fill করুন
- AI কে দিন
- Output JSON copy করে `data/chapter-info.json` এ save করুন

### 3. প্রতিটি Class Content তৈরি করুন
- STEP 2 এর command copy করুন
- Class content paste করুন
- AI কে দিন
- Output JSON copy করে `data/class1.json` এ save করুন
- সব class এর জন্য repeat করুন

### 4. প্রতিটি Quiz তৈরি করুন
- STEP 3 এর command copy করুন
- Quiz questions paste করুন
- AI কে দিন
- Output JSON copy করে `data/Qset1.json` এ save করুন
- সব quiz এর জন্য repeat করুন

### 5. Test করুন
- Browser এ chapter page খুলুন
- Console check করুন (F12)
- সব content ঠিকমতো load হচ্ছে কিনা verify করুন

---

## 📄 Google Drive PDF Setup

### PDF File ID নেওয়ার নিয়ম:

1. Google Drive এ PDF upload করুন
2. File এ right-click → "Share" → "Anyone with the link"
3. "Copy link" click করুন
4. Link format: `https://drive.google.com/file/d/FILE_ID_HERE/view`
5. `FILE_ID_HERE` অংশটি copy করুন

**Example:**
```
Full Link: https://drive.google.com/file/d/16MWVfQH7g3C7_8y7_uWjhWFySzqB_42z/view
File ID: 16MWVfQH7g3C7_8y7_uWjhWFySzqB_42z
```

---

## ✅ Final Checklist

- [ ] AI তে System Instruction দিয়েছেন
- [ ] Chapter folder তৈরি করেছেন
- [ ] `chapter-info.json` তৈরি করেছেন
- [ ] সব class JSON files তৈরি করেছেন
- [ ] সব quiz JSON files তৈরি করেছেন
- [ ] PDF files upload করে File ID নিয়েছেন
- [ ] Browser এ test করেছেন
- [ ] Console এ কোনো error নেই

---

## 🆘 Common Issues & Solutions

**Problem:** JSON syntax error
**Solution:** https://jsonlint.com/ এ paste করে validate করুন

**Problem:** Content দেখাচ্ছে না
**Solution:** Browser console (F12) check করুন, file path ঠিক আছে কিনা

**Problem:** Quiz এ সঠিক উত্তর highlight হচ্ছে না
**Solution:** correctAnswer value 0-based index কিনা check করুন (0, 1, 2, 3)

**Problem:** PDF খুলছে না
**Solution:** Google Drive file sharing "Anyone with the link" করুন

**Problem:** Dashboard এ data দেখাচ্ছে না
**Solution:** একবার quiz complete করুন, তারপর data show হবে

---

## 🎨 Content Types Reference

### Class Content Types:

```json
{"type": "title", "content": "Main Heading"}
{"type": "header", "content": "Sub Heading"}
{"type": "text", "content": "Paragraph text"}
{"type": "math", "content": "x² + y² = z²"}
{"type": "box", "content": "<strong>Important:</strong> Note"}
{"type": "list", "items": ["Item 1", "Item 2"]}
{"type": "question", "qText": "Question?", "explanation": "Answer"}
```

### Quiz HTML Formatting:

```html
<!-- Fraction -->
<span class='fraction'><span class='top'>2</span><span class='bottom'>25</span></span>

<!-- Symbols -->
&times; (multiplication)
&there4; (therefore)
&rarr; (arrow)
```

---

## 📞 Need Help?

1. Check console errors (F12)
2. Validate JSON syntax
3. Verify file paths
4. Check Firebase connection
5. Review this guide again

---

**Happy Teaching! 🎓 AI দিয়ে সহজে Content তৈরি করুন!**
