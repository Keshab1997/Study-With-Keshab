document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const gameContainer = document.querySelector('.flashcard-game-container');
    const gameTitle = document.querySelector('header h1');
    const setSelector = document.getElementById('set-selector');
    const cardInner = document.querySelector('.card-inner');
    const cardFrontText = document.getElementById('card-front-text');
    const cardBackText = document.getElementById('card-back-text');
    const cardExplanation = document.getElementById('card-explanation');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const shuffleBtn = document.getElementById('shuffle-btn');
    const cardCounter = document.getElementById('card-counter');
    const progressBar = document.getElementById('progress-bar');
    const markLearnedBtn = document.getElementById('mark-learned-btn');
    const restartBtn = document.getElementById('restart-btn');
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const themeButtons = document.querySelectorAll('.theme-btn');

    // State
    let state = {
        currentSet: '1',
        allCards: [],
        currentIndex: 0,
        learnedCards: new Set(),
    };

    // --- ইনিশিয়ালাইজেশন ---
    function init() {
        loadSettings();
        populateSetSelector();
        loadFlashcards();
        setupEventListeners();
    }

    function loadFlashcards() {
        if (typeof allFlashcardSets !== 'undefined' && allFlashcardSets[state.currentSet]) {
            state.allCards = allFlashcardSets[state.currentSet].map((card, index) => ({...card, id: `${state.currentSet}-${index}`}));
            showCard(state.currentIndex);
        } else {
            displayError(`সেট '${state.currentSet}' পাওয়া যায়নি।`);
        }
    }

    function displayError(message) {
        gameContainer.innerHTML = `<h1 style="color: red;">দুঃখিত!</h1><p>${message}</p>`;
    }

    // --- UI আপডেট ফাংশন ---
    function showCard(index) {
        if (index < 0 || index >= state.allCards.length) return;

        if (cardInner.classList.contains('is-flipped')) {
            cardInner.classList.remove('is-flipped');
        }

        setTimeout(() => {
            const card = state.allCards[index];
            cardFrontText.textContent = card.question;
            cardBackText.textContent = card.answer;
            cardExplanation.textContent = card.explanation || '';
            updateUIForCard(index);
        }, 150);
    }
    
    function updateUIForCard(index) {
        state.currentIndex = index;
        cardCounter.textContent = `${index + 1} / ${state.allCards.length}`;
        updateProgressBar(index);
        updateButtonStates(index);
        updateLearnedButtonState();
    }

    function updateProgressBar(index) {
        const percentage = ((index + 1) / state.allCards.length) * 100;
        progressBar.style.width = `${percentage}%`;
    }

    function updateButtonStates(index) {
        prevBtn.disabled = index === 0;
        nextBtn.disabled = index === state.allCards.length - 1;
        restartBtn.classList.toggle('hidden', index !== state.allCards.length - 1);
    }
    
    function updateLearnedButtonState() {
        const currentCardId = state.allCards[state.currentIndex]?.id;
        if (state.learnedCards.has(currentCardId)) {
            markLearnedBtn.textContent = '✅ শেখা হয়েছে';
            markLearnedBtn.disabled = true;
        } else {
            markLearnedBtn.textContent = 'শিখেছি';
            markLearnedBtn.disabled = false;
        }
    }

    // --- ইভেন্ট হ্যান্ডলার ---
    function handleSetChange() {
        const newSet = setSelector.value;
        window.location.href = `?set=${newSet}`;
    }

    function flipCard() {
        cardInner.classList.toggle('is-flipped');
    }

    function nextCard() {
        if (state.currentIndex < state.allCards.length - 1) {
            showCard(state.currentIndex + 1);
        }
    }

    function prevCard() {
        if (state.currentIndex > 0) {
            showCard(state.currentIndex - 1);
        }
    }

    function shuffleCards() {
        for (let i = state.allCards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [state.allCards[i], state.allCards[j]] = [state.allCards[j], state.allCards[i]];
        }
        showCard(0);
        gameContainer.classList.add('shuffling-animation');
        setTimeout(() => gameContainer.classList.remove('shuffling-animation'), 500);
    }
    
    function markAsLearned() {
        const currentCardId = state.allCards[state.currentIndex].id;
        state.learnedCards.add(currentCardId);
        saveLearnedCards();
        updateLearnedButtonState();
    }

    function restartGame() {
        showCard(0);
    }

    // --- সেটিংস এবং লোকাল স্টোরেজ ---
    function loadSettings() {
        const urlParams = new URLSearchParams(window.location.search);
        state.currentSet = urlParams.get('set') || '1';

        const savedLearned = localStorage.getItem(`learnedCards_${state.currentSet}`);
        if (savedLearned) {
            state.learnedCards = new Set(JSON.parse(savedLearned));
        }

        const savedTheme = localStorage.getItem('flashcardTheme') || 'default';
        const savedMode = localStorage.getItem('flashcardMode') || 'light';
        setTheme(savedTheme);
        setMode(savedMode);
    }
    
    function saveLearnedCards() {
        localStorage.setItem(`learnedCards_${state.currentSet}`, JSON.stringify([...state.learnedCards]));
    }
    
    function setTheme(theme) {
        document.body.dataset.colorTheme = theme;
        localStorage.setItem('flashcardTheme', theme);
        themeButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.theme === theme));
    }

    function setMode(mode) {
        if (mode === 'dark') {
            document.body.classList.add('dark-mode');
            darkModeToggle.checked = true;
        } else {
            document.body.classList.remove('dark-mode');
            darkModeToggle.checked = false;
        }
        localStorage.setItem('flashcardMode', mode);
    }

    // --- ইভেন্ট লিসেনার সেটআপ ---
    function setupEventListeners() {
        setSelector.addEventListener('change', handleSetChange);
        document.getElementById('flashcard').addEventListener('click', flipCard);
        nextBtn.addEventListener('click', nextCard);
        prevBtn.addEventListener('click', prevCard);
        shuffleBtn.addEventListener('click', shuffleCards);
        markLearnedBtn.addEventListener('click', markAsLearned);
        restartBtn.addEventListener('click', restartGame);
        
        darkModeToggle.addEventListener('change', () => {
            setMode(darkModeToggle.checked ? 'dark' : 'light');
        });

        themeButtons.forEach(button => {
            button.addEventListener('click', () => setTheme(button.dataset.theme));
        });

        // Keyboard controls
        document.addEventListener('keydown', e => {
            if (document.activeElement === setSelector) return;
            switch (e.key) {
                case 'ArrowRight': nextBtn.click(); break;
                case 'ArrowLeft': prevBtn.click(); break;
                case ' ': case 'Enter': flipCard(); e.preventDefault(); break;
            }
        });
    }

    function populateSetSelector() {
        if (typeof allFlashcardSets === 'undefined') return;
        Object.keys(allFlashcardSets).forEach(key => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = `সেট ${key}`;
            option.selected = key === state.currentSet;
            setSelector.appendChild(option);
        });
    }

    // অ্যাপ চালু করুন
    init();
});