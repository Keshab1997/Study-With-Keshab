document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('data/chapter-info.json');
        const data = await response.json();

        // ১. চ্যাপ্টার ব্যানার সেট করা
        window.__CHAPTER_BANNER__ = `
            <div class="chapter-banner">
                <h1>📐 ${data.chapterName}</h1>
                <p>${data.description}</p>
            </div>
        `;

        // ২. ক্লাস লিস্ট তৈরি
        const classContainer = document.getElementById('class-list-container');
        classContainer.innerHTML = data.classes.map(cls => `
            <a href="class/class.html?id=${cls.id}">
                <i class="fa-solid fa-person-chalkboard fa-fw"></i> Class ${cls.id}: ${cls.title}
            </a>
        `).join('');

        // ৩. কুইজ লিস্ট তৈরি
        const quizContainer = document.getElementById('quiz-list-container');
        quizContainer.innerHTML = data.quizzes.map(quiz => `
            <a href="quiz/${quiz.set}.html">
                <i class="fa-solid fa-puzzle-piece fa-fw"></i> ${quiz.title}
            </a>
        `).join('');

    } catch (error) {
        console.error("Error loading chapter data:", error);
    }
});