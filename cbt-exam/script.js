document.addEventListener('DOMContentLoaded', () => {
    // দ্রষ্টব্য: quizData ভেরিয়েবলটি questions.js ফাইল থেকে আসছে।
    
    const EXAM_TIME_MINUTES = 5; // পরীক্ষার মোট সময় (মিনিটে)

    // HTML এলিমেন্টগুলো ধরা
    const startScreen = document.getElementById('start-screen');
    const quizScreen = document.getElementById('quiz-screen');
    const resultScreen = document.getElementById('result-screen');
    
    const startBtn = document.getElementById('start-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const submitBtn = document.getElementById('submit-btn');

    const questionText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');
    const questionNumber = document.getElementById('question-number');
    const timerDisplay = document.getElementById('timer');
    const questionPalette = document.getElementById('question-palette');

    let currentQuestionIndex = 0;
    let userAnswers = new Array(quizData.length).fill(null);
    let timer;
    let timeRemaining = EXAM_TIME_MINUTES * 60;

    // শুরুর স্ক্রিনের তথ্য আপডেট করা
    document.getElementById('total-questions-info').textContent = quizData.length;
    document.getElementById('total-time-info').textContent = EXAM_TIME_MINUTES;

    function startQuiz() {
        startScreen.classList.remove('active');
        quizScreen.classList.add('active');
        loadQuestion();
        createPalette();
        startTimer();
    }

    function startTimer() {
        timer = setInterval(() => {
            timeRemaining--;
            updateTimerDisplay();
            if (timeRemaining <= 0) {
                submitQuiz();
            }
        }, 1000);
    }

    function updateTimerDisplay() {
        const minutes = Math.floor(timeRemaining / 60);
        const seconds = timeRemaining % 60;
        timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    function loadQuestion() {
        const currentQuestion = quizData[currentQuestionIndex];
        questionNumber.textContent = `প্রশ্ন ${currentQuestionIndex + 1}/${quizData.length}`;
        questionText.textContent = currentQuestion.question;
        
        optionsContainer.innerHTML = '';
        currentQuestion.options.forEach((option, index) => {
            const optionElement = document.createElement('label');
            optionElement.className = 'option';
            optionElement.innerHTML = `
                <input type="radio" name="option" value="${option}" id="option${index+1}">
                ${index + 1}. ${option}
            `;
            
            const radio = optionElement.querySelector('input');
            if (userAnswers[currentQuestionIndex] === option) {
                radio.checked = true;
                optionElement.classList.add('selected');
            }

            radio.addEventListener('change', () => {
                handleAnswerSelection(option, optionElement);
            });
            optionsContainer.appendChild(optionElement);
        });

        prevBtn.disabled = currentQuestionIndex === 0;
        nextBtn.textContent = currentQuestionIndex === quizData.length - 1 ? 'পর্যালোচনা' : 'পরবর্তী';
        updatePalette();
    }
    
    function handleAnswerSelection(option, element) {
        userAnswers[currentQuestionIndex] = option;
        document.querySelectorAll('.option').forEach(opt => opt.classList.remove('selected'));
        if (element) {
            element.classList.add('selected');
        }
        updatePalette();
    }

    function createPalette() {
        questionPalette.innerHTML = '';
        quizData.forEach((_, index) => {
            const paletteBtn = document.createElement('button');
            paletteBtn.className = 'palette-btn';
            paletteBtn.textContent = index + 1;
            paletteBtn.addEventListener('click', () => {
                currentQuestionIndex = index;
                loadQuestion();
            });
            questionPalette.appendChild(paletteBtn);
        });
        updatePalette();
    }

    function updatePalette() {
        const paletteButtons = document.querySelectorAll('.palette-btn');
        paletteButtons.forEach((btn, index) => {
            btn.classList.remove('current', 'answered', 'unanswered');
            if (index === currentQuestionIndex) {
                btn.classList.add('current');
            } else if (userAnswers[index] !== null) {
                btn.classList.add('answered');
            } else {
                btn.classList.add('unanswered');
            }
        });
    }

    function nextQuestion() {
        if (currentQuestionIndex < quizData.length - 1) {
            currentQuestionIndex++;
            loadQuestion();
        }
    }

    function prevQuestion() {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            loadQuestion();
        }
    }

    function submitQuiz() {
        clearInterval(timer);
        
        let correctAnswers = 0;
        let wrongAnswers = 0;
        let unanswered = 0;

        quizData.forEach((question, index) => {
            const userAnswer = userAnswers[index];
            if (userAnswer === null) {
                unanswered++;
            } else if (userAnswer === question.answer) {
                correctAnswers++;
            } else {
                wrongAnswers++;
            }
        });

        // নেগেটিভ মার্কিং গণনা (প্রতি ৩টি ভুলের জন্য ১ নম্বর কাটা)
        const negativeMarks = Math.floor(wrongAnswers / 3);
        const finalScore = correctAnswers - negativeMarks;
        const totalMarks = quizData.length;

        // ফলাফল প্রদর্শন
        document.getElementById('r-total').textContent = `${totalMarks}`;
        document.getElementById('r-correct').textContent = `${correctAnswers}`;
        document.getElementById('r-wrong').textContent = `${wrongAnswers}`;
        document.getElementById('r-unanswered').textContent = `${unanswered}`;
        document.getElementById('r-deduction').textContent = `${negativeMarks}`;
        document.getElementById('r-final-score').textContent = `${finalScore} / ${totalMarks}`;
        
        quizScreen.classList.remove('active');
        resultScreen.classList.add('active');
    }

    // নতুন ফাংশন: কিবোর্ড ইনপুট হ্যান্ডেল করার জন্য
    function handleKeyPress(event) {
        // পরীক্ষা চলাকালীন না হলে কিবোর্ড কাজ করবে না
        if (!quizScreen.classList.contains('active')) return;

        switch (event.key) {
            case 'ArrowRight':
                nextQuestion();
                break;
            case 'ArrowLeft':
                prevQuestion();
                break;
            case '1':
            case '2':
            case '3':
            case '4':
                const optionIndex = parseInt(event.key) - 1;
                const radioButtons = optionsContainer.querySelectorAll('input[type="radio"]');
                if (radioButtons[optionIndex]) {
                    radioButtons[optionIndex].checked = true;
                    // change ইভেন্ট ম্যানুয়ালি ট্রিগার করা
                    radioButtons[optionIndex].dispatchEvent(new Event('change'));
                }
                break;
        }
    }

    // Event Listeners
    startBtn.addEventListener('click', startQuiz);
    nextBtn.addEventListener('click', nextQuestion);
    prevBtn.addEventListener('click', prevQuestion);
    submitBtn.addEventListener('click', () => {
        if (confirm('আপনি কি সত্যিই পরীক্ষা জমা দিতে চান?')) {
            submitQuiz();
        }
    });
    // কিবোর্ড ইভেন্ট লিসেনার যোগ করা
    document.addEventListener('keydown', handleKeyPress);
});