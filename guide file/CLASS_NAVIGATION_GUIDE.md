# Class Navigation Auto-Generator Guide

## 🎯 কী করা হয়েছে?

একটি JavaScript তৈরি করা হয়েছে যা **automatically** class navigation buttons তৈরি করবে। এখন আর প্রতিটা class HTML এ hardcode করে navigation লিখতে হবে না!

---

## ✅ Setup (একবার করলেই হবে)

### 1. JavaScript File যোগ করো

প্রতিটি class HTML এর শেষে (closing `</body>` tag এর আগে) এই line যোগ করো:

```html
<!-- External JavaScript File Link -->
<script src="js/script.js"></script>
<!-- Class Navigation Auto-Generator -->
<script src="js/class-navigation.js"></script>
```

### 2. Total Class সংখ্যা সেট করো

`js/class-navigation.js` ফাইলে শুধু একটা জিনিস পরিবর্তন করো:

```javascript
const TOTAL_CLASSES = 8; // কতগুলো class আছে তা লিখো
```

**উদাহরণ:**
- যদি 5টি class থাকে → `const TOTAL_CLASSES = 5;`
- যদি 10টি class থাকে → `const TOTAL_CLASSES = 10;`

---

## 🎨 কেমন দেখাবে?

Navigation টা এরকম দেখাবে:

```
┌─────────────────────────────────────────────────┐
│         📚 Class Navigation                     │
│                                                 │
│  [Class 1✓] [Class 2] [Class 3] ... [Class 8]  │
│                                                 │
│  [← পূর্ববর্তী Class] [🏠 Home] [পরবর্তী Class →] │
└─────────────────────────────────────────────────┘
```

**Features:**
- ✅ বর্তমান class টা highlight থাকবে (সাদা background + ✓ mark)
- ✅ Gradient purple background
- ✅ Hover effects
- ✅ Responsive (mobile এ ছোট হবে)
- ✅ Dark mode support
- ✅ Content এর শুরুতে এবং শেষে দুটো navigation

---

## 📝 নতুন Chapter এর জন্য কী করতে হবে?

### Step 1: Folder Structure তৈরি করো

```
subject/Math/[New-Chapter]/
├── class/
│   ├── js/
│   │   ├── script.js
│   │   └── class-navigation.js  ← এই ফাইল কপি করো
│   ├── css/
│   │   └── style.css
│   ├── class1.html
│   ├── class2.html
│   └── ...
```

### Step 2: class-navigation.js কপি করো

Ratio&Proportion থেকে `class-navigation.js` ফাইল কপি করে নতুন chapter এ paste করো।

### Step 3: Total Class সংখ্যা পরিবর্তন করো

```javascript
const TOTAL_CLASSES = 6; // নতুন chapter এ যতগুলো class আছে
```

### Step 4: HTML এ script যোগ করো

প্রতিটি class HTML এ:

```html
<script src="js/script.js"></script>
<script src="js/class-navigation.js"></script>
```

**ব্যস! হয়ে গেছে!** 🎉

---

## 🔧 Customization

### রঙ পরিবর্তন করতে চাইলে:

`class-navigation.js` ফাইলে এই লাইনগুলো খুঁজে বের করো:

```javascript
// Gradient background
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

// Active button color
background: white; color: #667eea;

// Home button color
background: #FFD700; color: #333;
```

এগুলো পরিবর্তন করে তোমার পছন্দের রঙ দাও।

---

## 🚨 Common Issues & Solutions

### ❌ Problem 1: Navigation দেখাচ্ছে না

**Solution:**
- Check করো `class-navigation.js` file টা সঠিক path এ আছে কিনা
- Browser console খুলে error আছে কিনা দেখো (F12 চাপো)
- নিশ্চিত করো HTML এ `<div class="container">` আছে

### ❌ Problem 2: Wrong class highlighted

**Solution:**
- File name সঠিক আছে কিনা দেখো: `class1.html`, `class2.html` (lowercase)
- Number টা ঠিক আছে কিনা check করো

### ❌ Problem 3: Navigation দুবার দেখাচ্ছে

**Solution:**
- HTML থেকে পুরনো hardcoded navigation remove করো
- শুধু script tag রাখো

---

## 💡 Pro Tips

1. **একবার setup করলে সব class এ কাজ করবে** - প্রতিটা class HTML এ আলাদা করে navigation লিখতে হবে না

2. **নতুন class যোগ করতে চাইলে:**
   - শুধু `TOTAL_CLASSES` সংখ্যা বাড়াও
   - নতুন `classX.html` file তৈরি করো
   - Automatically navigation এ দেখাবে!

3. **Mobile responsive** - ছোট screen এ button size automatically কমে যাবে

4. **Dark mode support** - Dark mode on করলে navigation এর রঙ automatically পরিবর্তন হবে

---

## 📊 Benefits

### আগে (Hardcoded):
```html
<!-- প্রতিটা class HTML এ আলাদা করে লিখতে হতো -->
<nav class="navigation">
    <a href="#" class="nav-button disabled">পূর্ববর্তী</a>
    <a href="class1.html" class="nav-button active">1</a>
    <a href="class2.html" class="nav-button">2</a>
    <a href="class3.html" class="nav-button">3</a>
    <!-- ... 8 বার লিখতে হতো -->
</nav>
```

### এখন (Auto-generated):
```html
<!-- শুধু একটা script tag -->
<script src="js/class-navigation.js"></script>
```

**সুবিধা:**
- ✅ কম code লিখতে হয়
- ✅ Error কম হয়
- ✅ নতুন class যোগ করা সহজ
- ✅ সব class এ একই design
- ✅ পরিবর্তন করতে চাইলে একটা file এ করলেই হয়

---

## 🎓 Example

যদি তোমার **Percentage** chapter এ **5টি class** থাকে:

1. `class-navigation.js` কপি করো
2. `TOTAL_CLASSES = 5` লিখো
3. প্রতিটা class HTML এ script tag যোগ করো
4. Done! ✅

Navigation automatically তৈরি হবে:
- Class 1, 2, 3, 4, 5 buttons
- Previous/Next buttons (যেখানে দরকার)
- Home button

---

## 🌟 Summary

**একটা মাত্র configuration:**
```javascript
const TOTAL_CLASSES = 8;
```

**একটা মাত্র script tag:**
```html
<script src="js/class-navigation.js"></script>
```

**Result:** Beautiful, automatic, responsive class navigation! 🚀
