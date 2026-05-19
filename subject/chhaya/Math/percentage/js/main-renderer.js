document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('data/chapter-info.json?v=' + Date.now());
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
            if (data.quizzes && data.quizzes.length > 0) {
                quizContainer.innerHTML = data.quizzes.map((quiz, index) => `
                    <a href="quiz/quiz.html?set=${quiz.set}" style="animation: fadeInUp 0.4s ease forwards ${index * 0.1}s; opacity: 0;">
                        <i class="fa-solid fa-vial-circle-check"></i>
                        <span>${quiz.title}</span>
                        <i class="fa-solid fa-chevron-right" style="margin-left: auto; font-size: 0.8rem; opacity: 0.3;"></i>
                    </a>
                `).join('');
            } else {
                quizContainer.innerHTML = '<p style="color:#888;text-align:center;">এই অধ্যায়ে এখনও কোনো কুইজ যোগ করা হয়নি।</p>';
            }
        }

        // ৪. পিডিএফ লিস্ট রেন্ডার
        const pdfContainer = document.getElementById('pdf-grid-container');
        if (pdfContainer) {
            if (data.pdfs && data.pdfs.length > 0) {
                pdfContainer.innerHTML = data.pdfs.map((pdf, index) => `
                    <div class="pdf-card" style="animation: fadeInUp 0.4s ease forwards ${index * 0.1}s; opacity: 0;">
                        <i class="fa-solid fa-file-pdf"></i>
                        <h3>${pdf.title}</h3>
                        <button onclick="openPdfByDriveId('${pdf.driveID}', '${pdf.title}')" class="pdf-btn">দেখুন</button>
                    </div>
                `).join('');
            } else {
                pdfContainer.innerHTML = '<p style="color:#888;text-align:center;width:100%;">এই অধ্যায়ে এখনও কোনো PDF যোগ করা হয়নি।</p>';
            }
        }

        // ৪. ড্যাশবোর্ড ডাটা লোড
        loadDashboardData(data.chapterID, (data.quizzes || []).length);
        
        // ৫. লিডারবোর্ড লোড
        loadLeaderboard(data.chapterID);

        // লোডিং ক্লাস রিমুভ (গুরুত্বপূর্ণ)
        document.body.classList.remove("auth-loading");

    } catch (error) {
        console.error("Error:", error);
        document.body.classList.remove("auth-loading");
    }
});

async function loadDashboardData(chapterID, totalQuizzesInChapter) {
    firebase.auth().onAuthStateChanged(async (user) => {
        if (user) {
            const db = firebase.firestore();
            const doc = await db.collection('users').doc(user.uid).get();
            
            if (doc.exists) {
                const userData = doc.data();
                const chapterData = userData.chapters?.[chapterID];
                
                if (chapterData) {
                    const totalQuizzes = chapterData.completedQuizzesCount || 0;
                    const totalScore   = chapterData.totalScore || 0;
                    const totalCorrect = chapterData.totalCorrect || 0;
                    const totalWrong   = chapterData.totalWrong || 0;
                    const totalQ       = totalCorrect + totalWrong;
                    const avg = totalQ > 0 ? ((totalCorrect / totalQ) * 100).toFixed(1) : 0;
                    
                    document.getElementById('total-quizzes').innerText = totalQuizzes;
                    document.getElementById('total-score').innerText   = totalScore;
                    document.getElementById('average-score').innerText = avg + '%';
                    
                    const progressPercent = totalQuizzesInChapter > 0
                        ? Math.min((totalQuizzes / totalQuizzesInChapter) * 100, 100) : 0;
                    document.getElementById('chapter-progress-bar').style.width = progressPercent + '%';
                    document.getElementById('chapter-progress-text').innerText   = Math.round(progressPercent) + '% সম্পন্ন';
                    
                    if (totalCorrect > 0 || totalWrong > 0) {
                        const ctx = document.getElementById('quiz-pie-chart');
                        if (ctx) {
                            new Chart(ctx, {
                                type: 'doughnut',
                                data: {
                                    labels: ['সঠিক', 'ভুল'],
                                    datasets: [{ data: [totalCorrect, totalWrong], backgroundColor: ['#4ade80', '#f87171'], borderWidth: 0 }]
                                },
                                options: { responsive: true, maintainAspectRatio: true, legend: { display: true, position: 'bottom' } }
                            });
                        }
                    }
                } else {
                    document.getElementById('total-quizzes').innerText = '0';
                    document.getElementById('total-score').innerText   = '0';
                    document.getElementById('average-score').innerText = '0%';
                }
            }
        }
    });
}


async function loadLeaderboard(chapterID) {
    firebase.auth().onAuthStateChanged(async (user) => {
        if (user) {
            const db = firebase.firestore();
            try {
                const usersSnapshot = await db.collection('users').get();
                const leaderboardData = [];
                
                usersSnapshot.forEach(doc => {
                    const userData    = doc.data();
                    const chapterData = userData.chapters?.[chapterID];
                    if (chapterData && chapterData.totalScore > 0) {
                        leaderboardData.push({
                            name:  userData.name || userData.displayName || 'Unknown',
                            score: chapterData.totalScore || 0,
                            totalQuestions: Object.values(chapterData.quiz_sets || {}).reduce((sum, s) => sum + (s.totalQuestions || 0), 0)
                        });
                    }
                });
                
                leaderboardData.sort((a, b) => b.score - a.score);
                
                const leaderboardBody = document.getElementById('leaderboard-body');
                if (leaderboardData.length > 0) {
                    leaderboardBody.innerHTML = leaderboardData.slice(0, 10).map((u, i) => {
                        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '';
                        return `<tr>
                            <td><strong>${medal} ${i + 1}</strong></td>
                            <td style="text-align:left;padding-left:20px;"><strong>${u.name}</strong></td>
                            <td><strong>${u.score}/${u.totalQuestions}</strong></td>
                        </tr>`;
                    }).join('');
                } else {
                    leaderboardBody.innerHTML = '<tr><td colspan="3" style="text-align:center;">এখনও কোনো ডাটা নেই</td></tr>';
                }
            } catch (error) {
                console.error('❌ Leaderboard load error:', error);
            }
        }
    });
}
