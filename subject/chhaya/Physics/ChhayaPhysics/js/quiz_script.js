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
let quizStartTime;

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
        quizStartTime = Date.now();
        
        showSkeleton();
        setTimeout(() => {
            showQuestion();
            setupKeyboard();
        }, 800);
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

function showSkeleton() {
    const container = document.getElementById("quiz-container");
    if (!container) return;
    container.innerHTML = `
        <div style="display: flex; flex-direction: column; height: 100%; gap: 20px;">
            <div class="skeleton" style="width: 60%; height: 30px; margin-bottom: 20px;"></div>
            <div class="skeleton" style="width: 100%; height: 80px;"></div>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; flex: 1;">
                <div class="skeleton" style="height: 60px;"></div>
                <div class="skeleton" style="height: 60px;"></div>
                <div class="skeleton" style="height: 60px;"></div>
                <div class="skeleton" style="height: 60px;"></div>
            </div>
            <div class="skeleton" style="width: 100%; height: 50px; margin-top: auto;"></div>
        </div>
    `;
}

function triggerConfetti() {
    if (typeof confetti === "function") {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#667eea', '#764ba2', '#10b981', '#f59e0b']
        });
    }
}

function updateProgressBar() {
    const progressBar = document.getElementById("progress-bar-fill");
    if (progressBar && quizSet && quizSet.questions) {
        const progress = (currentQuestionIndex / quizSet.questions.length) * 100;
        progressBar.style.width = `${progress}%`;
    }
}

function renderQuestionGrid() {
    const grid = document.getElementById("question-grid");
    if (!grid || !quizSet) return;

    grid.innerHTML = quizSet.questions.map((_, i) => {
        const isActive = i === currentQuestionIndex ? "active" : "";
        const answer = userAnswers[i];
        const isAnswered = answer !== undefined && answer !== "skipped" ? "answered" : "";
        const isSkipped = answer === "skipped" ? "skipped" : "";
        return `<div class="grid-item ${isActive} ${isAnswered} ${isSkipped}" onclick="jumpToQuestion(${i})">${i + 1}</div>`;
    }).join("");

    // Update desktop buttons
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtnContainer");
    if (prevBtn) prevBtn.disabled = currentQuestionIndex === 0;
    if (nextBtn) nextBtn.disabled = selectedAnswer === null;
    
    // Update mobile buttons
    const mobilePrevBtn = document.getElementById("mobilePrevBtn");
    const mobileNextBtn = document.getElementById("mobileNextBtn");
    if (mobilePrevBtn) mobilePrevBtn.disabled = currentQuestionIndex === 0;
    if (mobileNextBtn) mobileNextBtn.disabled = selectedAnswer === null;
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
    updateProgressBar();
    renderQuestionGrid();
    const container = document.getElementById("quiz-container");
    const q = quizSet.questions[currentQuestionIndex];
    let shuffledOptions = [...q.options];
    shuffleArray(shuffledOptions);
    shuffledOptionsPerQuestion[currentQuestionIndex] = shuffledOptions;
    currentCorrectAnswerIndex = shuffledOptions.indexOf(q.options[q.correctAnswer]);
    container.innerHTML = `
        <div class="flip-in" style="display: flex; flex-direction: column; height: 100%; overflow: hidden;">
            <div style="flex-shrink: 0; margin-bottom: clamp(8px, 1.5vh, 12px);">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-sm font-semibold px-3 py-1 rounded-full" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-size: clamp(0.75rem, 1.2vw, 0.85rem);">প্রশ্ন ${currentQuestionIndex + 1}/${quizSet.questions.length}</span>
                </div>
                <h2 style="font-size: clamp(0.95rem, 2.2vw, 1.5rem); font-weight: 700; margin-bottom: clamp(10px, 2vh, 18px); line-height: 1.3; color: inherit;">${q.question}</h2>
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
                    gap: 8px;
                }
                .option-btn {
                    padding: 10px 12px;
                }
                .option-prefix {
                    width: 28px;
                    height: 28px;
                    font-size: 0.9rem;
                    margin-right: 8px;
                }
            }
            
            @media (max-width: 480px) {
                .options-grid {
                    grid-template-columns: 1fr;
                    gap: 6px;
                }
                .option-btn {
                    padding: 10px 12px;
                    font-size: 0.9rem;
                    min-height: 50px;
                }
                .option-prefix {
                    width: 28px;
                    height: 28px;
                    font-size: 0.9rem;
                    margin-right: 8px;
                    border-width: 1.5px;
                }
                .option-text {
                    -webkit-line-clamp: 3;
                    font-size: 0.9rem;
                }
                /* Hide question badge on mobile */
                .flip-in > div:first-child > div:first-child {
                    display: none;
                }
                /* Make question text more compact */
                .flip-in > div:first-child {
                    margin-bottom: 10px;
                }
                .flip-in > div:first-child h2 {
                    font-size: 1rem !important;
                    margin-bottom: 10px !important;
                    line-height: 1.3 !important;
                }
            }
            
            @media (max-height: 700px) {
                .option-text {
                    -webkit-line-clamp: 2;
                }
            }
            
            @media (max-height: 600px) {
                .option-btn {
                    padding: 6px 8px;
                }
                .option-prefix {
                    width: 24px;
                    height: 24px;
                    font-size: 0.8rem;
                }
                .option-text {
                    -webkit-line-clamp: 1;
                    font-size: 0.8rem;
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
        // triggerConfetti(); // Disabled confetti animation
    }
    userAnswers[currentQuestionIndex] = selectedIndex;
    document.getElementById("correct-count").textContent = `✔️ ${correctCount}`;
    document.getElementById("wrong-count").textContent = `❌ ${wrongCount}`;
    
    renderQuestionGrid();
    const nextBtn = document.getElementById("nextBtnContainer");
    const mobileNextBtn = document.getElementById("mobileNextBtn");
    if (nextBtn) {
        nextBtn.disabled = false;
        nextBtn.focus();
    }
    if (mobileNextBtn) {
        mobileNextBtn.disabled = false;
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

function previousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        selectedAnswer = userAnswers[currentQuestionIndex] !== undefined ? userAnswers[currentQuestionIndex] : null;
        showQuestion();
        if (selectedAnswer !== null && selectedAnswer !== "skipped") {
            applyPreviousAnswer();
        }
    }
}

function skipQuestion() {
    userAnswers[currentQuestionIndex] = "skipped";
    selectedAnswer = "skipped";
    renderQuestionGrid();
    
    // Enable next button for skipped questions
    const nextBtn = document.getElementById("nextBtnContainer");
    const mobileNextBtn = document.getElementById("mobileNextBtn");
    if (nextBtn) {
        nextBtn.disabled = false;
        nextBtn.focus();
    }
    if (mobileNextBtn) {
        mobileNextBtn.disabled = false;
    }
}

function jumpToQuestion(index) {
    currentQuestionIndex = index;
    selectedAnswer = userAnswers[currentQuestionIndex] !== undefined ? userAnswers[currentQuestionIndex] : null;
    showQuestion();
    if (selectedAnswer !== null && selectedAnswer !== "skipped") {
        applyPreviousAnswer();
    }
}

function applyPreviousAnswer() {

    const q = quizSet.questions[currentQuestionIndex];
    const shuffledOptions = shuffledOptionsPerQuestion[currentQuestionIndex];
    if (!shuffledOptions) return;

    const correctBtnIndex = shuffledOptions.indexOf(q.options[q.correctAnswer]);
    
    document.querySelectorAll(".option-btn").forEach((btn, i) => {
        btn.disabled = true;
        if (i === correctBtnIndex) {
            btn.classList.add("correct");
        }
        if (i === selectedAnswer) {
            if (i !== correctBtnIndex) {
                btn.classList.add("incorrect");
            }
        }
    });
    
    document.getElementById("nextBtnContainer").disabled = false;
}

// ===============================================
// --- Result Display & Data Saving ---
// ===============================================

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function calculateGrade(percentage) {
    if (percentage >= 90) return "A+";
    if (percentage >= 80) return "A";
    if (percentage >= 70) return "B";
    if (percentage >= 60) return "C";
    if (percentage >= 50) return "D";
    return "F";
}

function showFinalResult() {
    clearInterval(timerInterval);

    // হেডার এবং নেভিগেশন ফিরিয়ে আনা
    const header = document.querySelector('.quiz-header');
    const quizNav = document.getElementById('quiz-navigation');
    const pageNav = document.querySelector('.page-navigation');
    const mobileNav = document.querySelector('.mobile-nav-buttons');
    if (header) header.style.display = '';
    if (quizNav) quizNav.style.display = '';
    if (pageNav) pageNav.style.display = '';
    if (mobileNav) mobileNav.style.display = '';

    const totalTimeSeconds = Math.floor((Date.now() - quizStartTime) / 1000);
    const timeTaken = formatTime(totalTimeSeconds);

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
    const grade = calculateGrade(parseFloat(percentage));
    
    const container = document.getElementById("quiz-container");
    container.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; height: 100%; padding: 5px; overflow-y: auto;">
            <div style="text-align: center; max-width: 750px; width: 100%; margin: auto 0; padding: 10px 0;">
                
                <h2 style="font-size: clamp(1.2rem, 2.5vw, 1.6rem); font-weight: 700; color: #10b981; margin-bottom: 10px;">🎉 কুইজ সম্পন্ন!</h2>
                
                <div class="result-card" style="background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); border-radius: 12px; padding: 15px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); margin-bottom: 15px;">
                    
                    <!-- Chapter & Set Info -->
                    <div style="display: flex; flex-wrap: wrap; justify-content: space-between; gap: 8px; margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px solid #e5e7eb; text-align: left;">
                        <div style="flex: 1; min-width: 150px; overflow: hidden;">
                            <span style="font-size: 0.7rem; color: #64748b; text-transform: uppercase; font-weight: 600;">অধ্যায়</span>
                            <div style="font-size: 0.9rem; font-weight: 700; color: #1e293b; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${quizSet.chapterName}">${quizSet.chapterName}</div>
                        </div>
                        <div style="flex: 1; min-width: 150px; text-align: right; overflow: hidden;" class="set-name-box">
                            <span style="font-size: 0.7rem; color: #64748b; text-transform: uppercase; font-weight: 600;">কুইজ সেট</span>
                            <div style="font-size: 0.9rem; font-weight: 700; color: #1e293b; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${quizSet.setName}">${quizSet.setName}</div>
                        </div>
                    </div>
                    
                    <!-- Score Section -->
                    <div style="display: flex; flex-wrap: wrap; gap: 10px; align-items: stretch;">
                        
                        <!-- Big Score Box -->
                        <div style="flex: 1; min-width: 180px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px; padding: 12px; display: flex; flex-direction: column; justify-content: center; align-items: center; color: white; box-shadow: 0 4px 10px rgba(102, 126, 234, 0.2);">
                            <div style="font-size: clamp(2rem, 4vw, 2.8rem); font-weight: 800; line-height: 1;">${correctCount}/${totalQuestions}</div>
                            <div style="font-size: 0.85rem; font-weight: 500; opacity: 0.9; margin-top: 4px;">সঠিক উত্তর</div>
                        </div>
                        
                        <!-- 3 Small Stats Boxes -->
                        <div style="flex: 1.5; min-width: 220px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
                            <div style="background: #f0fdf4; border-radius: 10px; padding: 10px 5px; display: flex; flex-direction: column; justify-content: center; align-items: center; border: 1px solid #bbf7d0;">
                                <div style="font-size: clamp(1.2rem, 2vw, 1.5rem); font-weight: 800; color: #10b981;">✔️ ${correctCount}</div>
                                <div style="font-size: 0.75rem; font-weight: 600; color: #059669; margin-top: 2px;">সঠিক</div>
                            </div>
                            <div style="background: #fef2f2; border-radius: 10px; padding: 10px 5px; display: flex; flex-direction: column; justify-content: center; align-items: center; border: 1px solid #fecaca;">
                                <div style="font-size: clamp(1.2rem, 2vw, 1.5rem); font-weight: 800; color: #ef4444;">❌ ${wrongCount}</div>
                                <div style="font-size: 0.75rem; font-weight: 600; color: #dc2626; margin-top: 2px;">ভুল</div>
                            </div>
                            <div style="background: #faf5ff; border-radius: 10px; padding: 10px 5px; display: flex; flex-direction: column; justify-content: center; align-items: center; border: 1px solid #e9d5ff;">
                                <div style="font-size: clamp(1.2rem, 2vw, 1.5rem); font-weight: 800; color: #8b5cf6;">📊 ${percentage}%</div>
                                <div style="font-size: 0.75rem; font-weight: 600; color: #7c3aed; margin-top: 2px;">শতাংশ</div>
                            </div>
                        </div>
                    </div>
                    
                    <div style="margin-top: 12px; font-size: 0.8rem; color: #10b981; font-weight: 600;">✅ ফলাফল সফলভাবে সেভ হয়েছে</div>
                </div>
                
                <!-- Action Buttons -->
                <div style="display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;">
                    <button onclick="showReview()" class="res-btn" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">📚 রিভিউ দেখুন</button>
                    <a href="../index.html" class="res-btn" style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); text-decoration: none; display: flex; align-items: center; justify-content: center;">🏠 ড্যাশবোর্ড</a>
                    <button onclick="location.reload()" class="res-btn" style="background: linear-gradient(135deg, #64748b 0%, #475569 100%);">🔁 আবার দিন</button>
                </div>
            </div>
        </div>
        
        <style>
            .res-btn {
                padding: 8px 16px;
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 0.9rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 4px 10px rgba(0,0,0,0.15);
                flex: 1;
                min-width: 120px;
                max-width: 180px;
            }
            .res-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 15px rgba(0,0,0,0.2);
            }
            body.dark-mode .result-card {
                background: rgba(31, 41, 55, 0.95) !important;
                box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3) !important;
            }
            body.dark-mode .result-card > div:first-child {
                border-bottom-color: #374151 !important;
            }
            body.dark-mode .result-card > div:first-child > div > div {
                color: #f3f4f6 !important;
            }
            body.dark-mode .result-card > div:first-child > div > span {
                color: #9ca3af !important;
            }
            body.dark-mode .result-card > div:nth-child(2) > div:nth-child(2) > div {
                background: #374151 !important;
                border-color: #4b5563 !important;
            }
            @media (max-width: 576px) {
                .set-name-box { text-align: left !important; }
            }
        </style>
    `;
}

function showReview() {
    // হেডার এবং নেভিগেশন হাইড করা
    const header = document.querySelector('.quiz-header');
    const quizNav = document.getElementById('quiz-navigation');
    const pageNav = document.querySelector('.page-navigation');
    const mobileNav = document.querySelector('.mobile-nav-buttons');
    if (header) header.style.display = 'none';
    if (quizNav) quizNav.style.display = 'none';
    if (pageNav) pageNav.style.display = 'none';
    if (mobileNav) mobileNav.style.display = 'none';

    const container = document.getElementById("quiz-container");
    
    let reviewHTML = `
        <div style="height: 100%; display: flex; flex-direction: column; overflow: hidden;">
            <div style="flex-shrink: 0; display: flex; justify-content: space-between; align-items: center; margin-bottom: clamp(10px, 2vh, 15px); padding-bottom: clamp(8px, 1.5vh, 12px); border-bottom: 2px solid #e5e7eb;">
                <h2 style="font-size: clamp(1.3rem, 3vw, 2rem); font-weight: 700; color: #667eea; margin: 0;">📚 কুইজ রিভিউ</h2>
                <button onclick="showFinalResult()" style="
                    padding: clamp(8px, 1.5vh, 12px) clamp(15px, 2.5vw, 20px);
                    background: linear-gradient(135deg, #64748b 0%, #475569 100%);
                    color: white;
                    border: none;
                    border-radius: clamp(8px, 1vw, 10px);
                    font-size: clamp(0.85rem, 1.2vw, 0.95rem);
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                " onmouseover="this.style.transform='translateY(-2px)';" onmouseout="this.style.transform='translateY(0)';">
                    ← ফিরে যান
                </button>
            </div>
            
            <div style="flex: 1; overflow-y: auto; padding-right: 5px;">
    `;
    
    quizSet.questions.forEach((q, i) => {
        const userAnswerIndex = userAnswers[i];
        const shuffledOptions = shuffledOptionsPerQuestion[i] || [...q.options];
        const correctAnswerIndex = shuffledOptions.indexOf(q.options[q.correctAnswer]);
        const isCorrect = userAnswerIndex === correctAnswerIndex;
        const isSkipped = userAnswerIndex === "skipped";
        
        let cardClass = isSkipped ? "review-skipped" : (isCorrect ? "review-correct" : "review-incorrect");
        let borderColor = isSkipped ? "#f59e0b" : (isCorrect ? "#22c55e" : "#ef4444");
        let bgColor = isSkipped ? "rgba(245, 158, 11, 0.05)" : (isCorrect ? "#f0fdf4" : "#fef2f2");
        
        if (document.body.classList.contains('dark-mode')) {
            bgColor = isSkipped ? "rgba(245, 158, 11, 0.1)" : (isCorrect ? "#064e3b" : "#7f1d1d");
        }
        
        reviewHTML += `
            <div style="
                background: ${bgColor};
                border-left: 5px solid ${borderColor};
                border-radius: clamp(8px, 1.2vw, 12px);
                padding: clamp(12px, 2vh, 18px);
                margin-bottom: clamp(10px, 1.5vh, 15px);
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
            ">
                <h3 style="font-size: clamp(0.95rem, 1.5vw, 1.1rem); font-weight: 600; margin-bottom: clamp(8px, 1.2vh, 12px); color: inherit;">📝 প্রশ্ন ${i + 1}: ${q.question}</h3>
                
                <p style="margin-bottom: clamp(6px, 1vh, 8px); font-size: clamp(0.85rem, 1.3vw, 0.95rem);"><strong>সঠিক উত্তর:</strong> <span style="color: #059669; font-weight: 600;">${q.options[q.correctAnswer]}</span></p>
                
                <p style="margin-bottom: clamp(8px, 1.2vh, 12px); font-size: clamp(0.85rem, 1.3vw, 0.95rem);">
                    <strong>আপনার উত্তর:</strong> 
                    <span style="font-weight: 600; color: ${isSkipped ? '#f59e0b' : (isCorrect ? '#059669' : '#dc2626')};">
                        ${isSkipped ? '⏭️ স্কিপ করেছেন' : (shuffledOptions[userAnswerIndex] ?? "উত্তর দেননি")}
                    </span>
                </p>
                
                ${q.explanation ? `<p style="margin-top: clamp(8px, 1.2vh, 12px); padding-top: clamp(8px, 1.2vh, 12px); border-top: 1px dashed rgba(0,0,0,0.1); font-size: clamp(0.8rem, 1.2vw, 0.9rem); color: #64748b;"><strong>ব্যাখ্যা:</strong> ${q.explanation}</p>` : ''}
            </div>
        `;
    });
    
    reviewHTML += `
            </div>
        </div>
        
        <style>
            body.dark-mode #quiz-container h2 {
                color: #60a5fa !important;
            }
            
            /* Custom Scrollbar */
            #quiz-container > div > div:last-child::-webkit-scrollbar {
                width: 6px;
            }
            
            #quiz-container > div > div:last-child::-webkit-scrollbar-track {
                background: rgba(0, 0, 0, 0.05);
                border-radius: 10px;
            }
            
            #quiz-container > div > div:last-child::-webkit-scrollbar-thumb {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 10px;
            }
            
            body.dark-mode #quiz-container > div > div:last-child::-webkit-scrollbar-track {
                background: rgba(255, 255, 255, 0.05);
            }
            
            body.dark-mode #quiz-container > div > div:last-child::-webkit-scrollbar-thumb {
                background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%);
            }
        </style>
    `;
    
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
        
        const nextBtn = document.getElementById("nextBtnContainer");
        const prevBtn = document.getElementById("prevBtn");

        // Enter for next
        if (event.key === "Enter" && nextBtn && !nextBtn.disabled) {
            event.preventDefault();
            nextQuestion();
        }

        // Arrow keys for navigation
        if (event.key === "ArrowRight" && nextBtn && !nextBtn.disabled) {
            event.preventDefault();
            nextQuestion();
        }
        if (event.key === "ArrowLeft" && prevBtn && !prevBtn.disabled) {
            event.preventDefault();
            previousQuestion();
        }

        // S for skip
        if (event.key.toLowerCase() === "s") {
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

// ===============================================
// --- Mobile Touch/Swipe Navigation ---
// ===============================================

let touchStartX = 0;
let touchEndX = 0;
let touchStartY = 0;
let touchEndY = 0;

function setupTouchNavigation() {
    const container = document.getElementById("quiz-container");
    if (!container) return;

    container.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    container.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
    }, { passive: true });
}

function handleSwipe() {
    const swipeThreshold = 50;
    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;
    
    // Check if horizontal swipe is more than vertical
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > swipeThreshold) {
        if (diffX > 0) {
            // Swipe right - previous question
            if (currentQuestionIndex > 0) {
                previousQuestion();
            }
        } else {
            // Swipe left - next question
            if (selectedAnswer !== null && currentQuestionIndex < quizSet.questions.length - 1) {
                nextQuestion();
            } else if (selectedAnswer !== null && currentQuestionIndex === quizSet.questions.length - 1) {
                showFinalResult();
            }
        }
    }
}

// Call setupTouchNavigation after quiz loads
document.addEventListener("DOMContentLoaded", function() {
    setTimeout(setupTouchNavigation, 1000);
});
