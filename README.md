# 📚 Study With Keshab

> বাংলায় সেরা অনলাইন শিক্ষা প্ল্যাটফর্ম — Physics, Chemistry, Math, Biology, Reasoning, GK সহ সকল বিষয়ে ইন্টারেক্টিভ কুইজ, নোট, CBT পরীক্ষা এবং AI শিক্ষক।

![License](https://img.shields.io/badge/license-MIT-green)
![Platform](https://img.shields.io/badge/platform-Web%20%2F%20PWA-blue)
![Language](https://img.shields.io/badge/language-Bengali%20%2B%20English-red)

---

## 🎯 Features

### 🏠 Home & Learning
- **Interactive Hero Section** — beautifully animated landing page
- **Subject-wise Content** — Physics, Chemistry, Math, Biology, Reasoning, GK
- **CBT Exam System** — Computer Based Test with timer, navigation & result analysis
- **AI Notebook** — smart note taking with markdown support
- **AI Teacher Widget** — instant doubt clearing & explanations
- **Smart Routine** — personalized study schedule with reminders

### 🔐 Authentication
- Email / Password sign-up & login
- Google Sign-In (OAuth 2.0)
- Role-based access: `student`, `admin`
- Persistent sessions with Firebase Auth

### 📊 Dashboard
- **Leaderboard** — quiz score rankings
- **Exam History** — detailed result tracking
- **Profile Management** — avatar, name, progress

### 🔔 Notifications
- Realtime notifications via Supabase
- Class notes, reminders & announcements
- PWA push notification support

### 📱 PWA Features
- Install as desktop / mobile app
- Offline-ready with Service Worker
- App shortcuts & splash screen

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | HTML5, CSS3, JavaScript (ES6+) |
| **Styling** | Custom CSS, Font Awesome 6, Google Fonts |
| **Backend / Auth** | Firebase (v8.10.0) — Auth, Firestore, Messaging |
| **Database / Realtime** | Supabase — notifications feed |
| **Hosting** | Vercel |
| **PWA** | Service Worker, Web App Manifest |

---

## 📁 Project Structure

```
Study-With-Keshab/
├── index.html                  # Home page
├── login.html / signup.html    # Authentication pages
├── admin.html                  # Admin dashboard
├── profile.html                # User profile
├── ai-teacher.html             # AI Teacher module
├── ai-notebook.html            # AI Notebook module
├── cbt-exam/                   # CBT exam module
│   └── index.html
├── subject/                    # Subject-wise chapters & quizzes
│   ├── Physics/
│   ├── Chemistry/
│   ├── Math/
│   ├── Biology/
│   ├── chhaya/                 # Chhaya Prakashani content
│   └── Gk.html
├── js/
│   ├── firebase-config.js      # ⚡ Single source of Firebase config
│   ├── auth.js                 # Auth logic
│   ├── navigation.js           # Nav & mobile menu
│   ├── toast.js                # Toast notifications
│   └── ...
├── css/
│   ├── style.css
│   ├── navigation.css
│   ├── cbt-styles.css
│   └── ...
├── firebase-messaging-sw.js    # FCM background handler
├── firestore.rules             # Firestore security rules
├── storage.rules               # Storage security rules
├── sw.js                       # PWA service worker
├── manifest.json               # PWA manifest
├── .firebaserc                 # Firebase project config
├── firebase.json               # Firebase hosting config
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- Firebase account
- Supabase account (for notifications)
- Vercel CLI (optional, for deployment)

### 1. Clone the Repository
```bash
git clone https://github.com/Keshab1997/Study-With-Keshab.git
cd Study-With-Keshab
```

### 2. Firebase Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or import existing `study-with-keshab`)
3. Enable **Authentication** → Email/Password + Google
4. Create **Firestore Database** in test mode
5. Copy your Firebase config:
   - Go to **Project Settings → General → Your apps → Web app**
   - Copy `apiKey`, `authDomain`, `projectId`, etc.
6. Update `js/firebase-config.js` with your credentials

### 3. Firestore Rules
Deploy security rules from `firestore.rules`:
```bash
firebase deploy --only firestore:rules
```

### 4. Supabase Setup (Notifications)
1. Create a Supabase project
2. Create a `notifications` table or use the Edge Function
3. Update Supabase URL & anon key in notification scripts

### 5. Run Locally
Open `index.html` via Live Server / VS Code Live Preview.  
Or use the bundled server:
```bash
npm start
```

---

## 🔧 Configuration

### Firebase Config (`js/firebase-config.js`)
Single source of truth for all Firebase credentials. All pages load this file.

### Supabase Keep-Alive (GitHub Actions)
A scheduled workflow (`.github/workflows/keep-supabase-alive.yml`) pings Supabase REST API daily to prevent project pause on free tier.

### Environment Variables (GitHub Secrets)
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

---

## 📦 Key Scripts

```bash
npm start   # Start local server
npm run convert   # Convert markdown content to JSON
```

---

## 🌐 Deployment

### Vercel
1. Push code to GitHub
2. Import repo in [Vercel](https://vercel.com/)
3. Deploy — no build step required (static site)

**Important:** After deployment, add your Vercel domain to Firebase Console:
- **Authentication → Settings → Authorized domains**
- Add: `your-project.vercel.app`

---

## 🛡️ Security Rules

### Firestore (`firestore.rules`)
- Users can read/update their own profile
- Quiz scores are read-only for authenticated users
- Only admins can write `class_notes`, `chapters`, `notificationQueue`
- Feedbacks & exam results are user-scoped

### Storage (`storage.rules`)
Check `storage.rules` for file upload permissions (profile pics, notes, etc.)

---

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repo
2. Create a feature branch
3. Commit your changes
4. Open a Pull Request

---

## 📄 License

MIT License — feel free to use this project for learning and building.

---

## 👨‍💻 Developed By

**Study With Keshab**  
🌐 [study-with-keshab.vercel.app](https://study-with-keshab.vercel.app)

---

## 🙏 Acknowledgments

- Firebase & Supabase communities
- Font Awesome for icons
- Google Fonts (Baloo Da 2, Poppins, Hind Siliguri)
