document.addEventListener("DOMContentLoaded", () => {
    // --- গ্লোবাল ভেরিয়েবল ---
    let questions = [];
    let userAnswers = [];
    let currentQuestionIndex = 0;
    let timerInterval;
    let remainingTime;
    let isPaused = false;
    let SET_NAME = ""; // পরীক্ষার আসল নাম এখানে সেট হবে
    let progressKey = "";

    // --- Firebase ইনিশিয়ালাইজেশন ---
    const db = firebase.firestore();

    // --- UI এলিমেন্ট ---
    const selectionContainer = document.getElementById("selection-container");
    const loadingSpinner = document.getElementById("loading-spinner");
    const examContainer = document.getElementById("exam-container");
    const userDisplayNameEl = document.getElementById("user-display-name");
    const logoEl = document.querySelector(".logo");

    const questionPaperBtn = document.getElementById("question-paper-btn");
    const instructionsBtn = document.getElementById("instructions-btn");
    const qpModal = document.getElementById("question-paper-modal");
    const instructionsModal = document.getElementById("instructions-modal");
    const closeQpModalBtn = document.getElementById("close-qp-modal");
    const closeInstructionsModalBtn = document.getElementById(
        "close-instructions-modal",
    );
    const qpViewContainer = document.getElementById("question-paper-view");
    const submitModal = document.getElementById("submit-modal");
    const finalSubmitBtn = document.getElementById("final-submit-btn");
    const cancelSubmitBtn = document.getElementById("cancel-submit-btn");
    const closeSubmitModalBtn = document.getElementById("close-submit-modal");

    // --- URL থেকে পরীক্ষার নাম পড়ার ফাংশন ---
    function getExamNameFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get("exam");
    }

    // --- পরীক্ষার প্রশ্ন ফাইল লোড করার ফাংশন ---
    function loadQuestionScript(examName) {
        return new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = `exams/${examName}_questions.js`;

            script.onload = () => {
                if (
                    typeof quizData !== "undefined" &&
                    Array.isArray(quizData)
                ) {
                    questions = quizData;
                    const urlParams = new URLSearchParams(window.location.search);
                    const chapterFromURL = urlParams.get("chapter");

                    // === পরিবর্তন: পরীক্ষার নাম (SET_NAME) এবং progressKey সঠিকভাবে সেট করা হচ্ছে ===
                    SET_NAME = chapterFromURL || "CBT Exam";
                    logoEl.textContent = SET_NAME;
                    progressKey = `examProgress_${examName}_${(chapterFromURL || "").replace(/\s/g, "_")}`;
                    resolve();
                } else {
                    reject(
                        `quizData is not defined in ${examName}_questions.js`,
                    );
                }
            };
            script.onerror = () =>
                reject(`Could not load script at path: ${script.src}`);
            document.body.appendChild(script);
        
    window.generateCertificateFromResult = function() {
        const user = firebase.auth().currentUser;
        const userName = user ? (user.displayName || 'Student') : 'Student';
        const urlParams = new URLSearchParams(window.location.search);
        const examName = urlParams.get('chapter') || 'CBT Exam';
        
        const scoreText = document.querySelector('.result-score').textContent;
        const score = parseInt(scoreText.split('/')[0].trim());
        const total = parseInt(scoreText.split('/')[1].trim());
        const percentage = ((score / total) * 100).toFixed(1);
        const examDate = new Date().toLocaleDateString('en-GB');
        
        generateCertificate({
            userName: userName,
            examName: examName,
            score: score,
            totalQuestions: total,
            percentage: percentage,
            date: examDate
        });
    };
});
    }

    // --- মূল লজিক (চূড়ান্ত এবং ডায়নামিক ভার্সন) ---
    const examName = getExamNameFromURL();
    if (examName) {
        selectionContainer.style.display = "none";
        loadingSpinner.classList.remove("hidden");
        firebase.auth().onAuthStateChanged(async (user) => {
            if (user) {
                userDisplayNameEl.textContent = user.displayName || "User";
                try {
                    await loadQuestionScript(examName);
                    initializeApp();
                } catch (error) {
                    loadingSpinner.innerHTML = `<p>Error loading exam. Please check the exam code and file path.</p><p style="font-size: 0.8em; color: #7f8c8d;">${error}</p>`;
                    console.error(error);
                }
            } else {
                alert("এই পরীক্ষা দিতে হলে আপনাকে লগইন করতে হবে!");
                window.location.href = `../login.html?redirect=${encodeURIComponent(window.location.href)}`;
            }
        
    window.generateCertificateFromResult = function() {
        const user = firebase.auth().currentUser;
        const userName = user ? (user.displayName || 'Student') : 'Student';
        const urlParams = new URLSearchParams(window.location.search);
        const examName = urlParams.get('chapter') || 'CBT Exam';
        
        const scoreText = document.querySelector('.result-score').textContent;
        const score = parseInt(scoreText.split('/')[0].trim());
        const total = parseInt(scoreText.split('/')[1].trim());
        const percentage = ((score / total) * 100).toFixed(1);
        const examDate = new Date().toLocaleDateString('en-GB');
        
        generateCertificate({
            userName: userName,
            examName: examName,
            score: score,
            totalQuestions: total,
            percentage: percentage,
            date: examDate
        });
    };
});
    } else {
        selectionContainer.style.display = "flex";
        loadingSpinner.classList.add("hidden");
        examContainer.classList.add("hidden");

        document
            .getElementById("start-exam-btn")
            .addEventListener("click", () => {
                const examSelect = document.getElementById("exam-select");
                const selectedOption = examSelect.options[examSelect.selectedIndex];
                const selectedExam = selectedOption.value;
                const chapterName = selectedOption.textContent;

                if (selectedExam && chapterName) {
                    window.location.href = `index.html?exam=${selectedExam}&chapter=${encodeURIComponent(chapterName)}`;
                } else {
                    alert("অনুগ্রহ করে একটি পরীক্ষা নির্বাচন করুন।");
                }
            
    window.generateCertificateFromResult = function() {
        const user = firebase.auth().currentUser;
        const userName = user ? (user.displayName || 'Student') : 'Student';
        const urlParams = new URLSearchParams(window.location.search);
        const examName = urlParams.get('chapter') || 'CBT Exam';
        
        const scoreText = document.querySelector('.result-score').textContent;
        const score = parseInt(scoreText.split('/')[0].trim());
        const total = parseInt(scoreText.split('/')[1].trim());
        const percentage = ((score / total) * 100).toFixed(1);
        const examDate = new Date().toLocaleDateString('en-GB');
        
        generateCertificate({
            userName: userName,
            examName: examName,
            score: score,
            totalQuestions: total,
            percentage: percentage,
            date: examDate
        });
    };
});
    }

    function initializeApp() {
        if (!questions || questions.length === 0) {
            loadingSpinner.innerHTML = "<p>No questions found.</p>";
            return;
        }
        if (!loadProgress()) {
            resetExamState();
        }
        addEventListeners();
        renderQuestion();
        createPalette();
        startTimer(remainingTime);
        loadingSpinner.classList.add("hidden");
        examContainer.classList.remove("hidden");
    }

    function resetExamState() {
        currentQuestionIndex = 0;
        userAnswers = questions.map((q, index) => ({
            qNo: index + 1,
            selectedOption: null,
            status: "not-visited",
        }));
        remainingTime = (questions[0]?.totalTimeMinutes || 90) * 60;
        isPaused = false;
        localStorage.removeItem(progressKey);
    }

    function addEventListeners() {
        document.getElementById("save-next-btn").addEventListener("click", () => handleButtonClick("saveNext"));
        document.getElementById("mark-review-btn").addEventListener("click", () => handleButtonClick("markReview"));
        document.getElementById("clear-response-btn").addEventListener("click", () => handleButtonClick("clear"));
        document.getElementById("submit-btn").addEventListener("click", () => handleButtonClick("submit"));
        finalSubmitBtn.addEventListener("click", showFinalResult);
        closeSubmitModalBtn.addEventListener("click", () => { submitModal.style.display = "none"; 
    window.generateCertificateFromResult = function() {
        const user = firebase.auth().currentUser;
        const userName = user ? (user.displayName || 'Student') : 'Student';
        const urlParams = new URLSearchParams(window.location.search);
        const examName = urlParams.get('chapter') || 'CBT Exam';
        
        const scoreText = document.querySelector('.result-score').textContent;
        const score = parseInt(scoreText.split('/')[0].trim());
        const total = parseInt(scoreText.split('/')[1].trim());
        const percentage = ((score / total) * 100).toFixed(1);
        const examDate = new Date().toLocaleDateString('en-GB');
        
        generateCertificate({
            userName: userName,
            examName: examName,
            score: score,
            totalQuestions: total,
            percentage: percentage,
            date: examDate
        });
    };
});
        cancelSubmitBtn.addEventListener("click", () => { submitModal.style.display = "none"; 
    window.generateCertificateFromResult = function() {
        const user = firebase.auth().currentUser;
        const userName = user ? (user.displayName || 'Student') : 'Student';
        const urlParams = new URLSearchParams(window.location.search);
        const examName = urlParams.get('chapter') || 'CBT Exam';
        
        const scoreText = document.querySelector('.result-score').textContent;
        const score = parseInt(scoreText.split('/')[0].trim());
        const total = parseInt(scoreText.split('/')[1].trim());
        const percentage = ((score / total) * 100).toFixed(1);
        const examDate = new Date().toLocaleDateString('en-GB');
        
        generateCertificate({
            userName: userName,
            examName: examName,
            score: score,
            totalQuestions: total,
            percentage: percentage,
            date: examDate
        });
    };
});
        document.getElementById("pause-btn").addEventListener("click", togglePause);
        document.getElementById("resume-btn-overlay").addEventListener("click", togglePause);
        document.getElementById("restart-btn").addEventListener("click", () => {
            if (confirm("আপনি কি পরীক্ষাটি নতুন করে শুরু করতে চান?")) {
                resetExamState();
                location.reload();
            }
        
    window.generateCertificateFromResult = function() {
        const user = firebase.auth().currentUser;
        const userName = user ? (user.displayName || 'Student') : 'Student';
        const urlParams = new URLSearchParams(window.location.search);
        const examName = urlParams.get('chapter') || 'CBT Exam';
        
        const scoreText = document.querySelector('.result-score').textContent;
        const score = parseInt(scoreText.split('/')[0].trim());
        const total = parseInt(scoreText.split('/')[1].trim());
        const percentage = ((score / total) * 100).toFixed(1);
        const examDate = new Date().toLocaleDateString('en-GB');
        
        generateCertificate({
            userName: userName,
            examName: examName,
            score: score,
            totalQuestions: total,
            percentage: percentage,
            date: examDate
        });
    };
});
        const togglePaletteBtn = document.getElementById("toggle-palette-btn"),
            backToQuestionBtn = document.getElementById("back-to-question-btn"),
            examBody = document.getElementById("exam-body");
        if (togglePaletteBtn && backToQuestionBtn) {
            togglePaletteBtn.addEventListener("click", () => examBody.classList.add("show-palette"));
            backToQuestionBtn.addEventListener("click", () => examBody.classList.remove("show-palette"));
        }
        questionPaperBtn.addEventListener("click", () => { displayQuestionPaper(); qpModal.style.display = "flex"; 
    window.generateCertificateFromResult = function() {
        const user = firebase.auth().currentUser;
        const userName = user ? (user.displayName || 'Student') : 'Student';
        const urlParams = new URLSearchParams(window.location.search);
        const examName = urlParams.get('chapter') || 'CBT Exam';
        
        const scoreText = document.querySelector('.result-score').textContent;
        const score = parseInt(scoreText.split('/')[0].trim());
        const total = parseInt(scoreText.split('/')[1].trim());
        const percentage = ((score / total) * 100).toFixed(1);
        const examDate = new Date().toLocaleDateString('en-GB');
        
        generateCertificate({
            userName: userName,
            examName: examName,
            score: score,
            totalQuestions: total,
            percentage: percentage,
            date: examDate
        });
    };
});
        instructionsBtn.addEventListener("click", () => { instructionsModal.style.display = "flex"; 
    window.generateCertificateFromResult = function() {
        const user = firebase.auth().currentUser;
        const userName = user ? (user.displayName || 'Student') : 'Student';
        const urlParams = new URLSearchParams(window.location.search);
        const examName = urlParams.get('chapter') || 'CBT Exam';
        
        const scoreText = document.querySelector('.result-score').textContent;
        const score = parseInt(scoreText.split('/')[0].trim());
        const total = parseInt(scoreText.split('/')[1].trim());
        const percentage = ((score / total) * 100).toFixed(1);
        const examDate = new Date().toLocaleDateString('en-GB');
        
        generateCertificate({
            userName: userName,
            examName: examName,
            score: score,
            totalQuestions: total,
            percentage: percentage,
            date: examDate
        });
    };
});
        closeQpModalBtn.addEventListener("click", () => { qpModal.style.display = "none"; 
    window.generateCertificateFromResult = function() {
        const user = firebase.auth().currentUser;
        const userName = user ? (user.displayName || 'Student') : 'Student';
        const urlParams = new URLSearchParams(window.location.search);
        const examName = urlParams.get('chapter') || 'CBT Exam';
        
        const scoreText = document.querySelector('.result-score').textContent;
        const score = parseInt(scoreText.split('/')[0].trim());
        const total = parseInt(scoreText.split('/')[1].trim());
        const percentage = ((score / total) * 100).toFixed(1);
        const examDate = new Date().toLocaleDateString('en-GB');
        
        generateCertificate({
            userName: userName,
            examName: examName,
            score: score,
            totalQuestions: total,
            percentage: percentage,
            date: examDate
        });
    };
});
        closeInstructionsModalBtn.addEventListener("click", () => { instructionsModal.style.display = "none"; 
    window.generateCertificateFromResult = function() {
        const user = firebase.auth().currentUser;
        const userName = user ? (user.displayName || 'Student') : 'Student';
        const urlParams = new URLSearchParams(window.location.search);
        const examName = urlParams.get('chapter') || 'CBT Exam';
        
        const scoreText = document.querySelector('.result-score').textContent;
        const score = parseInt(scoreText.split('/')[0].trim());
        const total = parseInt(scoreText.split('/')[1].trim());
        const percentage = ((score / total) * 100).toFixed(1);
        const examDate = new Date().toLocaleDateString('en-GB');
        
        generateCertificate({
            userName: userName,
            examName: examName,
            score: score,
            totalQuestions: total,
            percentage: percentage,
            date: examDate
        });
    };
});
        window.addEventListener("click", (event) => {
            if (event.target == qpModal) qpModal.style.display = "none";
            if (event.target == instructionsModal) instructionsModal.style.display = "none";
            if (event.target == submitModal) submitModal.style.display = "none";
        
    window.generateCertificateFromResult = function() {
        const user = firebase.auth().currentUser;
        const userName = user ? (user.displayName || 'Student') : 'Student';
        const urlParams = new URLSearchParams(window.location.search);
        const examName = urlParams.get('chapter') || 'CBT Exam';
        
        const scoreText = document.querySelector('.result-score').textContent;
        const score = parseInt(scoreText.split('/')[0].trim());
        const total = parseInt(scoreText.split('/')[1].trim());
        const percentage = ((score / total) * 100).toFixed(1);
        const examDate = new Date().toLocaleDateString('en-GB');
        
        generateCertificate({
            userName: userName,
            examName: examName,
            score: score,
            totalQuestions: total,
            percentage: percentage,
            date: examDate
        });
    };
});
        document.addEventListener("keydown", handleKeyPress);
    }

    function handleButtonClick(action) {
        const currentAns = userAnswers[currentQuestionIndex];
        switch (action) {
            case "saveNext": if (currentAns.selectedOption !== null) currentAns.status = "answered"; goToNextQuestion(); break;
            case "markReview": currentAns.status = currentAns.selectedOption !== null ? "marked-answered" : "marked"; goToNextQuestion(); break;
            case "clear": currentAns.selectedOption = null; currentAns.status = "not-answered"; renderQuestion(); updatePalette(); saveProgress(); break;
            case "submit":
                const totalQuestions = questions.length;
                const answered = userAnswers.filter((ans) => ans.status === "answered" || ans.status === "marked-answered").length;
                const notAnswered = userAnswers.filter((ans) => ans.status === "not-answered").length;
                const markedForReview = userAnswers.filter((ans) => ans.status === "marked").length;
                const visited = answered + notAnswered + markedForReview;
                const notVisited = totalQuestions - visited;
                document.getElementById("review-summary-body").innerHTML = `<tr><td data-label="Section">CBT</td><td data-label="Total Questions">${totalQuestions}</td><td data-label="Answered">${answered}</td><td data-label="Not Answered">${notAnswered}</td><td data-label="Marked for Review">${markedForReview}</td><td data-label="Not Visited">${notVisited}</td></tr>`;
                submitModal.style.display = "flex";
                break;
        }
    }

    function saveProgress() { const progress = { answers: userAnswers, index: currentQuestionIndex, time: remainingTime }; localStorage.setItem(progressKey, JSON.stringify(progress)); }
    function loadProgress() {
        const savedProgress = localStorage.getItem(progressKey);
        if (savedProgress) { const progress = JSON.parse(savedProgress); userAnswers = progress.answers; currentQuestionIndex = progress.index; remainingTime = progress.time; return true; }
        return false;
    }

    function togglePause() {
        isPaused = !isPaused;
        const pauseIcon = document.querySelector("#pause-btn i");
        if (isPaused) { clearInterval(timerInterval); document.getElementById("pause-overlay").classList.remove("hidden"); if (pauseIcon) pauseIcon.className = "fas fa-play"; } 
        else { startTimer(remainingTime); document.getElementById("pause-overlay").classList.add("hidden"); if (pauseIcon) pauseIcon.className = "fas fa-pause"; }
    }

    function renderQuestion() {
        const questionNumberEl = document.getElementById("question-number"), questionTextEl = document.getElementById("question-text"), optionsContainerEl = document.getElementById("options-container");
        if (currentQuestionIndex >= questions.length) return;
        const currentAnswer = userAnswers[currentQuestionIndex];
        if (currentAnswer.status === "not-visited") currentAnswer.status = "not-answered";
        const q = questions[currentQuestionIndex];
        questionNumberEl.textContent = `Question No. ${currentQuestionIndex + 1}`;
        questionTextEl.innerHTML = q.questionText;
        optionsContainerEl.innerHTML = "";
        q.options.forEach((option, index) => {
            const isChecked = currentAnswer.selectedOption === index;
            const optionId = `option-${index}`;
            optionsContainerEl.innerHTML += `<label for="${optionId}" class="option ${isChecked ? "selected" : ""}"><input type="radio" id="${optionId}" name="option" value="${index}" ${isChecked ? "checked" : ""}>${option}</label>`;
        
    window.generateCertificateFromResult = function() {
        const user = firebase.auth().currentUser;
        const userName = user ? (user.displayName || 'Student') : 'Student';
        const urlParams = new URLSearchParams(window.location.search);
        const examName = urlParams.get('chapter') || 'CBT Exam';
        
        const scoreText = document.querySelector('.result-score').textContent;
        const score = parseInt(scoreText.split('/')[0].trim());
        const total = parseInt(scoreText.split('/')[1].trim());
        const percentage = ((score / total) * 100).toFixed(1);
        const examDate = new Date().toLocaleDateString('en-GB');
        
        generateCertificate({
            userName: userName,
            examName: examName,
            score: score,
            totalQuestions: total,
            percentage: percentage,
            date: examDate
        });
    };
});
        document.querySelectorAll('input[name="option"]').forEach((radio) => {
            radio.addEventListener("change", (e) => {
                userAnswers[currentQuestionIndex].selectedOption = parseInt(e.target.value);
                document.querySelectorAll(".option").forEach((l) => l.classList.remove("selected"));
                e.target.closest("label").classList.add("selected");
                saveProgress();
            
    window.generateCertificateFromResult = function() {
        const user = firebase.auth().currentUser;
        const userName = user ? (user.displayName || 'Student') : 'Student';
        const urlParams = new URLSearchParams(window.location.search);
        const examName = urlParams.get('chapter') || 'CBT Exam';
        
        const scoreText = document.querySelector('.result-score').textContent;
        const score = parseInt(scoreText.split('/')[0].trim());
        const total = parseInt(scoreText.split('/')[1].trim());
        const percentage = ((score / total) * 100).toFixed(1);
        const examDate = new Date().toLocaleDateString('en-GB');
        
        generateCertificate({
            userName: userName,
            examName: examName,
            score: score,
            totalQuestions: total,
            percentage: percentage,
            date: examDate
        });
    };
});
        
    window.generateCertificateFromResult = function() {
        const user = firebase.auth().currentUser;
        const userName = user ? (user.displayName || 'Student') : 'Student';
        const urlParams = new URLSearchParams(window.location.search);
        const examName = urlParams.get('chapter') || 'CBT Exam';
        
        const scoreText = document.querySelector('.result-score').textContent;
        const score = parseInt(scoreText.split('/')[0].trim());
        const total = parseInt(scoreText.split('/')[1].trim());
        const percentage = ((score / total) * 100).toFixed(1);
        const examDate = new Date().toLocaleDateString('en-GB');
        
        generateCertificate({
            userName: userName,
            examName: examName,
            score: score,
            totalQuestions: total,
            percentage: percentage,
            date: examDate
        });
    };
});
        updatePalette();
    }

    function createPalette() {
        const questionPaletteEl = document.getElementById("question-palette"), examBody = document.getElementById("exam-body");
        questionPaletteEl.innerHTML = "";
        questions.forEach((q, index) => {
            const btn = document.createElement("button");
            btn.textContent = index + 1;
            btn.className = "palette-btn";
            btn.dataset.index = index;
            btn.addEventListener("click", () => {
                currentQuestionIndex = index;
                renderQuestion();
                saveProgress();
                if (window.innerWidth <= 992) { examBody.classList.remove("show-palette"); }
            
    window.generateCertificateFromResult = function() {
        const user = firebase.auth().currentUser;
        const userName = user ? (user.displayName || 'Student') : 'Student';
        const urlParams = new URLSearchParams(window.location.search);
        const examName = urlParams.get('chapter') || 'CBT Exam';
        
        const scoreText = document.querySelector('.result-score').textContent;
        const score = parseInt(scoreText.split('/')[0].trim());
        const total = parseInt(scoreText.split('/')[1].trim());
        const percentage = ((score / total) * 100).toFixed(1);
        const examDate = new Date().toLocaleDateString('en-GB');
        
        generateCertificate({
            userName: userName,
            examName: examName,
            score: score,
            totalQuestions: total,
            percentage: percentage,
            date: examDate
        });
    };
});
            questionPaletteEl.appendChild(btn);
        
    window.generateCertificateFromResult = function() {
        const user = firebase.auth().currentUser;
        const userName = user ? (user.displayName || 'Student') : 'Student';
        const urlParams = new URLSearchParams(window.location.search);
        const examName = urlParams.get('chapter') || 'CBT Exam';
        
        const scoreText = document.querySelector('.result-score').textContent;
        const score = parseInt(scoreText.split('/')[0].trim());
        const total = parseInt(scoreText.split('/')[1].trim());
        const percentage = ((score / total) * 100).toFixed(1);
        const examDate = new Date().toLocaleDateString('en-GB');
        
        generateCertificate({
            userName: userName,
            examName: examName,
            score: score,
            totalQuestions: total,
            percentage: percentage,
            date: examDate
        });
    };
});
    }

    function updatePalette() {
        document.querySelectorAll(".palette-btn").forEach((btn) => {
            const index = parseInt(btn.dataset.index);
            btn.className = "palette-btn " + userAnswers[index].status;
            if (index === currentQuestionIndex) btn.classList.add("current");
        
    window.generateCertificateFromResult = function() {
        const user = firebase.auth().currentUser;
        const userName = user ? (user.displayName || 'Student') : 'Student';
        const urlParams = new URLSearchParams(window.location.search);
        const examName = urlParams.get('chapter') || 'CBT Exam';
        
        const scoreText = document.querySelector('.result-score').textContent;
        const score = parseInt(scoreText.split('/')[0].trim());
        const total = parseInt(scoreText.split('/')[1].trim());
        const percentage = ((score / total) * 100).toFixed(1);
        const examDate = new Date().toLocaleDateString('en-GB');
        
        generateCertificate({
            userName: userName,
            examName: examName,
            score: score,
            totalQuestions: total,
            percentage: percentage,
            date: examDate
        });
    };
});
    }

    function startTimer(duration) {
        remainingTime = duration;
        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            if (--remainingTime < 0) { clearInterval(timerInterval); alert("Time's up!"); showFinalResult(); return; }
            saveProgress();
            const h = String(Math.floor(remainingTime / 3600)).padStart(2, "0"), m = String(Math.floor((remainingTime % 3600) / 60)).padStart(2, "0"), s = String(remainingTime % 60).padStart(2, "0");
            document.getElementById("timer").textContent = `${h}:${m}:${s}`;
        }, 1000);
    }

    function goToNextQuestion() {
        if (currentQuestionIndex < questions.length - 1) { currentQuestionIndex++; renderQuestion(); saveProgress(); } 
        else { alert("এটিই শেষ প্রশ্ন। আপনি এখন পরীক্ষাটি জমা দিতে পারেন।"); }
    }

    function showFinalResult() {
        clearInterval(timerInterval);
        submitModal.style.display = "none";
        localStorage.removeItem(progressKey);

        let correctCount = 0, wrongCount = 0;
        userAnswers.forEach((ans, index) => {
            if (ans.status === "answered" || ans.status === "marked-answered") {
                if (ans.selectedOption === questions[index].answer) correctCount++;
                else wrongCount++;
            }
        
    window.generateCertificateFromResult = function() {
        const user = firebase.auth().currentUser;
        const userName = user ? (user.displayName || 'Student') : 'Student';
        const urlParams = new URLSearchParams(window.location.search);
        const examName = urlParams.get('chapter') || 'CBT Exam';
        
        const scoreText = document.querySelector('.result-score').textContent;
        const score = parseInt(scoreText.split('/')[0].trim());
        const total = parseInt(scoreText.split('/')[1].trim());
        const percentage = ((score / total) * 100).toFixed(1);
        const examDate = new Date().toLocaleDateString('en-GB');
        
        generateCertificate({
            userName: userName,
            examName: examName,
            score: score,
            totalQuestions: total,
            percentage: percentage,
            date: examDate
        });
    };
});

        const totalQuestions = questions.length;
        // === পরিবর্তন: nonCorrectCount সঠিকভাবে গণনা করা হচ্ছে ===
        const nonCorrectCount = totalQuestions - correctCount; // (ভুল + উত্তর না দেওয়া)
        const attemptedCount = correctCount + wrongCount;
        const unansweredCount = totalQuestions - attemptedCount;
        const positiveMarks = correctCount * 1;
        const negativeMarks = wrongCount * (1 / 3);
        const finalScore = positiveMarks - negativeMarks;
        const accuracy = attemptedCount > 0 ? (correctCount / attemptedCount) * 100 : 0;

        // === পরিবর্তন: saveQuizResult কে সঠিক প্যারামিটার দিয়ে কল করা হচ্ছে ===
        saveQuizResult(SET_NAME, correctCount, nonCorrectCount, totalQuestions);

        const container = document.getElementById("exam-container");
        container.innerHTML = `<div class="result-page"><div class="result-card"><h2 class="result-title"><i class="fas fa-poll"></i> পরীক্ষার ফলাফল</h2><div class="result-summary"><p class="result-score-text">আপনার চূড়ান্ত স্কোর</p><p class="result-score">${finalScore.toFixed(2)} / ${totalQuestions}</p></div><div class="stats-grid"><div class="stat-item stat-attempted"><h4>Attempted</h4><p>${attemptedCount}</p></div><div class="stat-item stat-unanswered"><h4>Unanswered</h4><p>${unansweredCount}</p></div><div class="stat-item stat-correct"><h4>Correct</h4><p>${correctCount} (+${positiveMarks.toFixed(2)})</p></div><div class="stat-item stat-wrong"><h4>Wrong</h4><p>${wrongCount} (-${negativeMarks.toFixed(2)})</p></div></div><div class="accuracy-section"><div class="accuracy-label"><span>Accuracy</span><span>${accuracy.toFixed(1)}%</span></div><div class="progress-bar"><div class="progress-fill" style="width: ${accuracy.toFixed(1)}%;"></div></div></div><div class="result-actions"><button onclick="window.generateCertificateFromResult()" class="action-btn certificate"><i class="fas fa-certificate"></i> সার্টিফিকেট ডাউনলোড</button><button onclick="showReview()" class="action-btn review"><i class="fas fa-search"></i> রিভিউ দেখুন</button><button onclick="location.reload()" class="action-btn retry"><i class="fas fa-redo"></i> আবার দিন</button><button onclick="window.location.href=\'../index.html\'" class="action-btn home"><i class="fas fa-home"></i> হোম পেজ</button></div></div></div>`;
    }

    window.showReview = function () {
        const container = document.getElementById("exam-container");
        let reviewHTML = `<div class="review-page"><h2 class="review-title"><i class="fas fa-clipboard-list"></i> পরীক্ষার রিভিউ</h2>`;
        questions.forEach((q, i) => {
            const userAnswer = userAnswers[i];
            const isCorrect = userAnswer.selectedOption === q.answer;
            const isAttempted = userAnswer.status === "answered" || userAnswer.status === "marked-answered";
            let cardClass = "", yourAnswerIcon = "";
            if (isAttempted) { cardClass = isCorrect ? "review-correct" : "review-incorrect"; yourAnswerIcon = isCorrect ? '<i class="fas fa-check-circle"></i>' : '<i class="fas fa-times-circle"></i>'; } 
            else { cardClass = "review-unanswered"; yourAnswerIcon = '<i class="far fa-circle"></i>'; }
            reviewHTML += `<div class="review-card ${cardClass}"><h3 class="review-question"><i class="fas fa-question-circle"></i> প্রশ্ন ${i + 1}: ${q.questionText}</h3><div class="review-answers-container"><p class="review-answer correct-ans"><strong><i class="fas fa-check-circle"></i> সঠিক উত্তর:</strong> <span>${q.options[q.answer]}</span></p><p class="review-answer your-ans"><strong>${yourAnswerIcon} আপনার উত্তর:</strong> <span>${userAnswer.selectedOption !== null ? q.options[userAnswer.selectedOption] : "উত্তর দেননি"}</span></p></div></div>`;
        
    window.generateCertificateFromResult = function() {
        const user = firebase.auth().currentUser;
        const userName = user ? (user.displayName || 'Student') : 'Student';
        const urlParams = new URLSearchParams(window.location.search);
        const examName = urlParams.get('chapter') || 'CBT Exam';
        
        const scoreText = document.querySelector('.result-score').textContent;
        const score = parseInt(scoreText.split('/')[0].trim());
        const total = parseInt(scoreText.split('/')[1].trim());
        const percentage = ((score / total) * 100).toFixed(1);
        const examDate = new Date().toLocaleDateString('en-GB');
        
        generateCertificate({
            userName: userName,
            examName: examName,
            score: score,
            totalQuestions: total,
            percentage: percentage,
            date: examDate
        });
    };
});
        const dashboardUrl = "../index.html";
        reviewHTML += `<div class="review-footer"><a href="${dashboardUrl}" class="action-btn dashboard"><i class="fas fa-tachometer-alt"></i> ড্যাশবোর্ডে যান</a><button onclick="location.reload()" class="action-btn retry"><i class="fas fa-redo"></i> আবার দিন</button></div></div>`;
        container.innerHTML = reviewHTML;
    };

    // === ## Firebase Firestore-এ স্কোর সেভ করার লজিক (চূড়ান্ত এবং ডায়নামিক ভার্সন) ## ===
    function saveQuizResult(setName, correctCount, nonCorrectCount, totalQuestions) {
        const user = firebase.auth().currentUser;
        if (!user) { console.error("User not logged in, cannot save score."); return; }

        const urlParams = new URLSearchParams(window.location.search);
        const chapterName = urlParams.get("chapter");
        if (!chapterName) { 
            console.error("URL-এ অধ্যায়ের নাম (chapter) পাওয়া যায়নি! স্কোর সেভ করা সম্ভব নয়।"); 
            alert("ত্রুটি: URL-এ অধ্যায়ের নাম না থাকায় স্কোর সেভ করা যায়নি।");
            return; 
        }

        const db = firebase.firestore();
        const userDocRef = db.collection("users").doc(user.uid);
        const chapterKey = chapterName.replace(/\s/g, "_");
        const setKey = setName.replace(/\s/g, "_");

        db.runTransaction((transaction) => {
            return transaction.get(userDocRef).then((doc) => {
                if (!doc.exists) { console.error("User document does not exist!"); return; }
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
                    chapterData.totalWrong -= (oldSetData.totalQuestions - oldSetData.score);
                    chapterData.totalScore -= oldSetData.score;
                } else {
                    chapterData.completedQuizzesCount += 1;
                }
                chapterData.totalCorrect += correctCount;
                chapterData.totalWrong += nonCorrectCount;
                chapterData.totalScore += correctCount;
                chapterData.quiz_sets[setKey] = {
                    score: correctCount,
                    totalQuestions: totalQuestions,
                    attemptedAt: firebase.firestore.FieldValue.serverTimestamp(),
                };
                const updateData = { [`chapters.${chapterKey}`]: chapterData };
                transaction.update(userDocRef, updateData);
            
    window.generateCertificateFromResult = function() {
        const user = firebase.auth().currentUser;
        const userName = user ? (user.displayName || 'Student') : 'Student';
        const urlParams = new URLSearchParams(window.location.search);
        const examName = urlParams.get('chapter') || 'CBT Exam';
        
        const scoreText = document.querySelector('.result-score').textContent;
        const score = parseInt(scoreText.split('/')[0].trim());
        const total = parseInt(scoreText.split('/')[1].trim());
        const percentage = ((score / total) * 100).toFixed(1);
        const examDate = new Date().toLocaleDateString('en-GB');
        
        generateCertificate({
            userName: userName,
            examName: examName,
            score: score,
            totalQuestions: total,
            percentage: percentage,
            date: examDate
        });
    };
});
        }).then(() => {
            console.log(`'${chapterName}' অধ্যায়ে ফলাফল সফলভাবে সেভ হয়েছে!`);
        }).catch((error) => {
            console.error("CBT স্কোর সেভ করতে সমস্যা হয়েছে: ", error);
            alert("দুঃখিত, আপনার ফলাফল সেভ করা যায়নি।");
        
    window.generateCertificateFromResult = function() {
        const user = firebase.auth().currentUser;
        const userName = user ? (user.displayName || 'Student') : 'Student';
        const urlParams = new URLSearchParams(window.location.search);
        const examName = urlParams.get('chapter') || 'CBT Exam';
        
        const scoreText = document.querySelector('.result-score').textContent;
        const score = parseInt(scoreText.split('/')[0].trim());
        const total = parseInt(scoreText.split('/')[1].trim());
        const percentage = ((score / total) * 100).toFixed(1);
        const examDate = new Date().toLocaleDateString('en-GB');
        
        generateCertificate({
            userName: userName,
            examName: examName,
            score: score,
            totalQuestions: total,
            percentage: percentage,
            date: examDate
        });
    };
});
    }

    function displayQuestionPaper() {
        qpViewContainer.innerHTML = "";
        questions.forEach((question, index) => {
            const questionNumber = index + 1;
            const userAnswer = userAnswers[index];
            let questionBlockHTML = `<div class="qp-question-block"><p class="qp-question-text">Q ${questionNumber}: ${question.questionText}</p>`;
            question.options.forEach((option, optionIndex) => {
                let optionClass = "qp-option";
                if (userAnswer && userAnswer.selectedOption === optionIndex) { optionClass += " qp-selected-option"; }
                questionBlockHTML += `<span class="${optionClass}">(${String.fromCharCode(65 + optionIndex)}) ${option}</span>`;
            
    window.generateCertificateFromResult = function() {
        const user = firebase.auth().currentUser;
        const userName = user ? (user.displayName || 'Student') : 'Student';
        const urlParams = new URLSearchParams(window.location.search);
        const examName = urlParams.get('chapter') || 'CBT Exam';
        
        const scoreText = document.querySelector('.result-score').textContent;
        const score = parseInt(scoreText.split('/')[0].trim());
        const total = parseInt(scoreText.split('/')[1].trim());
        const percentage = ((score / total) * 100).toFixed(1);
        const examDate = new Date().toLocaleDateString('en-GB');
        
        generateCertificate({
            userName: userName,
            examName: examName,
            score: score,
            totalQuestions: total,
            percentage: percentage,
            date: examDate
        });
    };
});
            questionBlockHTML += `</div>`;
            qpViewContainer.innerHTML += questionBlockHTML;
        
    window.generateCertificateFromResult = function() {
        const user = firebase.auth().currentUser;
        const userName = user ? (user.displayName || 'Student') : 'Student';
        const urlParams = new URLSearchParams(window.location.search);
        const examName = urlParams.get('chapter') || 'CBT Exam';
        
        const scoreText = document.querySelector('.result-score').textContent;
        const score = parseInt(scoreText.split('/')[0].trim());
        const total = parseInt(scoreText.split('/')[1].trim());
        const percentage = ((score / total) * 100).toFixed(1);
        const examDate = new Date().toLocaleDateString('en-GB');
        
        generateCertificate({
            userName: userName,
            examName: examName,
            score: score,
            totalQuestions: total,
            percentage: percentage,
            date: examDate
        });
    };
});
    }

    function handleKeyPress(event) {
        if (document.querySelector('.modal[style*="display: flex"]')) { return; }
        const key = event.key;
        if (key >= "1" && key <= "4") {
            event.preventDefault();
            const optionIndex = parseInt(key) - 1;
            const optionInputs = document.querySelectorAll('.options-container input[type="radio"]');
            if (optionInputs && optionInputs.length > optionIndex) { optionInputs[optionIndex].click(); }
        }
        if (key === "Enter") { event.preventDefault(); document.getElementById("save-next-btn").click(); }
    }

    window.generateCertificateFromResult = function() {
        const user = firebase.auth().currentUser;
        const userName = user ? (user.displayName || 'Student') : 'Student';
        const urlParams = new URLSearchParams(window.location.search);
        const examName = urlParams.get('chapter') || 'CBT Exam';
        
        const scoreText = document.querySelector('.result-score').textContent;
        const score = parseInt(scoreText.split('/')[0].trim());
        const total = parseInt(scoreText.split('/')[1].trim());
        const percentage = ((score / total) * 100).toFixed(1);
        const examDate = new Date().toLocaleDateString('en-GB');
        
        generateCertificate({
            userName: userName,
            examName: examName,
            score: score,
            totalQuestions: total,
            percentage: percentage,
            date: examDate
        });
    };
});