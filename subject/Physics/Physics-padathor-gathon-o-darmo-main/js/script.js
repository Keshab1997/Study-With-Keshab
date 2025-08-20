// Filename: js/script.js - Upgraded for Dynamic Quiz Count

document.addEventListener('DOMContentLoaded', () => {
    // Firebase Authentication Check
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            // ব্যবহারকারী লগইন করা থাকলে অ্যাপ শুরু হবে
            initApp(user);
        } else {
            // যদি ব্যবহারকারী লগইন করা না থাকে, তাহলে লগইন পেজে পাঠিয়ে দেওয়া হবে।
            window.location.href = 'https://keshab1997.github.io/Study-With-Keshab/login.html';
        }
    });
});

/**
 * Main function to initialize all functionalities.
 * @param {firebase.User} user - The authenticated user object.
 */
function initApp(user) {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        preloader.style.display = 'none';
    }

    const db = firebase.firestore();
    
    // অধ্যায়ের নাম HTML ফাইল থেকে dynamically লোড করা হচ্ছে
    if (typeof CURRENT_CHAPTER_NAME === 'undefined') {
        console.error("অধ্যায়ের নাম (CURRENT_CHAPTER_NAME) HTML ফাইলে সেট করা হয়নি।");
        alert("ত্রুটি: অধ্যায়ের নাম পাওয়া যায়নি।");
        return; // Stop execution if chapter name is missing
    }
    const chapterName = CURRENT_CHAPTER_NAME;
    const chapterKey = chapterName.replace(/\s+/g, '_').replace(/,/g, ''); // Firestore-এর জন্য নিরাপদ কী

    // --- UI সেটআপ এবং ডেটা লোড ---
    setupUserProfile(user);
    setupUIInteractions();
    
    // --- Firebase থেকে অধ্যায়-ভিত্তিক ডেটা লোড ---
    loadChapterLeaderboard(db, chapterKey); // অধ্যায়-ভিত্তিক লিডারবোর্ড
    loadDashboardData(db, user.uid, chapterKey); // অধ্যায়-ভিত্তিক ড্যাশবোর্ড
}

// ===============================================
// --- UI Setup Functions ---
// ===============================================

function setupUserProfile(user) {
    const displayNameElement = document.getElementById('user-display-name');
    const emailElement = document.getElementById('user-email');
    const profilePicElement = document.getElementById('user-profile-pic');

    if(displayNameElement) displayNameElement.textContent = user.displayName || 'ব্যবহারকারী';
    if(emailElement) emailElement.textContent = user.email;
    if(profilePicElement && user.photoURL) {
        profilePicElement.src = user.photoURL;
    }
}

function setupUIInteractions() {
    // Dark Mode Toggle
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.replace('day-mode', 'dark-mode');
        if (darkModeToggle) darkModeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
    }
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            document.body.classList.toggle('day-mode');
            
            if (document.body.classList.contains('dark-mode')) {
                darkModeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
                localStorage.setItem('theme', 'dark');
            } else {
                darkModeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
                localStorage.setItem('theme', 'day');
            }
            if(myPieChart) myPieChart.update();
        });
    }

    // Search Bar
    const searchBar = document.getElementById('search-bar');
    if (searchBar) {
        searchBar.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            document.querySelectorAll('main section.card').forEach(section => {
                const title = section.querySelector('h2')?.textContent.toLowerCase() || '';
                const content = section.textContent.toLowerCase();
                section.style.display = (title.includes(query) || content.includes(query)) ? '' : 'none';
            });
        });
    }

    // Formula Modal
    const modal = document.getElementById('formula-modal');
    const openBtn = document.getElementById('formula-sheet-btn');
    if (modal && openBtn) {
        const closeBtn = modal.querySelector('.modal-close-btn');
        openBtn.addEventListener('click', () => modal.classList.add('active'));
        if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.remove('active'));
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('active');
        });
    }
    
    // Back to Top button
    const backToTop = document.getElementById('back-to-top');
    if (backToTop) {
        window.addEventListener('scroll', () => {
            backToTop.style.display = (window.scrollY > 300) ? 'block' : 'none';
        });
    }

    // Leaderboard Dropdown Click Handler
    const leaderboardBody = document.getElementById('leaderboard-body');
    if (leaderboardBody) {
        leaderboardBody.addEventListener('click', function(event) {
            const button = event.target.closest('.toggle-details-btn');
            if (!button) return;

            const mainRow = button.closest('.leaderboard-row');
            const detailsRow = mainRow.nextElementSibling;
            const isVisible = detailsRow.style.display === 'table-row';

            // Close all other open details
            document.querySelectorAll('.details-row').forEach(row => {
                if (row !== detailsRow) {
                    row.style.display = 'none';
                    const prevBtnIcon = row.previousElementSibling.querySelector('.toggle-details-btn i');
                    if (prevBtnIcon) {
                        prevBtnIcon.classList.remove('fa-chevron-up');
                        prevBtnIcon.classList.add('fa-chevron-down');
                    }
                }
            });

            // Toggle the clicked one
            detailsRow.style.display = isVisible ? 'none' : 'table-row';
            const icon = button.querySelector('i');
            icon.classList.toggle('fa-chevron-up', !isVisible);
            icon.classList.toggle('fa-chevron-down', isVisible);
        });
    }
}

// ===============================================
// --- Firebase Data Loading Functions ---
// ===============================================

/**
 * Loads chapter-specific leaderboard data.
 * @param {firebase.firestore.Firestore} db
 * @param {string} chapterKey - The Firestore-safe key for the chapter.
 */
function loadChapterLeaderboard(db, chapterKey) {
    const leaderboardBody = document.getElementById('leaderboard-body');
    if (!leaderboardBody) return;

    leaderboardBody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 20px;">লিডারবোর্ড লোড হচ্ছে...</td></tr>';
    
    db.collection('users').orderBy(`chapters.${chapterKey}.totalScore`, 'desc').limit(10).get()
        .then(snapshot => {
            if (snapshot.empty) {
                leaderboardBody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 20px;">এই অধ্যায়ের জন্য কোনো স্কোর পাওয়া যায়নি।</td></tr>';
                return;
            }

            let leaderboardHTML = '';
            let rank = 1;
            let foundScores = false;

            snapshot.forEach(doc => {
                const userData = doc.data();
                const chapterData = userData.chapters?.[chapterKey];
                
                if (chapterData && chapterData.totalScore > 0) {
                    foundScores = true;
                    
                    let icon = '';
                    if (rank === 1) icon = '<i class="fa-solid fa-trophy" style="color: #ffd700;"></i> ';
                    else if (rank === 2) icon = '<i class="fa-solid fa-medal" style="color: #c0c0c0;"></i> ';
                    else if (rank === 3) icon = '<i class="fa-solid fa-medal" style="color: #cd7f32;"></i> ';
                    
                    let scoreDetailsHTML = '<li>কোনো বিস্তারিত স্কোর নেই।</li>';
                    if (chapterData.quiz_sets) {
                        const sortedSets = Object.entries(chapterData.quiz_sets)
                            .sort((a, b) => parseInt(a[0].replace('Set_', '')) - parseInt(b[0].replace('Set_', '')));

                        scoreDetailsHTML = sortedSets.map(([setName, setData]) => {
                            const cleanSetName = setName.replace('_', ' ');
                            return `<li><span class="label">${cleanSetName}:</span> ${setData.score}/${setData.totalQuestions}</li>`;
                        }).join('');
                    }

                    leaderboardHTML += `
                        <tr class="leaderboard-row">
                            <td>${icon}${rank}</td>
                            <td>${userData.displayName || 'Unknown User'}</td>
                            <td><strong>${chapterData.totalScore}</strong></td>
                            <td><button class="toggle-details-btn" aria-label="বিস্তারিত দেখুন"><i class="fas fa-chevron-down"></i></button></td>
                        </tr>
                        <tr class="details-row" style="display: none;">
                            <td colspan="4"><div class="details-content"><ul>${scoreDetailsHTML}</ul></div></td>
                        </tr>
                    `;
                    rank++;
                }
            });

            if (foundScores) {
                leaderboardBody.innerHTML = leaderboardHTML;
            } else {
                 leaderboardBody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 20px;">এই অধ্যায়ের জন্য কোনো স্কোর পাওয়া যায়নি।</td></tr>';
            }
        })
        .catch(error => {
            console.error("Error loading chapter leaderboard:", error);
            leaderboardBody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 20px;">ত্রুটি: লিডারবোর্ড লোড করা যায়নি।</td></tr>';
        });
}


/**
 * Loads all chapter-specific data for the user dashboard.
 * @param {firebase.firestore.Firestore} db
 * @param {string} userId - The current user's ID.
 * @param {string} chapterKey - The Firestore-safe key for the chapter.
 */
function loadDashboardData(db, userId, chapterKey) {
    // *** IMPROVEMENT: Dynamically count quizzes from the HTML ***
    // This makes the script reusable for any chapter without modification.
    const quizLinks = document.querySelectorAll('#quiz-sets .link-container a');
    const totalQuizzesInChapter = quizLinks.length;

    db.collection('users').doc(userId).get().then(doc => {
        let chapterData = {};
        if (doc.exists && doc.data().chapters && doc.data().chapters[chapterKey]) {
            chapterData = doc.data().chapters[chapterKey];
        }

        updateChapterProgress(chapterData.completedQuizzesCount || 0, totalQuizzesInChapter);
        updatePieChart(chapterData.totalCorrect || 0, chapterData.totalWrong || 0);
        updateUserAchievements(chapterData, totalQuizzesInChapter);
        loadDailyChallenge();

    }).catch(error => {
        console.error("Error loading user dashboard data:", error);
        // Fallback with correct total quiz count
        updateChapterProgress(0, totalQuizzesInChapter);
        updatePieChart(0, 0);
        updateUserAchievements({}, totalQuizzesInChapter);
        loadDailyChallenge();
    });
}

// ===============================================
// --- Dashboard Update Functions ---
// ===============================================

function updateChapterProgress(completed, total) {
    const progressBar = document.getElementById('chapter-progress-bar');
    const progressText = document.getElementById('chapter-progress-text');
    if (!progressBar || !progressText) return;
    
    // Handle case where total is 0 to avoid division by zero
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    progressBar.style.width = `${percentage}%`;
    progressText.textContent = `${percentage}% সম্পন্ন (${completed}/${total}টি কুইজ)`;
}

let myPieChart = null;
function updatePieChart(correct, wrong) {
    const ctx = document.getElementById('quiz-pie-chart')?.getContext('2d');
    if (!ctx) return;
    if (myPieChart) myPieChart.destroy();
    
    const isDarkMode = document.body.classList.contains('dark-mode');
    
    const chartData = (correct === 0 && wrong === 0) 
        ? { labels: ['এখনো কোনো কুইজ দেননি'], datasets: [{ data: [1], backgroundColor: ['#bdc3c7'] }] }
        : {
            labels: ['সঠিক উত্তর', 'ভুল উত্তর'],
            datasets: [{
                data: [correct, wrong],
                backgroundColor: ['#2ecc71', '#e74c3c'],
                borderColor: isDarkMode ? '#1e1e1e' : '#ffffff',
                borderWidth: 3
            }]
        };
        
    myPieChart = new Chart(ctx, {
        type: 'pie',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            legend: { 
                position: 'bottom', 
                labels: { 
                    fontColor: isDarkMode ? '#e0e0e0' : '#34495e', 
                    fontFamily: "'Hind Siliguri', sans-serif" 
                }
            },
            tooltips: { 
                titleFontFamily: "'Hind Siliguri', sans-serif", 
                bodyFontFamily: "'Hind Siliguri', sans-serif" 
            }
        }
    });
}

function updateUserAchievements(chapterData, totalQuizzes) {
    const achievementsContainer = document.getElementById('achievements-container');
    if (!achievementsContainer) return;

    // Do not show achievements if there are no quizzes in the chapter
    if (totalQuizzes === 0) {
        achievementsContainer.innerHTML = '<p>এই অধ্যায়ে কোনো অ্যাচিভমেন্ট নেই।</p>';
        return;
    }

    const completedCount = chapterData.completedQuizzesCount || 0;
    const achievementConfig = [
        { id: 'first_quiz', title: 'প্রথম পদক্ষেপ', icon: 'fa-shoe-prints', criteria: count => count >= 1, desc: "এই অধ্যায়ের প্রথম কুইজ সম্পন্ন করেছেন!" },
        { id: 'quiz_master', title: 'কুইজ মাস্টার', icon: 'fa-brain', criteria: count => count >= Math.ceil(totalQuizzes / 2), desc: `এই অধ্যায়ের অর্ধেক (${Math.ceil(totalQuizzes / 2)}টি) কুইজ সম্পন্ন করেছেন!` },
        { id: 'chapter_winner', title: 'অধ্যায় বিজয়ী', icon: 'fa-crown', criteria: count => count >= totalQuizzes, desc: "এই অধ্যায়ের সব কুইজ সম্পন্ন করেছেন!" }
    ];

    achievementsContainer.innerHTML = '';
    achievementConfig.forEach(ach => {
        const unlocked = ach.criteria(completedCount);
        const badge = document.createElement('div');
        badge.className = `achievement-badge ${unlocked ? 'unlocked' : ''}`;
        badge.title = unlocked ? `${ach.title} - ${ach.desc}` : `${ach.title} (লকড)`;
        badge.innerHTML = `<i class="fa-solid ${ach.icon}"></i><span>${ach.title}</span>`;
        achievementsContainer.appendChild(badge);
    });
}

function loadDailyChallenge() {
    const challengeText = document.getElementById('challenge-text');
    if (!challengeText) return;
    const challenges = [
        "আজকে কমপক্ষে ২টি কুইজ সেট সমাধান করো।",
        "সূত্র তালিকাটি সম্পূর্ণ মুখস্থ করে ফেলো।",
        "যেকোনো একটি ক্লাস নোট সম্পূর্ণ রিভিশন দাও।",
        "একটি কঠিন প্রশ্নের ব্যাখ্যা ভালো করে বুঝে নাও।"
    ];
    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    challengeText.textContent = challenges[dayOfYear % challenges.length];
}