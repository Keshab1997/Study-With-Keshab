// Dashboard Enhanced Features JavaScript
// এই code টি আপনার main JS file এ যোগ করুন

// Motivational Quotes Array
const motivationalQuotes = [
    { text: "সফলতা হলো ছোট ছোট প্রচেষ্টার সমষ্টি, যা প্রতিদিন পুনরাবৃত্তি হয়।", author: "রবার্ট কলিয়ার" },
    { text: "শিক্ষাই হলো সবচেয়ে শক্তিশালী অস্ত্র যা দিয়ে বিশ্বকে পরিবর্তন করা যায়।", author: "নেলসন ম্যান্ডেলা" },
    { text: "প্রতিটি বিশেষজ্ঞ একসময় শিক্ষানবিস ছিলেন।", author: "হেলেন হেইস" },
    { text: "ব্যর্থতা হলো সাফল্যের প্রথম ধাপ।", author: "এ পি জে আবদুল কালাম" },
    { text: "পড়াশোনা করো না পরীক্ষার জন্য, পড়াশোনা করো জ্ঞানের জন্য।", author: "লাও জু" }
];

// Function to load dashboard enhanced features
function loadDashboardFeatures(chapterName) {
    const user = firebase.auth().currentUser;
    if (!user) return;

    const db = firebase.firestore();
    const userDocRef = db.collection('users').doc(user.uid);

    userDocRef.get().then((doc) => {
        if (!doc.exists) return;

        const userData = doc.data();
        const chapterKey = chapterName.replace(/\s/g, '_');
        const chapterData = userData.chapters?.[chapterKey] || {};

        // 1. Quick Stats Cards
        const totalQuizzes = chapterData.completedQuizzesCount || 0;
        const totalScore = chapterData.totalScore || 0;
        const averageScore = totalQuizzes > 0 ? (totalScore / totalQuizzes).toFixed(1) : 0;

        document.getElementById('total-quizzes').textContent = totalQuizzes;
        document.getElementById('total-score').textContent = totalScore;
        document.getElementById('average-score').textContent = averageScore;

        // 2. Study Streak
        calculateStudyStreak(chapterData);

        // 3. Weekly Activity Chart
        loadWeeklyActivity(chapterData);

        // 4. Recent Activity
        loadRecentActivity(chapterData);

        // 5. Study Time Tracker
        calculateStudyTime(chapterData);

        // 6. Rank Badge
        calculateChapterRank(chapterName, totalScore);

        // 7. Motivational Quote
        displayDailyQuote();

        // 8. Target Progress
        calculateTargetProgress(totalQuizzes);
    });
}

// Calculate Study Streak
function calculateStudyStreak(chapterData) {
    const quizSets = chapterData.quiz_sets || {};
    const dates = Object.values(quizSets)
        .map(set => set.attemptedAt?.toDate())
        .filter(date => date)
        .sort((a, b) => b - a);

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (let date of dates) {
        date.setHours(0, 0, 0, 0);
        const diffDays = Math.floor((currentDate - date) / (1000 * 60 * 60 * 24));
        
        if (diffDays === streak) {
            streak++;
        } else if (diffDays > streak) {
            break;
        }
    }

    document.getElementById('streak-days').textContent = `${streak} দিন`;
}

// Load Weekly Activity
function loadWeeklyActivity(chapterData) {
    const quizSets = chapterData.quiz_sets || {};
    const weekActivity = { sun: 0, mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0 };
    const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

    Object.values(quizSets).forEach(set => {
        if (set.attemptedAt) {
            const date = set.attemptedAt.toDate();
            const dayIndex = date.getDay();
            weekActivity[dayNames[dayIndex]]++;
        }
    });

    const maxActivity = Math.max(...Object.values(weekActivity), 1);

    Object.keys(weekActivity).forEach(day => {
        const bar = document.querySelector(`.bar[data-day="${day}"]`);
        if (bar) {
            const height = (weekActivity[day] / maxActivity) * 100;
            bar.style.height = `${height}%`;
            bar.title = `${weekActivity[day]} কুইজ`;
        }
    });
}

// Load Recent Activity
function loadRecentActivity(chapterData) {
    const quizSets = chapterData.quiz_sets || {};
    const activities = Object.entries(quizSets)
        .map(([name, data]) => ({
            name: name.replace(/_/g, ' '),
            score: data.score,
            total: data.totalQuestions,
            date: data.attemptedAt?.toDate()
        }))
        .filter(a => a.date)
        .sort((a, b) => b.date - a.date)
        .slice(0, 3);

    const activityList = document.getElementById('recent-activity');
    
    if (activities.length === 0) {
        activityList.innerHTML = `
            <li class="activity-item">
                <div class="activity-icon"><i class="fas fa-clock"></i></div>
                <div class="activity-details">
                    <h4>কোনো কার্যকলাপ নেই</h4>
                    <p>এখনও কোনো কুইজ দেওয়া হয়নি</p>
                </div>
            </li>
        `;
        return;
    }

    activityList.innerHTML = activities.map(activity => `
        <li class="activity-item">
            <div class="activity-icon"><i class="fas fa-check-circle"></i></div>
            <div class="activity-details">
                <h4>${activity.name}</h4>
                <p>স্কোর: ${activity.score}/${activity.total} • ${formatDate(activity.date)}</p>
            </div>
        </li>
    `).join('');
}

// Calculate Study Time
function calculateStudyTime(chapterData) {
    const quizSets = chapterData.quiz_sets || {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let todayQuizzes = 0;
    Object.values(quizSets).forEach(set => {
        if (set.attemptedAt) {
            const quizDate = set.attemptedAt.toDate();
            quizDate.setHours(0, 0, 0, 0);
            if (quizDate.getTime() === today.getTime()) {
                todayQuizzes++;
            }
        }
    });

    const estimatedMinutes = todayQuizzes * 15; // Assuming 15 min per quiz
    document.getElementById('study-time').textContent = `${estimatedMinutes} মিনিট`;
}

// Calculate Chapter Rank
function calculateChapterRank(chapterName, userScore) {
    const db = firebase.firestore();
    const chapterKey = chapterName.replace(/\s/g, '_');

    db.collection('users').get().then(snapshot => {
        const scores = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            const score = data.chapters?.[chapterKey]?.totalScore || 0;
            if (score > 0) {
                scores.push(score);
            }
        });

        scores.sort((a, b) => b - a);
        const rank = scores.indexOf(userScore) + 1;
        
        document.getElementById('chapter-rank').textContent = rank > 0 ? `#${rank}` : '#-';
    });
}

// Display Daily Quote
function displayDailyQuote() {
    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    const quote = motivationalQuotes[dayOfYear % motivationalQuotes.length];
    
    document.getElementById('daily-quote').textContent = `"${quote.text}"`;
    document.querySelector('.quote-author').textContent = `- ${quote.author}`;
}

// Calculate Target Progress
function calculateTargetProgress(completedQuizzes) {
    const monthlyTarget = 10; // Set monthly target
    const percentage = Math.min((completedQuizzes / monthlyTarget) * 100, 100);

    document.getElementById('target-percentage').textContent = `${percentage.toFixed(0)}%`;
    document.getElementById('target-fill').style.width = `${percentage}%`;
    document.getElementById('completed-target').textContent = completedQuizzes;
    document.getElementById('total-target').textContent = monthlyTarget;
}

// Helper function to format date
function formatDate(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} মিনিট আগে`;
    if (diffHours < 24) return `${diffHours} ঘণ্টা আগে`;
    if (diffDays < 7) return `${diffDays} দিন আগে`;
    return date.toLocaleDateString('bn-BD');
}

// Call this function when page loads
// loadDashboardFeatures('Ratio-Proportion'); // Replace with your chapter name


// Load Dashboard Features when page loads
document.addEventListener('DOMContentLoaded', function() {
    firebase.auth().onAuthStateChanged((user) => {
        if (user && typeof loadDashboardFeatures === 'function') {
            loadDashboardFeatures('Ratio-Proportion');
        }
    });
});
