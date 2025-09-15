document.addEventListener('DOMContentLoaded', function() {
    const themeButtons = document.querySelectorAll('.theme-buttons button');
    const darkModeToggle = document.getElementById('darkModeToggle');
    const desktopModeToggle = document.getElementById('desktopModeToggle');
    const rotateScreenToggle = document.getElementById('rotateScreenToggle');
    const body = document.body;
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    
    const mobileViewport = 'width=device-width, initial-scale=1.0';
    const desktopViewport = 'width=1200, initial-scale=1.0';

    function applyTheme(theme) {
        body.dataset.theme = theme;
        localStorage.setItem('selected_theme', theme);
    }

    function applyMode(mode) {
        if (mode === 'dark') {
            body.classList.add('dark-mode');
            darkModeToggle.checked = true;
        } else {
            body.classList.remove('dark-mode');
            darkModeToggle.checked = false;
        }
        localStorage.setItem('selected_mode', mode);
    }
    
    function applyDesktopMode(isDesktop) {
        if (isDesktop) {
            body.classList.add('desktop-view');
            viewportMeta.setAttribute('content', desktopViewport);
            desktopModeToggle.textContent = 'মোবাইল মোড';
        } else {
            body.classList.remove('desktop-view');
            viewportMeta.setAttribute('content', mobileViewport);
            desktopModeToggle.textContent = 'ডেস্কটপ মোড';
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
    
    // Event Listeners
    themeButtons.forEach(button => {
        button.addEventListener('click', () => {
            applyTheme(button.dataset.themeName);
        });
    });

    darkModeToggle.addEventListener('change', () => {
        applyMode(darkModeToggle.checked ? 'dark' : 'light');
    });
    
    desktopModeToggle.addEventListener('click', () => {
        const isCurrentlyDesktop = body.classList.contains('desktop-view');
        applyDesktopMode(!isCurrentlyDesktop);
    });
    
    if(rotateScreenToggle) {
        rotateScreenToggle.addEventListener('click', function() {
            // This API is experimental and works best on mobile devices.
            if (typeof screen.orientation.lock !== 'function') {
                alert('আপনার ব্রাউজার বা ডিভাইস স্ক্রিন রোটেশন লক সমর্থন করে না।');
                return;
            }

            // Toggle rotation between portrait and landscape
            if (screen.orientation.type.includes('landscape')) {
                screen.orientation.lock('portrait-primary')
                    .catch(err => console.error(`Could not lock to portrait: ${err}`));
            } else {
                screen.orientation.lock('landscape-primary')
                    .catch(err => console.error(`Could not lock to landscape: ${err}`));
            }
        });
    }

    // Scroll Buttons Logic
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    const scrollToBottomBtn = document.getElementById('scrollToBottomBtn');
    window.addEventListener('scroll', () => {
        const scrollPosition = window.scrollY;
        const windowHeight = window.innerHeight;
        const bodyHeight = document.body.offsetHeight;
        if (scrollPosition > 200) {
            scrollToTopBtn.style.display = 'flex';
        } else {
            scrollToTopBtn.style.display = 'none';
        }
        if (scrollPosition + windowHeight < bodyHeight - 100) {
            scrollToBottomBtn.style.display = 'flex';
        } else {
            scrollToBottomBtn.style.display = 'none';
        }
    });
    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    scrollToBottomBtn.addEventListener('click', () => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    });

    // Digital Clock
    const clockElement = document.getElementById('digital-clock');
    function updateClock() {
        if(clockElement) {
            const now = new Date();
            const options = {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true,
                timeZone: 'Asia/Kolkata'
            };
            clockElement.textContent = now.toLocaleTimeString('en-US', options);
        }
    }
    updateClock();
    setInterval(updateClock, 1000);

    // Copyright Year
    const yearSpan = document.getElementById('copyright-year');
    if(yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
});