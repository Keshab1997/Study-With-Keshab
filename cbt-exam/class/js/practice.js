// Practice Section Logic
let currentQuestion = 0;
let score = 0;

function loadPracticeQuestion() {
    if (currentQuestion >= practiceQuestions.length) {
        showPracticeResult();
        return;
    }

    const q = practiceQuestions[currentQuestion];
    
    document.getElementById('practice-question-no').textContent = `প্রশ্ন ${q.qNo}/${practiceQuestions.length}`;
    document.getElementById('practice-question-text').textContent = q.questionText;
    
    const optionsHTML = q.options.map((opt, idx) => `
        <div class="practice-option" onclick="selectPracticeOption(${idx})">
            <input type="radio" name="practice-answer" id="opt${idx}" value="${idx}">
            <label for="opt${idx}">${opt}</label>
        </div>
    `).join('');
    
    document.getElementById('practice-options').innerHTML = optionsHTML;
    document.getElementById('practice-explanation').style.display = 'none';
    document.getElementById('practice-next-btn').style.display = 'none';
}

function selectPracticeOption(selectedIdx) {
    const q = practiceQuestions[currentQuestion];
    const isCorrect = selectedIdx === q.answer;
    
    if (isCorrect) {
        score++;
    }
    
    // Show explanation
    const explanationDiv = document.getElementById('practice-explanation');
    explanationDiv.innerHTML = `
        <div class="${isCorrect ? 'correct' : 'wrong'}">
            <strong>${isCorrect ? '✅ সঠিক!' : '❌ ভুল!'}</strong>
            <p><strong>সঠিক উত্তর:</strong> ${q.options[q.answer]}</p>
            <p><strong>ব্যাখ্যা:</strong> ${q.explanation}</p>
        </div>
    `;
    explanationDiv.style.display = 'block';
    
    // Disable options
    document.querySelectorAll('.practice-option').forEach(opt => {
        opt.style.pointerEvents = 'none';
        opt.style.opacity = '0.6';
    });
    
    // Highlight correct answer
    document.querySelectorAll('.practice-option')[q.answer].style.background = '#d4edda';
    document.querySelectorAll('.practice-option')[q.answer].style.borderColor = '#28a745';
    
    // Show next button
    document.getElementById('practice-next-btn').style.display = 'block';
}

function nextPracticeQuestion() {
    currentQuestion++;
    loadPracticeQuestion();
}

function showPracticeResult() {
    const percentage = (score / practiceQuestions.length * 100).toFixed(0);
    const passed = percentage >= 60;
    
    document.getElementById('practice-container').innerHTML = `
        <div class="practice-result">
            <h2>${passed ? '🎉 অসাধারণ!' : '📚 আরো চেষ্টা করো!'}</h2>
            <div class="result-stats">
                <p><strong>মোট প্রশ্ন:</strong> ${practiceQuestions.length}</p>
                <p><strong>সঠিক উত্তর:</strong> ${score}</p>
                <p><strong>ভুল উত্তর:</strong> ${practiceQuestions.length - score}</p>
                <p class="percentage ${passed ? 'pass' : 'fail'}"><strong>শতাংশ:</strong> ${percentage}%</p>
            </div>
            <div class="result-actions">
                <button onclick="restartPractice()" class="btn-primary">
                    <i class="fas fa-redo"></i> আবার Practice করো
                </button>
                ${passed ? '<a href="../../index.html" class="btn-cbt"><i class="fas fa-laptop"></i> CBT Exam দাও</a>' : ''}
            </div>
        </div>
    `;
}

function restartPractice() {
    currentQuestion = 0;
    score = 0;
    location.reload();
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('practice-container')) {
        loadPracticeQuestion();
    }
});
