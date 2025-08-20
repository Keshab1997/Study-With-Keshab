document.addEventListener('DOMContentLoaded', () => {

    // --- Page Load Animation ---
    document.body.classList.add('loaded');

    // --- Elements ---
    const siteHeader = document.querySelector('.site-header');
    const themeToggleBtn = document.getElementById('theme-toggle');
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    const progressBar = document.getElementById('progressBar');
    const revealElements = document.querySelectorAll('.reveal');
    let lastScrollTop = 0;

    // --- Theme Toggle ---
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggleBtn.innerHTML = '☀️';
    } else {
        themeToggleBtn.innerHTML = '🌙';
    }
    themeToggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        let theme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
        themeToggleBtn.innerHTML = (theme === 'dark') ? '☀️' : '🌙';
        localStorage.setItem('theme', theme);
    });

    // --- Scroll Event Handler ---
    window.onscroll = () => {
        let scrollTop = window.scrollY || document.documentElement.scrollTop;

        // Header Hide/Show
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            siteHeader.classList.add('header-hidden');
        } else {
            siteHeader.classList.remove('header-hidden');
        }
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;

        // Scroll-to-Top Button
        scrollTopBtn.style.display = (scrollTop > 100) ? "block" : "none";

        // Reading Progress Bar
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollPercent = (scrollTop / scrollHeight) * 100;
        progressBar.style.width = scrollPercent + "%";
    };

    // --- Scroll-to-Top Button Click ---
    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // --- Scroll Animation (Intersection Observer) ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, { threshold: 0.1 });

    revealElements.forEach(element => {
        observer.observe(element);
    });

});