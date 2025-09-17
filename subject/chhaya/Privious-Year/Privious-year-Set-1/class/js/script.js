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
    // --- নতুন কিবোর্ড শর্টকাট ফাংশনালিটি (New Keyboard Shortcut Functionality) ---
    // ===================================================================

    const SCROLL_AMOUNT = 80; // Arrow key দিয়ে স্ক্রল করার পরিমাণ
    const AUTO_SCROLL_SPEED = 1; // অটো-স্ক্রলের গতি (কম মানে দ্রুত)
    let autoScrollInterval = null;

    // অটো-স্ক্রল ফাংশন
    function toggleAutoScroll() {
        if (autoScrollInterval) {
            clearInterval(autoScrollInterval);
            autoScrollInterval = null;
        } else {
            autoScrollInterval = setInterval(() => {
                window.scrollBy(0, 1); // প্রতিবার 1 পিক্সেল নিচে স্ক্রল
                // যদি পেজের শেষে পৌঁছে যায়, অটো-স্ক্রল বন্ধ হয়ে যাবে
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

    // কিবোর্ড শর্টকাটের তালিকা
    function showHelp() {
        alert(
            `কিবোর্ড শর্টকাট তালিকা:
--------------------------------
↑ (Up Arrow)      : উপরে স্ক্রল করুন
↓ (Down Arrow)    : নিচে স্ক্রল করুন
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

    // প্রধান কিবোর্ড ইভেন্ট লিসেনার
    window.addEventListener("keydown", (event) => {
        // যদি ব্যবহারকারী কোনো ইনপুট ফিল্ডে টাইপ করেন, তবে শর্টকাট কাজ করবে না
        if (["INPUT", "TEXTAREA", "SELECT"].includes(event.target.tagName)) {
            return;
        }

        // event.key অনুযায়ী কাজ করবে
        switch (event.key) {
            case "ArrowUp":
                event.preventDefault();
                window.scrollBy({ top: -SCROLL_AMOUNT, behavior: "smooth" });
                break;

            case "ArrowDown":
                event.preventDefault();
                window.scrollBy({ top: SCROLL_AMOUNT, behavior: "smooth" });
                break;

            case " ": // Spacebar
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
});
