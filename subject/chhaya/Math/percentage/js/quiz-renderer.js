// Quiz Data Loader - URL থেকে set প্যারামিটার নিয়ে JSON লোড করে
let quizSet = null;

async function loadQuizData() {
    const urlParams = new URLSearchParams(window.location.search);
    const setName = urlParams.get('set') || 'Qset1';

    try {
        // chapter-info.json থেকে chapterID নেওয়া হচ্ছে
        const [quizRes, chapterRes] = await Promise.all([
            fetch(`../data/${setName}.json`),
            fetch(`../data/chapter-info.json`)
        ]);

        if (!quizRes.ok) throw new Error(`Quiz JSON not found: ${setName}.json`);

        quizSet = await quizRes.json();

        // chapterID inject করা হচ্ছে যাতে save/load একই key ব্যবহার করে
        if (chapterRes.ok) {
            const chapterInfo = await chapterRes.json();
            quizSet.chapterID = chapterInfo.chapterID;
        }

        if (typeof initializeApp === 'function') {
            initializeApp();
        }
    } catch (error) {
        console.error("Quiz data load error:", error);
        document.getElementById("quiz-container").innerHTML =
            `<div style="text-align:center;color:red;font-weight:bold;padding:20px;">
                <p>কুইজ ডাটা পাওয়া যায়নি।</p>
                <p style="font-size:0.85rem;margin-top:8px;">ফাইল: ${setName}.json</p>
            </div>`;
    }
}

document.addEventListener("DOMContentLoaded", loadQuizData);
