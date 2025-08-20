document.addEventListener('DOMContentLoaded', function() {
    // --- BASIC SETUP ---
    const correctSound = new Audio('../sounds/correct.mp3');
    const wrongSound = new Audio('../sounds/wrong.mp3');
    
    // --- THEME, MODE, CLOCK & SCROLL LOGIC (UNCHANGED) ---
    const themeButtons = document.querySelectorAll('.theme-buttons button');
    const darkModeToggle = document.getElementById('darkModeToggle');
    const body = document.body;
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    const scrollToBottomBtn = document.getElementById('scrollToBottomBtn');
    const clockElement = document.getElementById('digital-clock');
    const yearSpan = document.getElementById('copyright-year');
    
    function applyTheme(theme) { body.dataset.theme = theme; localStorage.setItem('selected_theme', theme); }
    function applyMode(mode) {
        if (mode === 'dark') { body.classList.add('dark-mode'); darkModeToggle.checked = true; } 
        else { body.classList.remove('dark-mode'); darkModeToggle.checked = false; }
        localStorage.setItem('selected_mode', mode);
    }
    function updateClock() {
        if(clockElement) {
            const now = new Date();
            const options = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' };
            clockElement.textContent = now.toLocaleTimeString('en-GB', options);
        }
    }
    const savedTheme = localStorage.getItem('selected_theme');
    const savedMode = localStorage.getItem('selected_mode');
    if (savedTheme) applyTheme(savedTheme);
    if (savedMode) applyMode(savedMode);
    themeButtons.forEach(button => { button.addEventListener('click', () => { applyTheme(button.dataset.themeName); }); });
    darkModeToggle.addEventListener('change', () => { applyMode(darkModeToggle.checked ? 'dark' : 'light'); });
    window.addEventListener('scroll', () => {
        const scrollPosition = window.scrollY, windowHeight = window.innerHeight, bodyHeight = document.body.offsetHeight;
        scrollToTopBtn.style.display = (scrollPosition > 200) ? 'flex' : 'none';
        scrollToBottomBtn.style.display = (scrollPosition + windowHeight < bodyHeight - 100) ? 'flex' : 'none';
    });
    scrollToTopBtn.addEventListener('click', () => { window.scrollTo({ top: 0, behavior: 'smooth' }); });
    scrollToBottomBtn.addEventListener('click', () => { window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); });
    updateClock();
    setInterval(updateClock, 1000);
    if(yearSpan) { yearSpan.textContent = new Date().getFullYear(); }

    // --- MCQ LOGIC ---
    
    // ================== NEW CODE START ==================
    /**
     * Fisher-Yates shuffle algorithm to shuffle an array.
     * @param {Array} array The array to shuffle.
     * @returns {Array} A new shuffled array.
     */
    function shuffleArray(array) {
        const newArray = [...array]; // Create a copy to not modify the original data
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]]; // Swap elements
        }
        return newArray;
    }
    // ================== NEW CODE END ====================

    const mcqContainer = document.getElementById('mcq-container');
    const mcqSetSelector = document.getElementById('mcqSetSelector');
    const scoreTracker = document.getElementById('score-tracker');
    const mcqSetTitle = document.getElementById('mcq-set-title');

    let score = 0;
    let totalQuestionsInSet = 0;
    
    const setBoundaries = [
        { start: 0, end: 10 },   // Set 1
        { start: 10, end: 20 },  // Set 2
        { start: 20, end: 35 },  // Set 3
        { start: 35, end: 51 },  // Set 4
        { start: 51, end: 69 },  // Set 5
        { start: 69, end: 80 },  // Set 6
        { start: 80, end: 91 },  // Set 7
        { start: 91, end: 103 }, // Set 8
        { start: 103, end: 115 } // Set 9
    ];

    function generateMCQs(setNumber) {
        mcqContainer.innerHTML = '';
        score = 0;
        
        const boundaries = setBoundaries[setNumber - 1];
        const start = boundaries.start;
        const end = boundaries.end;
        
        const questionSet = mcqData.slice(start, end);

        totalQuestionsInSet = questionSet.length;
        updateScoreDisplay();

        const selectedOption = mcqSetSelector.options[mcqSetSelector.selectedIndex];
        mcqSetTitle.textContent = selectedOption.text;

        questionSet.forEach((item, index) => {
            const globalIndex = start + index;
            const questionDiv = document.createElement('div');
            questionDiv.className = 'mcq-question';
            questionDiv.id = `q-${globalIndex}`;
            
            // ================== MODIFIED CODE START ==================
            // 1. Get original options and identify the correct answer text
            const originalOptions = item.o;
            const correctAnswerText = originalOptions[item.a];

            // 2. Shuffle the options
            const shuffledOptions = shuffleArray(originalOptions);

            // 3. Find the new index of the correct answer in the shuffled array
            const newCorrectIndex = shuffledOptions.indexOf(correctAnswerText);
            
            // 4. Store the new correct index in the question element's dataset
            questionDiv.dataset.correctAnswer = newCorrectIndex;

            // 5. Generate HTML with the shuffled options
            let optionsHTML = shuffledOptions.map((option, i) => 
                `<div class="mcq-option" data-index="${i}">${String.fromCharCode(65 + i)}) ${option}</div>`
            ).join('');
            // ================== MODIFIED CODE END ==================

            questionDiv.innerHTML = `
                <h4>প্রশ্ন ${globalIndex + 1}: ${item.q}</h4>
                <div class="mcq-options">${optionsHTML}</div>
                <div class="mcq-explanation"><strong>ব্যাখ্যা:</strong> ${item.ex}</div>
            `;
            mcqContainer.appendChild(questionDiv);
        });
        setupOptionListeners();
        setupIntersectionObserver();
    }
    
    function updateScoreDisplay() {
        scoreTracker.textContent = `স্কোর: ${score} / ${totalQuestionsInSet}`;
    }

    function handleOptionClick(e) {
        const selectedOption = e.target.closest('.mcq-option');
        if (!selectedOption) return;

        const questionDiv = selectedOption.closest('.mcq-question');
        if (questionDiv.classList.contains('answered')) return;
        questionDiv.classList.add('answered');

        const globalIndex = parseInt(questionDiv.id.split('-')[1]);
        const selectedIndex = parseInt(selectedOption.dataset.index);
        
        // ================== MODIFIED CODE START ==================
        // Retrieve the correct answer's index from the question element's dataset
        const correctIndex = parseInt(questionDiv.dataset.correctAnswer, 10);
        // ================== MODIFIED CODE END ==================

        if (selectedIndex === correctIndex) {
            selectedOption.classList.add('correct');
            correctSound.play().catch(e => console.log("Audio play failed: " + e));
            score++;
            updateScoreDisplay();
        } else {
            selectedOption.classList.add('incorrect');
            wrongSound.play().catch(e => console.log("Audio play failed: " + e));
            // Find the correct option using its new index and highlight it
            questionDiv.querySelector(`.mcq-option[data-index="${correctIndex}"]`).classList.add('correct');
        }
        // The explanation is still fetched from the original mcqData using globalIndex
        questionDiv.querySelector('.mcq-explanation').style.display = 'block';
    }

    function setupOptionListeners() {
        mcqContainer.addEventListener('click', handleOptionClick);
    }
    
    mcqSetSelector.addEventListener('change', (e) => {
        generateMCQs(parseInt(e.target.value, 10));
    });

    document.addEventListener('keydown', (e) => {
        const activeQuestion = document.querySelector('.mcq-question.active-question');
        if (!activeQuestion) return;
        
        if (e.key === 'Enter') {
            e.preventDefault();
            const nextQuestion = activeQuestion.nextElementSibling;
            if (nextQuestion) {
                nextQuestion.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        } else if (['1', '2', '3', '4'].includes(e.key) && !activeQuestion.classList.contains('answered')) {
            e.preventDefault();
            const optionIndex = parseInt(e.key) - 1;
            const optionToClick = activeQuestion.querySelector(`.mcq-option[data-index="${optionIndex}"]`);
            if (optionToClick) {
                optionToClick.click();
            }
        }
    });

    function setupIntersectionObserver() {
        const questions = document.querySelectorAll('.mcq-question');
        if (questions.length === 0) return;
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const prevActive = document.querySelector('.mcq-question.active-question');
                    if (prevActive) prevActive.classList.remove('active-question');
                    entry.target.classList.add('active-question');
                }
            });
        }, { rootMargin: '-40% 0px -40% 0px', threshold: 0 });
        questions.forEach(q => observer.observe(q));
    }
    
    // Load the first set by default
    generateMCQs(1);
});