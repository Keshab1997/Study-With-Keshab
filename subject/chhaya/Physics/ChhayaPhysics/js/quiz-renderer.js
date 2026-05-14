// Quiz Data Loader - URL থেকে set প্যারামিটার নিয়ে JSON লোড করে
let quizSet = null;

async function loadQuizData() {
    const urlParams = new URLSearchParams(window.location.search);
    const setName = urlParams.get('set') || 'Qset1'; // ডিফল্ট Qset1

    try {
        const response = await fetch(`../data/${setName}.json`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        quizSet = await response.json();
        
        // ডাটা লোড হওয়ার পর quiz_script.js এর initializeApp() কল করা হবে
        if (typeof initializeApp === 'function') {
            initializeApp();
        } else {
            console.error('initializeApp function not found in quiz_script.js');
        }
    } catch (error) {
        console.error("Quiz data load error:", error);
        document.getElementById("quiz-container").innerHTML = 
            `<div class="text-center text-red-600 font-bold">
                <p>কুইজ ডাটা পাওয়া যায়নি।</p>
                <p class="text-sm mt-2">ফাইল: ${setName}.json</p>
            </div>`;
    }
}

// DOMContentLoaded এ loadQuizData কল করুন
document.addEventListener("DOMContentLoaded", loadQuizData);
