// Dashboard Data Loader for LCM-HCF Chapter
document.addEventListener('DOMContentLoaded', () => {
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            loadDashboardData(user.uid);
        }
    });
});

async function loadDashboardData(userId) {
    const db = firebase.firestore();
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) return;
    
    const userData = userDoc.data();
    const chapterData = userData.chapters?.['LCM-HCF'] || {};
    
    // Update stats
    document.getElementById('total-quizzes').textContent = chapterData.completedQuizzesCount || 0;
    document.getElementById('total-score').textContent = chapterData.totalScore || 0;
    
    const avgScore = chapterData.completedQuizzesCount > 0 
        ? Math.round(chapterData.totalScore / chapterData.completedQuizzesCount) 
        : 0;
    document.getElementById('average-score').textContent = avgScore;
}
