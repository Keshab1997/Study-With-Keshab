// ===============================================
// --- Day/Night Mode Toggle Section (FIXED) ---
// ===============================================

function setupModeToggle() {
    const modeToggleBtn = document.getElementById("mode-toggle");
    const body = document.body;

    function applyMode(mode) {
        if (mode === 'dark-mode') {
            body.classList.add('dark-mode');
            body.classList.remove('day-mode');
            if (modeToggleBtn) modeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            body.classList.add('day-mode');
            body.classList.remove('dark-mode');
            if (modeToggleBtn) modeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
        }
    }

    const savedMode = localStorage.getItem('quizAppMode');
    if (savedMode) {
        applyMode(savedMode);
    } else {
        applyMode('day-mode');
    }

    if (modeToggleBtn) {
        modeToggleBtn.addEventListener("click", () => {
            if (body.classList.contains('day-mode')) {
                applyMode('dark-mode');
                localStorage.setItem('quizAppMode', 'dark-mode');
            } else {
                applyMode('day-mode');
                localStorage.setItem('quizAppMode', 'day-mode');
            }
        });
    }
}


// ===============================================
// --- Core Quiz Logic Section ---
// ===============================================

let currentQuestionIndex = 0,
  selectedAnswer = null,
  score = 0,
  correctCount = 0,
  wrongCount = 0;
let correctSound = new Audio("../sounds/correct.mp3"),
  wrongSound = new Audio("../sounds/wrong.mp3");
let userAnswers = [],
  shuffledOptionsPerQuestion = [];
let timerInterval;

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function startTimer() {
  let seconds = 0;
  let minutes = 0;
  clearInterval(timerInterval);

  function updateTimer() {
    seconds++;
    if (seconds === 60) {
      seconds = 0;
      minutes++;
    }
    const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    document.getElementById("timer").textContent = formattedTime;
  }
  document.getElementById("timer").textContent = "00:00";
  timerInterval = setInterval(updateTimer, 1000);
}

function showQuestion() {
  selectedAnswer = null;
  startTimer();
  const container = document.getElementById("quiz-container");
  const q = quizSet.questions[currentQuestionIndex];
  let shuffledOptions = [...q.options];
  shuffleArray(shuffledOptions);
  shuffledOptionsPerQuestion[currentQuestionIndex] = shuffledOptions;
  const correctAnswerIndex = shuffledOptions.indexOf(q.options[q.answer]);

  container.innerHTML = `
    <div class="mb-4">
      <h2 class="text-xl md:text-2xl font-semibold mb-6 text-center">প্রশ্ন ${currentQuestionIndex + 1}: ${q.question}</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${shuffledOptions.map((opt, i) => `
          <button class="option-btn" onclick="selectAnswer(${i}, ${correctAnswerIndex})" data-index="${i}">
            <span class="option-prefix">${String.fromCharCode(65 + i)}.</span>
            <span>${opt}</span>
          </button>
        `).join("")}
      </div>
    </div>
    <button id="nextBtn" onclick="nextQuestion()" class="action-btn w-full mt-6" disabled>পরবর্তী প্রশ্ন</button>`;
}

window.selectAnswer = function (selectedIndex, correctBtnIndex) {
  if (selectedAnswer !== null) return;
  clearInterval(timerInterval);
  selectedAnswer = selectedIndex;
  document.querySelectorAll(".option-btn").forEach((btn) => (btn.disabled = true));
  
  const correctBtn = document.querySelector(`[data-index="${correctBtnIndex}"]`);
  correctBtn.classList.add("correct");

  if (selectedIndex !== correctBtnIndex) {
    const wrongBtn = document.querySelector(`[data-index="${selectedIndex}"]`);
    wrongBtn.classList.add("incorrect");
    wrongCount++;
    wrongSound.play();
  } else {
    score++;
    correctCount++;
    correctSound.play();
  }
  userAnswers[currentQuestionIndex] = selectedIndex;
  document.getElementById("correct-count").textContent = `✔️ ${correctCount}`;
  document.getElementById("wrong-count").textContent = `❌ ${wrongCount}`;
  document.getElementById("nextBtn").disabled = false;
  document.getElementById("nextBtn").focus();
};

function nextQuestion() {
  if (selectedAnswer === null) return;
  currentQuestionIndex++;
  selectedAnswer = null;
  if (currentQuestionIndex < quizSet.questions.length) {
    showQuestion();
  } else {
    showFinalResult();
  }
}

// ### UPDATED FUNCTION ###
function showFinalResult() {
  clearInterval(timerInterval);
  
  // --- NEW: Call the function to save the score to Firebase silently ---
  // This will only work if an admin is logged in.
  saveScoreToFirebase(correctCount, quizSet.questions.length);
  // -------------------------------------------------------------------

  const container = document.getElementById("quiz-container");
  container.innerHTML = `
    <div class="text-center space-y-5">
      <h2 class="text-3xl font-bold text-green-600">🎉 কুইজ শেষ!</h2>
      <p class="text-xl">আপনার স্কোর: <strong class="text-blue-600">${correctCount}</strong> / ${quizSet.questions.length}</p>
      <div class="flex flex-wrap justify-center gap-3">
        <button onclick="showReview()" class="action-btn">রিভিউ দেখুন</button>
        <button onclick="saveScore()" class="action-btn green">লিডারবোর্ডে যোগ করুন</button>
        <button onclick="location.reload()" class="action-btn gray">🔁 আবার দিন</button>
      </div>
    </div>`;
}

function showReview() {
  const container = document.getElementById("quiz-container");
  let reviewHTML = `<div class="space-y-4"><h2 class="text-2xl font-bold text-center text-blue-700 mb-4">📚 কুইজ রিভিউ</h2>`;
  for (let i = 0; i < quizSet.questions.length; i++) {
    const q = quizSet.questions[i];
    const userAnswerIndex = userAnswers[i];
    const shuffledOptions = shuffledOptionsPerQuestion[i];
    const correctAnswerIndex = shuffledOptions.indexOf(q.options[q.answer]);
    let isCorrect = userAnswerIndex === correctAnswerIndex;
    let cardClass = isCorrect ? "review-correct" : "review-incorrect";
    
    reviewHTML += `
      <div class="review-card text-left ${cardClass}">
        <h3 class="font-semibold mb-2">📝 প্রশ্ন ${i + 1}: ${q.question}</h3>
        <p><strong>সঠিক উত্তর:</strong> ${q.options[q.answer]}</p>`;
    
    if (userAnswerIndex !== undefined) {
      reviewHTML += `<p><strong>আপনার উত্তর:</strong> <span class="font-bold ${isCorrect ? 'text-green-700' : 'text-red-700'}">${shuffledOptions[userAnswerIndex]}</span></p>`;
    }
    reviewHTML += `<p class="mt-2"><strong>ব্যাখ্যা:</strong> ${q.explanation || "কোনো ব্যাখ্যা নেই"}</p></div>`;
  }
  reviewHTML += `<div class="text-center mt-6"><button onclick="location.reload()" class="action-btn gray">🔁 আবার দিন</button></div></div>`;
  container.innerHTML = reviewHTML;
}

// ===============================================
// --- Advanced Leaderboard Section (localStorage based) ---
// ===============================================

function saveScore() {
    let name = prompt("লিডারবোর্ডে যোগ করার জন্য আপনার নাম দিন:", localStorage.getItem("quizUserName") || "");
    if (name && name.trim() !== "") {
        const userName = name.trim();
        localStorage.setItem("quizUserName", userName);
        const comprehensiveLeaderboard = JSON.parse(localStorage.getItem('comprehensiveLeaderboard') || '{}');

        if (!comprehensiveLeaderboard[userName]) {
            comprehensiveLeaderboard[userName] = { totalScore: 0, scores: {} };
        }

        const quizSetName = quizSet.name;
        
        const oldScoreData = comprehensiveLeaderboard[userName].scores[quizSetName];
        if (!oldScoreData || correctCount > oldScoreData.score) {
             comprehensiveLeaderboard[userName].scores[quizSetName] = { 
                score: correctCount, 
                total: quizSet.questions.length 
             };
        }

        let total = 0;
        for (const scoreData of Object.values(comprehensiveLeaderboard[userName].scores)) {
            total += scoreData.score;
        }
        comprehensiveLeaderboard[userName].totalScore = total;

        localStorage.setItem('comprehensiveLeaderboard', JSON.stringify(comprehensiveLeaderboard));
        showLeaderboard();
    }
}

function showLeaderboard() {
    const comprehensiveLeaderboard = JSON.parse(localStorage.getItem('comprehensiveLeaderboard') || '{}');
    const sortedLeaderboard = Object.entries(comprehensiveLeaderboard)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.totalScore - a.totalScore)
        .slice(0, 10);

    let leaderboardHTML = `<div class="text-center space-y-4"><h2 class="text-2xl font-bold text-purple-700">🏆লিডারবোর্ড🏆</h2>`;
    if (sortedLeaderboard.length === 0) {
        leaderboardHTML += `<p class="text-gray-500">লিডারবোর্ড এখনো খালি!</p>`;
    } else {
        leaderboardHTML += `<ol class="leaderboard-list">`;
        sortedLeaderboard.forEach((user, index) => {
            leaderboardHTML += `<li class="leaderboard-item"><div class="main-score"><span>${index + 1}. ${user.name}</span><strong>মোট স্কোর: ${user.totalScore}</strong></div><ul class="details-list">`;
            for (const [setName, scoreData] of Object.entries(user.scores)) {
                leaderboardHTML += `<li>${setName}: <strong>${scoreData.score}</strong></li>`;
            }
            leaderboardHTML += `</ul></li>`;
        });
        leaderboardHTML += `</ol>`;
    }
    leaderboardHTML += `<div class="flex flex-wrap justify-center gap-3 mt-6"><button onclick="showReview()" class="action-btn green">📖 রিভিউ দেখুন</button><button onclick="resetLeaderboard()" class="action-btn gray">লিডারবোর্ড রিসেট করুন</button><button onclick="location.reload()" class="action-btn">🔁 আবার খেলুন</button></div></div>`;
    document.getElementById("quiz-container").innerHTML = leaderboardHTML;
}

function resetLeaderboard() {
    if (confirm("আপনি কি সম্পূর্ণ লিডারবোর্ড মুছে ফেলতে চান? এটি সব ব্যবহারকারীর ডেটা মুছে দেবে।")) {
        localStorage.removeItem("comprehensiveLeaderboard");
        showLeaderboard();
    }
}

// ===============================================
// --- NEW: Firebase Score Saving Section ---
// ===============================================

async function saveScoreToFirebase(finalScore, totalQuestions) {
    // Check if Firebase is initialized and if a user is logged in
    if (typeof firebase === 'undefined' || !firebase.auth().currentUser) {
        console.log("Firebase not ready or no user logged in. Score not saved to Firebase.");
        return;
    }

    const user = firebase.auth().currentUser;

    try {
        const quizName = typeof quizSet !== "undefined" ? quizSet.name : "Unknown Quiz";
        await firebase.firestore().collection("quiz_scores").add({
            userId: user.uid,
            email: user.email,
            score: finalScore,
            totalQuestions: totalQuestions,
            quizName: quizName,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log(`Firebase: Score (${finalScore}/${totalQuestions}) for '${quizName}' saved successfully for admin.`);
    } catch (error) {
        console.error("Firebase: Error saving score:", error);
    }
}

// ===============================================
// --- Keyboard Navigation Section ---
// ===============================================

function setupKeyboard() {
  document.addEventListener("keydown", function (event) {
    if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
        return;
    }
    
    if (event.key === "Enter" && document.getElementById("nextBtn") && !document.getElementById("nextBtn").disabled) {
      nextQuestion();
    }
    if (selectedAnswer === null) {
      const keyMap = {'1': 0, '2': 1, '3': 2, '4': 3, 'a': 0, 'b': 1, 'c': 2, 'd': 3};
      const lowerCaseKey = event.key.toLowerCase();
      if (keyMap.hasOwnProperty(lowerCaseKey)) {
        event.preventDefault();
        const buttons = document.querySelectorAll(".option-btn");
        const index = keyMap[lowerCaseKey];
        if (index < buttons.length) {
          buttons[index].click();
        }
      }
    }
  });
}

// ===============================================
// --- App Initialization ---
// ===============================================

document.addEventListener("DOMContentLoaded", () => {
  setupModeToggle();
  if (typeof quizSet !== "undefined") {
    document.getElementById("quiz-title").textContent = quizSet.name;
    shuffleArray(quizSet.questions);
    showQuestion();
    setupKeyboard();
  } else {
    document.getElementById("quiz-container").innerHTML = "<p class='text-red-600 font-bold text-center'>দুঃখিত, প্রশ্ন সেট লোড করা যায়নি।</p>";
  }
});