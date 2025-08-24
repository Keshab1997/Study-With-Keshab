document.addEventListener('DOMContentLoaded', function() {
    // Check if mcqData is defined in the HTML
    if (typeof mcqData === 'undefined') {
        console.error("MCQ Data (mcqData array) is not defined in the HTML file.");
        return; // Stop execution if data is missing
    }

    // --- AUDIO SETUP ---
    const correctSound = new Audio('../sounds/correct.mp3');
    const wrongSound = new Audio('../sounds/wrong.mp3');

    // --- THEME, MODE, & UI LOGIC ---
    const themeButtons = document.querySelectorAll('.theme-buttons .control-button');
    const darkModeToggle = document.getElementById('darkModeToggle');
    const desktopModeToggle = document.getElementById('desktopModeToggle');
    const body = document.body;
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    const mobileViewport = 'width=device-width, initial-scale=1.0';
    const desktopViewport = 'width=1200, initial-scale=1.0';

    function applyTheme(theme) { body.dataset.theme = theme; localStorage.setItem('selected_theme', theme); }
    function applyMode(mode) {
        if (mode === 'dark') { body.classList.add('dark-mode'); darkModeToggle.checked = true; } 
        else { body.classList.remove('dark-mode'); darkModeToggle.checked = false; }
        localStorage.setItem('selected_mode', mode);
    }
    function applyDesktopMode(isDesktop) {
        const textSpan = desktopModeToggle.querySelector('span');
        if (isDesktop) {
            body.classList.add('desktop-view');
            viewportMeta.setAttribute('content', desktopViewport);
            if (textSpan) textSpan.textContent = 'মোবাইল মোড';
        } else {
            body.classList.remove('desktop-view');
            viewportMeta.setAttribute('content', mobileViewport);
            if (textSpan) textSpan.textContent = 'ডেস্কটপ মোড';
        }
        localStorage.setItem('desktop_mode_enabled', isDesktop);
    }
    
    // Load saved settings
    const savedTheme = localStorage.getItem('selected_theme');
    const savedMode = localStorage.getItem('selected_mode');
    const savedDesktopMode = localStorage.getItem('desktop_mode_enabled') === 'true';
    if (savedTheme) applyTheme(savedTheme);
    if (savedMode) applyMode(savedMode);
    applyDesktopMode(savedDesktopMode);
    
    // Event listeners for controls
    themeButtons.forEach(button => { button.addEventListener('click', () => applyTheme(button.dataset.themeName)); });
    darkModeToggle.addEventListener('change', () => applyMode(darkModeToggle.checked ? 'dark' : 'light'));
    desktopModeToggle.addEventListener('click', () => applyDesktopMode(!body.classList.contains('desktop-view')));

    // --- SCROLL BUTTONS LOGIC ---
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    const scrollToBottomBtn = document.getElementById('scrollToBottomBtn');
    window.addEventListener('scroll', () => {
        const scrollPosition = window.scrollY, windowHeight = window.innerHeight, bodyHeight = document.body.offsetHeight;
        scrollToTopBtn.style.display = (scrollPosition > 200) ? 'flex' : 'none';
        scrollToBottomBtn.style.display = (scrollPosition + windowHeight < bodyHeight - 100) ? 'flex' : 'none';
    });
    scrollToTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    scrollToBottomBtn.addEventListener('click', () => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }));
    
    // --- FOOTER AUTO-UPDATE ---
    const yearSpan = document.getElementById('copyright-year');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();

    // --- INTERACTIVE MCQ LOGIC ---
    const mcqContainer = document.getElementById('mcq-container');
    const mcqSetSelector = document.getElementById('mcqSetSelector');
    const scoreTracker = document.getElementById('score-tracker');
    
    let score = 0;
    let totalQuestionsInSet = 0;

    function generateMCQs(setNumber) {
        mcqContainer.innerHTML = '';
        score = 0;
        
        const questionsPerSet = 15; // 45 questions into 3 sets
        const start = (setNumber - 1) * questionsPerSet;
        const end = Math.min(start + questionsPerSet, mcqData.length);
        const questionSet = mcqData.slice(start, end);

        totalQuestionsInSet = questionSet.length;
        updateScoreDisplay();

        questionSet.forEach((item, index) => {
            const globalIndex = start + index;
            const questionDiv = document.createElement('div');
            questionDiv.className = 'mcq-question';
            questionDiv.id = `q-${globalIndex}`;
            
            let optionsHTML = item.o.map((option, i) => 
                `<div class="mcq-option" data-index="${i}">${String.fromCharCode(65 + i)}) ${option}</div>`
            ).join('');
            
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
        const correctIndex = mcqData[globalIndex].a;
        if (selectedIndex === correctIndex) {
            selectedOption.classList.add('correct');
            correctSound.play().catch(e => console.log("Audio play failed: " + e));
            score++;
            updateScoreDisplay();
        } else {
            selectedOption.classList.add('incorrect');
            wrongSound.play().catch(e => console.log("Audio play failed: " + e));
            questionDiv.querySelector(`.mcq-option[data-index="${correctIndex}"]`).classList.add('correct');
        }
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
    
    generateMCQs(1);
});