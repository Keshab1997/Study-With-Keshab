// Filename: quiz/js/script.js - Upgraded with Skip Functionality

// ===============================================
// --- App Initialization & Global Variables ---
// ===============================================

// Global variables
let currentQuestionIndex = 0;
let selectedAnswer = null;
let correctCount = 0;
let wrongCount = 0;
let userAnswers = [];
let shuffledOptionsPerQuestion = [];
let timerInterval;
let currentCorrectAnswerIndex;

// Sound effects
const correctSound = new Audio("../sounds/correct.mp3");
const wrongSound = new Audio("../sounds/wrong.mp3");

// Main entry point
document.addEventListener("DOMContentLoaded", () => {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            initializeApp();
        } else {
            alert("এই কুইজ দিতে হলে আপনাকে লগইন করতে হবে!");
            window.location.href = "../login.html";
        }
    });
});

function initializeApp() {
    setupModeToggle();
    if (
        typeof quizSet !== "undefined" &&
        quizSet.questions &&
        quizSet.questions.length > 0
    ) {
        document.getElementById("quiz-title").textContent = quizSet.name;
        shuffleArray(quizSet.questions);
        showQuestion();
        setupKeyboard();
    } else {
        document.getElementById("quiz-container").innerHTML =
            "<p class='text-red-600 font-bold text-center'>দুঃখিত, প্রশ্ন সেট লোড করা যায়নি।</p>";
    }
}

// ===============================================
// --- UI Setup Section ---
// ===============================================

function setupModeToggle() {
    const modeToggleBtn = document.getElementById("mode-toggle");
    const body = document.body;
    function applyMode(mode) {
        if (mode === "dark-mode") {
            body.classList.add("dark-mode");
            body.classList.remove("day-mode");
            if (modeToggleBtn)
                modeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            body.classList.add("day-mode");
            body.classList.remove("dark-mode");
            if (modeToggleBtn)
                modeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
        }
    }
    const savedMode = localStorage.getItem("quizAppMode");
    applyMode(savedMode || "day-mode");
    if (modeToggleBtn) {
        modeToggleBtn.addEventListener("click", () => {
            const newMode = body.classList.contains("day-mode")
                ? "dark-mode"
                : "day-mode";
            applyMode(newMode);
            localStorage.setItem("quizAppMode", newMode);
        });
    }
}

// ===============================================
// --- Core Quiz Logic Section ---
// ===============================================

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function startTimer() {
    let seconds = 0;
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        seconds++;
        const minutes = Math.floor(seconds / 60);
        const remainderSeconds = seconds % 60;
        document.getElementById("timer").textContent =
            `${String(minutes).padStart(2, "0")}:${String(remainderSeconds).padStart(2, "0")}`;
    }, 1000);
}

function showQuestion() {
    selectedAnswer = null;
    startTimer();
    const container = document.getElementById("quiz-container");
    const q = quizSet.questions[currentQuestionIndex];
    let shuffledOptions = [...q.options];
    shuffleArray(shuffledOptions);
    shuffledOptionsPerQuestion[currentQuestionIndex] = shuffledOptions;
    currentCorrectAnswerIndex = shuffledOptions.indexOf(q.options[q.answer]);
    container.innerHTML = `
        <div class="mb-4">
            <h2 class="text-xl md:text-2xl font-semibold mb-6 text-center">প্রশ্ন ${currentQuestionIndex + 1}: ${q.question}</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                ${shuffledOptions
                    .map(
                        (opt, i) => `
                    <button class="option-btn" onclick="selectAnswer(${i}, ${currentCorrectAnswerIndex})" data-index="${i}">
                        <span class="option-prefix">${String.fromCharCode(65 + i)}.</span>
                        <span>${opt}</span>
                    </button>
                `,
                    )
                    .join("")}
            </div>
        </div>
        <!-- Action Buttons Section -->
        <div class="flex flex-col md:flex-row gap-4 mt-6">
            <button id="skipBtn" onclick="skipQuestion()" class="action-btn gray w-full md:w-1/2">স্কিপ করুন (S)</button>
            <button id="nextBtn" onclick="nextQuestion()" class="action-btn w-full md:w-1/2" disabled>পরবর্তী প্রশ্ন (Enter)</button>
        </div>`;
}

window.selectAnswer = function (selectedIndex, correctBtnIndex) {
    if (selectedAnswer !== null) return;
    clearInterval(timerInterval);
    selectedAnswer = selectedIndex;

    // Disable option and skip buttons
    document
        .querySelectorAll(".option-btn, #skipBtn")
        .forEach((btn) => (btn.disabled = true));

    const correctBtn = document.querySelector(
        `[data-index="${correctBtnIndex}"]`,
    );
    if (correctBtn) correctBtn.classList.add("correct");

    if (selectedIndex !== correctBtnIndex) {
        const selectedBtn = document.querySelector(
            `[data-index="${selectedIndex}"]`,
        );
        if (selectedBtn) selectedBtn.classList.add("incorrect");
        wrongCount++;
        wrongSound.play();
    } else {
        correctCount++;
        correctSound.play();
    }

    userAnswers[currentQuestionIndex] = selectedIndex;
    document.getElementById("correct-count").textContent = `✔️ ${correctCount}`;
    document.getElementById("wrong-count").textContent = `❌ ${wrongCount}`;

    const nextBtn = document.getElementById("nextBtn");
    if (nextBtn) {
        nextBtn.disabled = false;
        nextBtn.focus();
    }
};

/**
 * NEW FUNCTION: Handles skipping the current question.
 */
window.skipQuestion = function () {
    if (selectedAnswer !== null) return; // Can't skip after answering
    clearInterval(timerInterval);

    // Mark as "processed" but with a special value for review
    selectedAnswer = -1; // Allows nextQuestion() to proceed
    userAnswers[currentQuestionIndex] = null; // 'null' will signify a skipped question

    // Count as wrong and play sound
    wrongCount++;
    document.getElementById("wrong-count").textContent = `❌ ${wrongCount}`;
    wrongSound.play();

    // Immediately go to the next question
    nextQuestion();
};

function nextQuestion() {
    // This check is important. It ensures we only proceed if an answer was selected OR the question was skipped.
    if (selectedAnswer === null) return;

    currentQuestionIndex++;
    if (currentQuestionIndex < quizSet.questions.length) {
        showQuestion();
    } else {
        showFinalResult();
    }
}

// ===============================================
// --- Result Display & Data Saving ---
// ===============================================

function showFinalResult() {
    clearInterval(timerInterval);

    if (quizSet.chapterName && quizSet.setName) {
        saveQuizResult(
            quizSet.chapterName,
            quizSet.setName,
            correctCount,
            wrongCount,
            quizSet.questions.length,
        );
    } else {
        console.error(
            "`quizSet.chapterName` বা `quizSet.setName` ডিফাইন করা নেই। স্কোর সেভ করা যাবে না।",
        );
        alert("একটি ত্রুটির কারণে আপনার স্কোর সেভ করা যায়নি।");
    }

    const container = document.getElementById("quiz-container");
    container.innerHTML = `
        <div class="text-center space-y-5">
            <h2 class="text-3xl font-bold text-green-600">🎉 কুইজ শেষ!</h2>
            <p class="text-xl">আপনার স্কোর: <strong class="text-blue-600">${correctCount}</strong> / ${quizSet.questions.length}</p>
            <p class="text-gray-600 dark:text-gray-300">আপনার ফলাফল ড্যাশবোর্ড ও লিডারবোর্ডের জন্য সেভ করা হয়েছে।</p>
            <div class="flex flex-wrap justify-center gap-3">
                <button onclick="showReview()" class="action-btn green">রিভিউ দেখুন</button>
                <a href="../index.html" class="action-btn">ড্যাশবোর্ডে ফিরে যান</a>
                <button onclick="location.reload()" class="action-btn gray">🔁 আবার দিন</button>
            </div>
        </div>`;
}

function showReview() {
    const container = document.getElementById("quiz-container");
    let reviewHTML = `<div class="space-y-4"><h2 class="text-2xl font-bold text-center text-blue-700 mb-4">📚 কুইজ রিভিউ</h2>`;

    quizSet.questions.forEach((q, i) => {
        const userAnswerIndex = userAnswers[i];
        const shuffledOptions = shuffledOptionsPerQuestion[i];
        const correctAnswerIndex = shuffledOptions.indexOf(q.options[q.answer]);

        let userAnswerHTML;
        let isCorrect = false;

        // Check if the question was skipped
        if (userAnswerIndex === null) {
            userAnswerHTML = `<span class="font-bold text-orange-600">আপনি প্রশ্নটি স্কিপ করেছেন</span>`;
        } else {
            isCorrect = userAnswerIndex === correctAnswerIndex;
            userAnswerHTML = `<span class="font-bold ${isCorrect ? "text-green-700" : "text-red-700"}">${shuffledOptions[userAnswerIndex]}</span>`;
        }

        const reviewCardClass =
            userAnswerIndex === null
                ? "review-skipped"
                : isCorrect
                  ? "review-correct"
                  : "review-incorrect";

        reviewHTML += `
            <div class="review-card text-left ${reviewCardClass}">
                <h3 class="font-semibold mb-2">📝 প্রশ্ন ${i + 1}: ${q.question}</h3>
                <p><strong>সঠিক উত্তর:</strong> ${q.options[q.answer]}</p>
                <p><strong>আপনার উত্তর:</strong> ${userAnswerHTML}</p>
                <p class="mt-2"><strong>ব্যাখ্যা:</strong> ${q.explanation || "কোনো ব্যাখ্যা নেই"}</p>
            </div>`;
    });

    reviewHTML += `<div class="text-center mt-6"><button onclick="location.reload()" class="action-btn gray">🔁 আবার দিন</button></div></div>`;
    container.innerHTML = reviewHTML;
}

// =============================================================
// --- নতুন এবং সঠিক স্কোর সেভ করার ফাংশন ---
// =============================================================

function saveQuizResult(chapterName, setName, score, wrong, totalQuestions) {
    const user = firebase.auth().currentUser;
    if (!user) {
        console.error("User not logged in, cannot save score.");
        return;
    }

    const db = firebase.firestore();
    const userDocRef = db.collection("users").doc(user.uid);

    const chapterKey = chapterName.replace(/\s/g, "_");
    const setKey = setName.replace(/\s/g, "_");

    db.runTransaction((transaction) => {
        return transaction.get(userDocRef).then((doc) => {
            if (!doc.exists) {
                console.error("User document does not exist!");
                return;
            }

            const userData = doc.data();
            const chapters = userData.chapters || {};
            const chapterData = chapters[chapterKey] || {
                completedQuizzesCount: 0,
                totalCorrect: 0,
                totalWrong: 0,
                totalScore: 0,
                quiz_sets: {},
            };

            const oldSetData = chapterData.quiz_sets[setKey];
            if (oldSetData) {
                chapterData.totalCorrect -= oldSetData.score;
                chapterData.totalWrong -=
                    oldSetData.totalQuestions - oldSetData.score;
                chapterData.totalScore -= oldSetData.score;
            } else {
                chapterData.completedQuizzesCount += 1;
            }

            chapterData.totalCorrect += score;
            chapterData.totalWrong += wrong;
            chapterData.totalScore += score;

            chapterData.quiz_sets[setKey] = {
                score: score,
                totalQuestions: totalQuestions,
                attemptedAt: firebase.firestore.FieldValue.serverTimestamp(),
            };

            const updateData = {};
            updateData[`chapters.${chapterKey}`] = chapterData;

            transaction.update(userDocRef, updateData);
        });
    })
        .then(() => {
            console.log("ফলাফল সফলভাবে সেভ হয়েছে!");
        })
        .catch((error) => {
            console.error("স্কোর সেভ করতে সমস্যা হয়েছে: ", error);
            alert("দুঃখিত, আপনার ফলাফল সেভ করা যায়নি। আবার চেষ্টা করুন।");
        });
}

// ===============================================
// --- Keyboard Navigation Section ---
// ===============================================

function setupKeyboard() {
    document.addEventListener("keydown", function (event) {
        if (
            document.activeElement.tagName === "INPUT" ||
            document.activeElement.tagName === "TEXTAREA"
        ) {
            return;
        }

        const nextBtn = document.getElementById("nextBtn");

        if (event.key === "Enter" && nextBtn && !nextBtn.disabled) {
            nextQuestion();
        }

        // New: Skip with 's' key
        if (event.key.toLowerCase() === "s" && selectedAnswer === null) {
            event.preventDefault();
            skipQuestion();
        }

        if (selectedAnswer === null) {
            const keyMap = { 1: 0, 2: 1, 3: 2, 4: 3, a: 0, b: 1, c: 2, d: 3 };
            const index = keyMap[event.key.toLowerCase()];
            if (index !== undefined) {
                event.preventDefault();
                const buttons = document.querySelectorAll(".option-btn");
                if (index < buttons.length) {
                    selectAnswer(index, currentCorrectAnswerIndex);
                }
            }
        }
    });
}
