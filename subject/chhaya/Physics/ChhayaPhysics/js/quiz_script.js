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
        <div style="display: flex; flex-direction: column; height: 100%; overflow: hidden;">
            <div style="flex-shrink: 0; margin-bottom: clamp(10px, 2vh, 15px);">
                <div class="flex items-center justify-between mb-3">
                    <span class="text-sm font-semibold px-4 py-2 rounded-full" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-size: clamp(0.8rem, 1.2vw, 0.9rem);">প্রশ্ন ${currentQuestionIndex + 1}/${quizSet.questions.length}</span>
                </div>
                <h2 style="font-size: clamp(1.1rem, 2.5vw, 1.8rem); font-weight: 700; margin-bottom: clamp(15px, 3vh, 25px); line-height: 1.4; color: inherit;">${q.question}</h2>
            </div>
            <div style="flex: 1; display: flex; flex-direction: column; min-height: 0;">
                <div class="options-grid" style="flex: 1;">
                    ${shuffledOptions
                        .map(
                            (opt, i) => `
                        <button class="option-btn group" onclick="selectAnswer(${i}, ${currentCorrectAnswerIndex})" data-index="${i}">
                            <span class="option-prefix">${String.fromCharCode(65 + i)}</span>
                            <span class="option-text">${opt}</span>
                        </button>
                    `,
                        )
                        .join("")}
                </div>
                <button id="nextBtn" onclick="nextQuestion()" class="next-btn" disabled style="flex-shrink: 0;">পরবর্তী প্রশ্ন →</button>
            </div>
        </div>
        
        <style>
            .options-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: clamp(10px, 1.5vh, 18px);
                width: 100%;
                height: 100%;
                align-content: center;
            }
            
            .option-btn {
                position: relative;
                display: flex;
                align-items: center;
                width: 100%;
                height: 100%;
                padding: clamp(12px, 1.8vh, 20px) clamp(12px, 1.5vw, 18px);
                border-radius: clamp(10px, 1.2vw, 16px);
                border: 2px solid #e5e7eb;
                background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
                transition: all 0.3s ease;
                cursor: pointer;
                font-size: clamp(0.9rem, 1.3vw, 1.1rem);
                font-weight: 500;
                text-align: left;
                overflow: hidden;
                color: #1e293b;
            }
            
            .option-prefix {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: clamp(30px, 3.5vw, 40px);
                height: clamp(30px, 3.5vw, 40px);
                border-radius: 50%;
                background: white;
                color: #1e293b;
                font-weight: 800;
                font-size: clamp(0.95rem, 1.4vw, 1.15rem);
                margin-right: clamp(10px, 1.2vw, 15px);
                flex-shrink: 0;
                box-shadow: 0 3px 12px rgba(0, 0, 0, 0.15);
                border: 2px solid #1e293b;
            }
            
            .option-text {
                flex: 1;
                line-height: 1.3;
                overflow: hidden;
                text-overflow: ellipsis;
                display: -webkit-box;
                -webkit-line-clamp: 3;
                -webkit-box-orient: vertical;
            }
            
            .option-btn:hover:not(:disabled) {
                transform: translateY(-2px);
                box-shadow: 0 8px 20px rgba(102, 126, 234, 0.25);
                border-color: #667eea;
                background: linear-gradient(135deg, #eef2ff 0%, #f8fafc 100%);
            }
            
            .option-btn:disabled {
                cursor: not-allowed;
            }
            
            .option-btn.correct {
                background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
                border-color: #059669 !important;
                color: white !important;
                animation: correctPulse 0.6s ease;
            }
            
            .option-btn.correct .option-prefix {
                background: rgba(255, 255, 255, 0.95) !important;
                color: #059669 !important;
                box-shadow: 0 2px 8px rgba(255, 255, 255, 0.5);
            }
            
            .option-btn.incorrect {
                background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%) !important;
                border-color: #dc2626 !important;
                color: white !important;
                animation: incorrectShake 0.5s ease;
            }
            
            .option-btn.incorrect .option-prefix {
                background: rgba(255, 255, 255, 0.95) !important;
                color: #dc2626 !important;
                box-shadow: 0 2px 8px rgba(255, 255, 255, 0.5);
            }
            
            .next-btn {
                width: 100%;
                padding: clamp(12px, 1.8vh, 16px);
                font-size: clamp(0.95rem, 1.3vw, 1.15rem);
                font-weight: 600;
                border-radius: clamp(10px, 1.2vw, 16px);
                border: none;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
                margin-top: clamp(12px, 2vh, 20px);
            }
            
            .next-btn:not(:disabled) {
                cursor: pointer;
            }
            
            .next-btn:not(:disabled):hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
            }
            
            .next-btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            
            @keyframes correctPulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.02); }
            }
            
            @keyframes incorrectShake {
                0%, 100% { transform: translateX(0); }
                25%, 75% { transform: translateX(-5px); }
                50% { transform: translateX(5px); }
            }
            
            body.dark-mode .option-btn {
                background: linear-gradient(135deg, #374151 0%, #1f2937 100%);
                border-color: #4b5563;
                color: #f3f4f6;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            }
            
            body.dark-mode .option-prefix {
                background: #1e293b;
                color: white;
                border-color: #60a5fa;
                box-shadow: 0 3px 12px rgba(96, 165, 250, 0.3);
            }
            
            body.dark-mode .option-btn:hover:not(:disabled) {
                border-color: #60a5fa;
                background: linear-gradient(135deg, #4b5563 0%, #374151 100%);
                box-shadow: 0 8px 20px rgba(96, 165, 250, 0.2);
            }
            
            /* Responsive adjustments */
            @media (max-width: 768px) {
                .options-grid {
                    gap: 10px;
                }
            }
            
            @media (max-width: 480px) {
                .options-grid {
                    grid-template-columns: 1fr;
                    gap: 8px;
                }
                .option-text {
                    -webkit-line-clamp: 2;
                }
            }
            
            @media (max-height: 700px) {
                .option-text {
                    -webkit-line-clamp: 2;
                }
            }
        </style>
    `;
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
