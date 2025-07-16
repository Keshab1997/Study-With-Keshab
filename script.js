document.addEventListener('DOMContentLoaded', function () {
    // --- Header Shadow on Scroll ---
    const header = document.querySelector('.site-header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 10) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // --- Mobile Menu Toggle ---
    const navToggle = document.querySelector('.mobile-nav-toggle');
    const primaryNav = document.querySelector('.primary-navigation');

    function toggleMobileMenu(show) {
        if (!primaryNav || !navToggle) return;
        if (show) {
            primaryNav.setAttribute('data-visible', 'true');
            navToggle.setAttribute('aria-expanded', 'true');
        } else {
            primaryNav.setAttribute('data-visible', 'false');
            navToggle.setAttribute('aria-expanded', 'false');
        }
    }

    if (navToggle && primaryNav) {
        navToggle.addEventListener('click', () => {
            const isVisible = primaryNav.getAttribute('data-visible') === 'true';
            toggleMobileMenu(!isVisible);
        });
    }

    // --- Toggle About & Contact Sections ---
    const aboutBtn = document.getElementById('toggle-about-btn');
    const contactBtn = document.getElementById('toggle-contact-btn');
    const aboutSection = document.getElementById('about');
    const contactSection = document.getElementById('contact');

    function toggleSection(sectionToShow, sectionToHide) {
        if (sectionToHide && !sectionToHide.classList.contains('hidden')) {
            sectionToHide.classList.add('hidden');
        }
        if (sectionToShow.classList.contains('hidden')) {
            sectionToShow.classList.remove('hidden');
            setTimeout(() => {
                sectionToShow.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }, 50);
        } else {
            sectionToShow.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }
        // মোবাইল মেনু বন্ধ করে দাও
        toggleMobileMenu(false);
    }

    if (aboutBtn && aboutSection && contactSection) {
        aboutBtn.addEventListener('click', function (e) {
            e.preventDefault();
            toggleSection(aboutSection, contactSection);
        });
    }

    if (contactBtn && contactSection && aboutSection) {
        contactBtn.addEventListener('click', function (e) {
            e.preventDefault();
            toggleSection(contactSection, aboutSection);
        });
    }

    // --- Escape key closes mobile nav ---
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && primaryNav?.getAttribute('data-visible') === 'true') {
            toggleMobileMenu(false);
            navToggle?.focus();
        }
    });

    // --- Focus Trap Inside Mobile Menu ---
    const focusableElements = 'a[href], button:not([disabled]), input, textarea, select';
    const focusableContent = primaryNav ? primaryNav.querySelectorAll(focusableElements) : [];

    if (focusableContent.length > 0) {
        const firstFocusable = focusableContent[0];
        const lastFocusable = focusableContent[focusableContent.length - 1];

        primaryNav.addEventListener('keydown', function (e) {
            if (e.key !== 'Tab') return;

            if (e.shiftKey) {
                if (document.activeElement === firstFocusable) {
                    e.preventDefault();
                    lastFocusable.focus();
                }
            } else {
                if (document.activeElement === lastFocusable) {
                    e.preventDefault();
                    firstFocusable.focus();
                }
            }
        });
    }

    // --- Make all chapter links open in new tab ---
    const chapterLinks = document.querySelectorAll('.chapter-card');
    chapterLinks.forEach(link => {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer'); // for security
    });
});