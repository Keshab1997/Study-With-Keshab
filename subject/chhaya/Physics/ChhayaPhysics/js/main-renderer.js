document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('data/chapter-info.json');
        if (!response.ok) throw new Error("JSON file not found");
        
        const data = await response.json();

        // Update page title
        document.getElementById('dynamic-title').innerText = `${data.chapterName} | Study With Keshab`;

        // ১. ব্যানার ইনজেকশন
        const bannerPlaceholder = document.getElementById('chapter-banner-placeholder');
        if (bannerPlaceholder) {
            bannerPlaceholder.innerHTML = `
                <div class="chapter-banner">
                    <h1>📐 ${data.chapterName}</h1>
                    <p>${data.description}</p>
                </div>
            `;
        }

        // ২. ক্লাস লিস্ট রেন্ডার
        const classContainer = document.getElementById('class-list-container');
        if (classContainer) {
            classContainer.innerHTML = data.classes.map((cls, index) => `
                <a href="class/class.html?id=${cls.id}" style="animation: fadeInUp 0.4s ease forwards ${index * 0.1}s; opacity: 0;">
                    <i class="fa-solid fa-chalkboard-user"></i>
                    <span>Class ${cls.id}: ${cls.title}</span>
                    <i class="fa-solid fa-chevron-right" style="margin-left: auto; font-size: 0.8rem; opacity: 0.3;"></i>
                </a>
            `).join('');
        }

        // ৩. কুইজ লিস্ট রেন্ডার
        const quizContainer = document.getElementById('quiz-list-container');
        if (quizContainer) {
            quizContainer.innerHTML = data.quizzes.map((quiz, index) => `
                <a href="quiz/quiz.html?set=${quiz.set}" style="animation: fadeInUp 0.4s ease forwards ${index * 0.1}s; opacity: 0;">
                    <i class="fa-solid fa-vial-circle-check"></i>
                    <span>${quiz.title}</span>
                    <i class="fa-solid fa-chevron-right" style="margin-left: auto; font-size: 0.8rem; opacity: 0.3;"></i>
                </a>
            `).join('');
        }

        // ৪. পিডিএফ লিস্ট রেন্ডার
        const pdfContainer = document.getElementById('pdf-grid-container');
        if (pdfContainer && data.pdfs) {
            pdfContainer.innerHTML = data.pdfs.map((pdf, index) => `
                <div class="pdf-card" style="animation: fadeInUp 0.4s ease forwards ${index * 0.1}s; opacity: 0;">
                    <i class="fa-solid fa-file-pdf"></i>
                    <h3>${pdf.title}</h3>
                    <button onclick="openPdfByDriveId('${pdf.driveID}', '${pdf.title}')" class="pdf-btn">দেখুন</button>
                </div>
            `).join('');
        }

        // ৪. ড্যাশবোর্ড ডাটা লোড
        loadDashboardData(data.chapterID);
        
        // ৫. লিডারবোর্ড লোড
        loadLeaderboard(data.chapterID);

        // লোডিং ক্লাস রিমুভ (গুরুত্বপূর্ণ)
        document.body.classList.remove("auth-loading");

    } catch (error) {
        console.error("Error:", error);
        document.body.classList.remove("auth-loading");
    }
});

async function loadDashboardData(chapterID) {
    console.log('🔍 Loading dashboard data for chapter:', chapterID);
    
    firebase.auth().onAuthStateChanged(async (user) => {
        if (user) {
            console.log('✅ User logged in:', user.uid);
            const db = firebase.firestore();
            const doc = await db.collection('users').doc(user.uid).get();
            
            if (doc.exists) {
                const userData = doc.data();
                console.log('📊 User data:', userData);
                console.log('📂 All chapters:', userData.chapters);
                
                // সাধারণ বিজ্ঞান (পদার্থবিদ্যা) থেকে পদার্থবিদ্যা extract করা
                const chapterKey = 'পদার্থবিদ্যা';
                
                console.log('🔑 Looking for key:', chapterKey);
                
                let chapterData = userData.chapters?.[chapterKey];
                console.log('📈 Chapter data:', chapterData);
                
                if (chapterData) {
                    const totalQuizzes = chapterData.completedQuizzesCount || 0;
                    const totalScore = chapterData.totalScore || 0;
                    const totalCorrect = chapterData.totalCorrect || 0;
                    const totalWrong = chapterData.totalWrong || 0;
                    const totalQuestions = totalCorrect + totalWrong;
                    const avg = totalQuestions > 0 ? ((totalCorrect / totalQuestions) * 100).toFixed(1) : 0;
                    
                    console.log('✨ Stats - Quizzes:', totalQuizzes, 'Score:', totalScore, 'Avg:', avg + '%');
                    
                    document.getElementById('total-quizzes').innerText = totalQuizzes;
                    document.getElementById('total-score').innerText = totalScore;
                    document.getElementById('average-score').innerText = avg + '%';
                    
                    // Progress bar update
                    const totalQuizzesInChapter = 11; // chapter-info.json এ 11টি quiz আছে
                    const progressPercent = totalQuizzes > 0 ? Math.min((totalQuizzes / totalQuizzesInChapter) * 100, 100) : 0;
                    document.getElementById('chapter-progress-bar').style.width = progressPercent + '%';
                    document.getElementById('chapter-progress-text').innerText = Math.round(progressPercent) + '% সম্পন্ন';
                    
                    // Chart update
                    const correctAnswers = chapterData.totalCorrect || 0;
                    const wrongAnswers = chapterData.totalWrong || 0;
                    
                    if (correctAnswers > 0 || wrongAnswers > 0) {
                        const ctx = document.getElementById('quiz-pie-chart');
                        if (ctx) {
                            new Chart(ctx, {
                                type: 'doughnut',
                                data: {
                                    labels: ['সঠিক', 'ভুল'],
                                    datasets: [{
                                        data: [correctAnswers, wrongAnswers],
                                        backgroundColor: ['#4ade80', '#f87171'],
                                        borderWidth: 0
                                    }]
                                },
                                options: {
                                    responsive: true,
                                    maintainAspectRatio: true,
                                    legend: { display: true, position: 'bottom' }
                                }
                            });
                        }
                    }
                } else {
                    console.warn('⚠️ No chapter data found. Available keys:', Object.keys(userData.chapters || {}));
                    // Default values দেখানো
                    document.getElementById('total-quizzes').innerText = '0';
                    document.getElementById('total-score').innerText = '0';
                    document.getElementById('average-score').innerText = '0%';
                }
            } else {
                console.error('❌ User document does not exist');
            }
        } else {
            console.warn('⚠️ User not logged in');
        }
    });
}


async function loadLeaderboard(chapterID) {
    console.log('🏆 Loading leaderboard for:', chapterID);
    
    firebase.auth().onAuthStateChanged(async (user) => {
        if (user) {
            const db = firebase.firestore();
            
            try {
                // Get all users with this chapter data
                const usersSnapshot = await db.collection('users').get();
                const leaderboardData = [];
                
                const chapterKey = 'পদার্থবিদ্যা';
                
                usersSnapshot.forEach(doc => {
                    const userData = doc.data();
                    const chapterData = userData.chapters?.[chapterKey];
                    
                    if (chapterData && chapterData.totalScore > 0) {
                        leaderboardData.push({
                            name: userData.name || userData.displayName || 'Unknown',
                            score: chapterData.totalScore || 0,
                            totalQuestions: Object.keys(chapterData.quiz_sets || {}).reduce((sum, key) => {
                                return sum + (chapterData.quiz_sets[key].totalQuestions || 0);
                            }, 0),
                            quizzes: chapterData.completedQuizzesCount || 0
                        });
                    }
                });
                
                // Sort by score descending
                leaderboardData.sort((a, b) => b.score - a.score);
                
                // Display top 10
                const leaderboardBody = document.getElementById('leaderboard-body');
                if (leaderboardData.length > 0) {
                    leaderboardBody.innerHTML = leaderboardData.slice(0, 10).map((user, index) => {
                        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
                        return `
                            <tr>
                                <td style="font-size: 1.2rem;"><strong>${medal} ${index + 1}</strong></td>
                                <td style="text-align: left; padding-left: 20px; font-size: 1.15rem;"><strong>${user.name}</strong></td>
                                <td style="font-size: 1.2rem;"><strong>${user.score}/${user.totalQuestions}</strong></td>
                            </tr>
                        `;
                    }).join('');
                    console.log('✅ Leaderboard loaded:', leaderboardData.length, 'users');
                } else {
                    leaderboardBody.innerHTML = '<tr><td colspan="3" style="text-align:center;">এখনও কোনো ডাটা নেই</td></tr>';
                    console.log('⚠️ No leaderboard data found');
                }
            } catch (error) {
                console.error('❌ Leaderboard load error:', error);
            }
        }
    });
}
