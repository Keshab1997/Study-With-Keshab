document.addEventListener("DOMContentLoaded", function () {
    // --- Existing Elements and Variables ---
    const themeButtons = document.querySelectorAll(".theme-buttons button");
    const darkModeToggle = document.getElementById("darkModeToggle");
    const desktopModeToggle = document.getElementById("desktopModeToggle");
    const rotateScreenToggle = document.getElementById("rotateScreenToggle");
    const body = document.body;
    const viewportMeta = document.querySelector('meta[name="viewport"]');

    const mobileViewport = "width=device-width, initial-scale=1.0";
    const desktopViewport = "width=1200, initial-scale=1.0";

    // --- Existing Functions for Theming and Modes ---
    function applyTheme(theme) {
        body.dataset.theme = theme;
        localStorage.setItem("selected_theme", theme);
    }

    function applyMode(mode) {
        if (mode === "dark") {
            body.classList.add("dark-mode");
            darkModeToggle.checked = true;
        } else {
            body.classList.remove("dark-mode");
            darkModeToggle.checked = false;
        }
        localStorage.setItem("selected_mode", mode);
    }

    function applyDesktopMode(isDesktop) {
        if (isDesktop) {
            body.classList.add("desktop-view");
            viewportMeta.setAttribute("content", desktopViewport);
            desktopModeToggle.textContent = "মোবাইল মোড";
        } else {
            body.classList.remove("desktop-view");
            viewportMeta.setAttribute("content", mobileViewport);
            desktopModeToggle.textContent = "ডেস্কটপ মোড";
        }
        localStorage.setItem("desktop_mode_enabled", isDesktop);
    }

    // --- Load Saved Settings on Page Load ---
    const savedTheme = localStorage.getItem("selected_theme");
    const savedMode = localStorage.getItem("selected_mode");
    const savedDesktopMode =
        localStorage.getItem("desktop_mode_enabled") === "true";

    if (savedTheme) applyTheme(savedTheme);
    if (savedMode) applyMode(savedMode);
    applyDesktopMode(savedDesktopMode);

    // --- Existing Event Listeners ---
    themeButtons.forEach((button) => {
        button.addEventListener("click", () => {
            applyTheme(button.dataset.themeName);
        });
    });

    darkModeToggle.addEventListener("change", () => {
        applyMode(darkModeToggle.checked ? "dark" : "light");
    });

    desktopModeToggle.addEventListener("click", () => {
        const isCurrentlyDesktop = body.classList.contains("desktop-view");
        applyDesktopMode(!isCurrentlyDesktop);
    });

    if (rotateScreenToggle) {
        rotateScreenToggle.addEventListener("click", function () {
            if (typeof screen.orientation.lock !== "function") {
                alert(
                    "আপনার ব্রাউজার বা ডিভাইস স্ক্রিন রোটেশন লক সমর্থন করে না।",
                );
                return;
            }
            if (screen.orientation.type.includes("landscape")) {
                screen.orientation
                    .lock("portrait-primary")
                    .catch(console.error);
            } else {
                screen.orientation
                    .lock("landscape-primary")
                    .catch(console.error);
            }
        });
    }

    // --- Scroll Buttons Logic ---
    const scrollToTopBtn = document.getElementById("scrollToTopBtn");
    const scrollToBottomBtn = document.getElementById("scrollToBottomBtn");
    window.addEventListener("scroll", () => {
        const scrollPosition = window.scrollY;
        const windowHeight = window.innerHeight;
        const bodyHeight = document.body.offsetHeight;
        scrollToTopBtn.style.display = scrollPosition > 200 ? "flex" : "none";
        scrollToBottomBtn.style.display =
            scrollPosition + windowHeight < bodyHeight - 100 ? "flex" : "none";
    });
    scrollToTopBtn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
    scrollToBottomBtn.addEventListener("click", () => {
        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: "smooth",
        });
    });

    // --- Digital Clock ---
    const clockElement = document.getElementById("digital-clock");
    function updateClock() {
        if (clockElement) {
            const now = new Date();
            const options = {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: true,
                timeZone: "Asia/Kolkata",
            };
            clockElement.textContent = now.toLocaleTimeString("en-US", options);
        }
    }
    updateClock();
    setInterval(updateClock, 1000);

    // --- Copyright Year ---
    const yearSpan = document.getElementById("copyright-year");
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // ===================================================================
    // --- নতুন এবং উন্নত কিবোর্ড শর্টকাট ফাংশনালিটি (Smooth Scrolling) ---
    // ===================================================================

    const SCROLL_SPEED = 2.5;
    const AUTO_SCROLL_SPEED = 1;

    let smoothScrollInterval = null;
    let autoScrollInterval = null;
    let isArrowKeyDown = false;

    function startSmoothScroll(direction) {
        if (smoothScrollInterval) return;
        isArrowKeyDown = true;
        smoothScrollInterval = setInterval(() => {
            const amount = direction === "down" ? SCROLL_SPEED : -SCROLL_SPEED;
            window.scrollBy(0, amount);
        }, 10);
    }

    function stopSmoothScroll() {
        clearInterval(smoothScrollInterval);
        smoothScrollInterval = null;
        isArrowKeyDown = false;
    }

    function toggleAutoScroll() {
        if (smoothScrollInterval) stopSmoothScroll();
        if (autoScrollInterval) {
            clearInterval(autoScrollInterval);
            autoScrollInterval = null;
        } else {
            autoScrollInterval = setInterval(() => {
                window.scrollBy(0, 1);
                if (
                    window.innerHeight + window.scrollY >=
                    document.body.offsetHeight
                ) {
                    clearInterval(autoScrollInterval);
                    autoScrollInterval = null;
                }
            }, AUTO_SCROLL_SPEED);
        }
    }

    function showHelp() {
        alert(
            `কিবোর্ড শর্টকাট তালিকা:
--------------------------------
↑ (Up Arrow)      : উপরে মসৃণভাবে স্ক্রল করুন
↓ (Down Arrow)    : নিচে মসৃণভাবে স্ক্রল করুন
Spacebar          : অটো-স্ক্রল চালু/বন্ধ করুন
Home              : পেজের শুরুতে যান
End               : পেজের শেষে যান
PageUp            : এক পৃষ্ঠা উপরে যান
PageDown          : এক পৃষ্ঠা নিচে যান
'd' বা 'D'        : ডার্ক/লাইট মোড পরিবর্তন
'm' বা 'M'        : ডেস্কটপ/মোবাইল মোড পরিবর্তন
'?' বা 'h'        : এই সাহায্য তালিকাটি দেখুন`,
        );
    }

    window.addEventListener("keydown", (event) => {
        if (["INPUT", "TEXTAREA", "SELECT"].includes(event.target.tagName)) {
            return;
        }

        // isArrowKeyDown ফ্ল্যাগটি চেক করে key-repeat হওয়া আটকানো হচ্ছে
        if (
            (event.key === "ArrowUp" || event.key === "ArrowDown") &&
            !isArrowKeyDown
        ) {
            event.preventDefault();
            startSmoothScroll(event.key === "ArrowDown" ? "down" : "up");
            return; // Arrow key হলে switch এ যাবে না
        }

        // non-arrow key গুলোর জন্য switch ব্যবহার করা হচ্ছে
        // key repeat আটকাতে switch এর বাইরে রাখা হয়েছে
        if (event.repeat) return;

        switch (event.key) {
            case " ":
                event.preventDefault();
                toggleAutoScroll();
                break;
            case "Home":
                event.preventDefault();
                scrollToTopBtn.click();
                break;
            case "End":
                event.preventDefault();
                scrollToBottomBtn.click();
                break;
            case "PageUp":
                event.preventDefault();
                window.scrollBy({
                    top: -window.innerHeight,
                    behavior: "smooth",
                });
                break;
            case "PageDown":
                event.preventDefault();
                window.scrollBy({
                    top: window.innerHeight,
                    behavior: "smooth",
                });
                break;
            case "d":
            case "D":
                darkModeToggle.click();
                break;
            case "m":
            case "M":
                desktopModeToggle.click();
                break;
            case "?":
            case "h":
            case "H":
                showHelp();
                break;
        }
    });

    window.addEventListener("keyup", (event) => {
        if (event.key === "ArrowUp" || event.key === "ArrowDown") {
            event.preventDefault();
            stopSmoothScroll();
        }
    });
});
