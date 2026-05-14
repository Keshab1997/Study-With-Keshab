// Filename: quiz/js/script.js - Upgraded for correct leaderboard saving

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

// Sound effects - Disable if files not found
const correctSound = new Audio("../sounds/correct.mp3");
const wrongSound = new Audio("../sounds/wrong.mp3");

// Prevent error if sound files don't exist
correctSound.onerror = () => console.warn('Correct sound file not found');
wrongSound.onerror = () => console.warn('Wrong sound file not found');

// Main entry point
// Note: loadQuizData() quiz-renderer.js থেকে কল হবে
function checkAuthAndInit() {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            // User logged in, quiz-renderer.js থেকে initializeApp() কল হবে
        } else {
            alert("এই কুইজ দিতে হলে আপনাকে লগইন করতে হবে!");
            window.location.href = "../../../login.html";
        }
    });
}

// DOMContentLoaded এ auth চেক করুন
document.addEventListener("DOMContentLoaded", checkAuthAndInit);

function initializeApp() {
    setupModeToggle();
    if (
        typeof quizSet !== "undefined" &&
        quizSet &&
        quizSet.questions &&
        quizSet.questions.length > 0
    ) {
        document.getElementById("quiz-title").textContent = quizSet.setName || quizSet.chapterName;
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
    currentCorrectAnswerIndex = shuffledOptions.indexOf(q.options[q.correctAnswer]);
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
        <button id="nextBtn" onclick="nextQuestion()" class="action-btn w-full mt-6" disabled>পরবর্তী প্রশ্ন</button>`;
}

window.selectAnswer = function (selectedIndex, correctBtnIndex) {
    if (selectedAnswer !== null) return;
    clearInterval(timerInterval);
    selectedAnswer = selectedIndex;
    document
        .querySelectorAll(".option-btn")
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
        wrongSound.play().catch(e => console.warn('Sound play failed'));
    } else {
        correctCount++;
        correctSound.play().catch(e => console.warn('Sound play failed'));
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

function nextQuestion() {
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
        alert("একটি ত্রুটির কারণে আপনার স্কোর সেভ করা যায়নি।");
    }

    const totalQuestions = quizSet.questions.length;
    const percentage = ((correctCount / totalQuestions) * 100).toFixed(1);
    
    const container = document.getElementById("quiz-container");
    container.innerHTML = `
        <div class="text-center space-y-5">
            <h2 class="text-3xl font-bold text-green-600">🎉 কুইজ শেষ!</h2>
            <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md mx-auto">
                <h3 class="text-2xl font-bold mb-4">আপনার ফলাফল</h3>
                <div class="space-y-3 text-lg">
                    <p><strong>অধ্যায়:</strong> ${quizSet.chapterName}</p>
                    <p><strong>কুইজ সেট:</strong> ${quizSet.setName}</p>
                    <div class="border-t border-b py-3 my-3">
                        <p class="text-2xl font-bold text-blue-600">${correctCount} / ${totalQuestions}</p>
                        <p class="text-sm text-gray-600 dark:text-gray-400">সঠিক উত্তর</p>
                    </div>
                    <p class="text-green-600">✔️ সঠিক: ${correctCount}</p>
                    <p class="text-red-600">❌ ভুল: ${wrongCount}</p>
                    <p class="text-purple-600">📊 শতাংশ: ${percentage}%</p>
                </div>
            </div>
            <p class="text-gray-600 dark:text-gray-300">আপনার ফলাফল ড্যাশবোর্ড ও লিডারবোর্ডের জন্য সেভ করা হয়েছে।</p>
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
        const correctAnswerIndex = shuffledOptions.indexOf(q.options[q.correctAnswer]);
        const isCorrect = userAnswerIndex === correctAnswerIndex;
        reviewHTML += `<div class="review-card text-left ${isCorrect ? "review-correct" : "review-incorrect"}"><h3 class="font-semibold mb-2">📝 প্রশ্ন ${i + 1}: ${q.question}</h3><p><strong>সঠিক উত্তর:</strong> ${q.options[q.correctAnswer]}</p><p><strong>আপনার উত্তর:</strong> <span class="font-bold ${isCorrect ? "text-green-700" : "text-red-700"}">${shuffledOptions[userAnswerIndex] ?? "উত্তর দেননি"}</span></p><p class="mt-2"><strong>ব্যাখ্যা:</strong> ${q.explanation || "কোনো ব্যাখ্যা নেই"}</p></div>`;
    });
    reviewHTML += `<div class="text-center mt-6"><button onclick="location.reload()" class="action-btn gray">🔁 আবার দিন</button></div></div>`;
    container.innerHTML = reviewHTML;
}

// =============================================================
// --- নতুন এবং সঠিক স্কোর সেভ করার ফাংশন ---
// =============================================================

/**
 * Saves quiz result to the 'users' collection, compatible with the dashboard.
 * @param {string} chapterName - e.g., "কার্য, ক্ষমতা ও শক্তি"
 * @param {string} setName - e.g., "Quiz Set 1"
 * @param {number} score - Number of correct answers.
 * @param {number} wrong - Number of wrong answers.
 * @param {number} totalQuestions - Total questions in the quiz.
 */
function saveQuizResult(chapterName, setName, score, wrong, totalQuestions) {
    const user = firebase.auth().currentUser;
    if (!user) {
        console.error("User not logged in, cannot save score.");
        return;
    }

    const db = firebase.firestore();
    const userDocRef = db.collection("users").doc(user.uid);

    // অধ্যায়ের নাম এবং সেটের নামকে Firestore-এর জন্য নিরাপদ কী-তে রূপান্তর করি
    const match = chapterName.match(/\(([^)]+)\)/);
    const chapterKey = match ? match[1].replace(/\s+/g, "-") : chapterName.replace(/\s/g, "_");
    const setKey = setName.replace(/\s/g, "_"); // "Quiz Set 1" -> "Quiz_Set_1"

    db.runTransaction((transaction) => {
        return transaction.get(userDocRef).then((doc) => {
            if (!doc.exists) {
                // যদি ইউজারের কোনো ডকুমেন্ট না থাকে, তবে একটি নতুন ডকুমেন্ট তৈরি হবে
                // এটি সাধারণত হবে না কারণ লগইন করার সময় ডকুমেন্ট তৈরি হওয়ার কথা
                console.error("User document does not exist!");
                // আপনি চাইলে এখানে নতুন ডকুমেন্ট তৈরি করতে পারেন
                // transaction.set(userDocRef, { displayName: user.displayName, email: user.email });
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

            // পুরনো স্কোর থেকে বর্তমান কুইজের স্কোর বিয়োগ করি (যদি থাকে)
            const oldSetData = chapterData.quiz_sets[setKey];
            if (oldSetData) {
                chapterData.totalCorrect -= oldSetData.score;
                chapterData.totalWrong -=
                    oldSetData.totalQuestions - oldSetData.score;
                chapterData.totalScore -= oldSetData.score;
            } else {
                // যদি এটি নতুন কুইজ হয়, তাহলে সম্পন্ন করা কুইজের সংখ্যা বাড়াই
                chapterData.completedQuizzesCount += 1;
            }

            // নতুন স্কোর যোগ করি
            chapterData.totalCorrect += score;
            chapterData.totalWrong += wrong;
            chapterData.totalScore += score;

            // এই কুইজ সেটের বিস্তারিত তথ্য সেভ করি
            chapterData.quiz_sets[setKey] = {
                score: score,
                totalQuestions: totalQuestions,
                attemptedAt: firebase.firestore.FieldValue.serverTimestamp(),
            };

            // সবশেষে, মূল ইউজার ডকুমেন্টে আপডেট করা ডেটা বসিয়ে দিই
            const updateData = {};
            updateData[`chapters.${chapterKey}`] = chapterData;

            transaction.update(userDocRef, updateData);
        });
    })
        .then(() => {
            console.log("ফলাফল সফলভাবে সেভ হয়েছে!");
        })
        .catch((error) => {
            console.error("স্কোর সেভ করতে সমস্যা হয়েছে: ", error);
            alert("দুঃখিত, আপনার ফলাফল সেভ করা যায়নি। আবার চেষ্টা করুন।");
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
