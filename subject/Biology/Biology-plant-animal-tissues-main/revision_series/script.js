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

    const mcqContainer = document.getElementById('mcq-container');
    const mcqSetSelector = document.getElementById('mcqSetSelector');
    const scoreTracker = document.getElementById('score-tracker');
    const mcqSetTitle = document.getElementById('mcq-set-title');

    let score = 0;
    let totalQuestionsInSet = 0;

    /**
     * Fisher-Yates shuffle algorithm to shuffle an array.
     */
    function shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }

    /**
     * Populates the MCQ set selector dropdown dynamically.
     */
    function populateSetSelector() {
        mcqSetSelector.innerHTML = ''; // Clear existing options
        mcqSets.forEach((set, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = set.setName;
            mcqSetSelector.appendChild(option);
        });
    }

    /**
     * Generates and displays MCQs for the selected set.
     * @param {number} setIndex The index of the set to display.
     */
    function generateMCQs(setIndex) {
        mcqContainer.innerHTML = '';
        score = 0;
        
        const currentSet = mcqSets[setIndex];
        if (!currentSet) {
            mcqContainer.innerHTML = '<p>প্রশ্ন সেট পাওয়া যায়নি।</p>';
            return;
        }

        const questionSet = currentSet.questions;
        totalQuestionsInSet = questionSet.length;
        mcqSetTitle.textContent = currentSet.setName;
        updateScoreDisplay();

        questionSet.forEach((item, index) => {
            const questionDiv = document.createElement('div');
            questionDiv.className = 'mcq-question';
            questionDiv.id = `q-${index}`;
            
            const originalOptions = item.o;
            const correctAnswerText = originalOptions[item.a];
            const shuffledOptions = shuffleArray(originalOptions);
            const newCorrectIndex = shuffledOptions.indexOf(correctAnswerText);
            
            questionDiv.dataset.correctAnswer = newCorrectIndex;
            questionDiv.dataset.explanation = item.ex;

            let optionsHTML = shuffledOptions.map((option, i) => 
                `<div class="mcq-option" data-index="${i}">${String.fromCharCode(65 + i)}) ${option}</div>`
            ).join('');

            questionDiv.innerHTML = `
                <h4>প্রশ্ন ${index + 1}: ${item.q}</h4>
                <div class="mcq-options">${optionsHTML}</div>
                <div class="mcq-explanation" style="display: none;"></div>
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

        const selectedIndex = parseInt(selectedOption.dataset.index);
        const correctIndex = parseInt(questionDiv.dataset.correctAnswer);
        
        if (selectedIndex === correctIndex) {
            selectedOption.classList.add('correct');
            correctSound.play().catch(err => console.log("Audio play failed:", err));
            score++;
            updateScoreDisplay();
        } else {
            selectedOption.classList.add('incorrect');
            wrongSound.play().catch(err => console.log("Audio play failed:", err));
            questionDiv.querySelector(`.mcq-option[data-index="${correctIndex}"]`).classList.add('correct');
        }
        
        const explanationDiv = questionDiv.querySelector('.mcq-explanation');
        explanationDiv.innerHTML = `<strong>ব্যাখ্যা:</strong> ${questionDiv.dataset.explanation}`;
        explanationDiv.style.display = 'block';
    }

    function setupOptionListeners() {
        mcqContainer.addEventListener('click', handleOptionClick);
    }
    
    mcqSetSelector.addEventListener('change', (e) => {
        generateMCQs(parseInt(e.target.value, 10));
    });

    // ... (Your keyboard navigation and IntersectionObserver code can remain the same) ...
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
    
    // --- INITIALIZATION ---
    populateSetSelector();  // First, create the dropdown
    generateMCQs(0);        // Then, load the first set (index 0) by default
});