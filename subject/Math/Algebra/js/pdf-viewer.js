// js/pdf-viewer.js

// 1. PDF Data List
const algebraPdfList = [
    { title: "Class 01 Note", id: "1DrJwuYxGa2KMtavY2AoYEC8upqepCbQ_" },
    { title: "Class 02 Note", id: "1ENgGdF4bASjRPrsRY_7afLHv4TjR36EV" },
    { title: "Class 03 Note", id: "1E0BwPQvOUKGRA7ey2kI9jhF-_QOovPpN" },
    { title: "Class 04 Note", id: "1EkSduQlX8ArAjuqSe24BoG8SoYmidCZT" },
    { title: "Class 05 Note", id: "1EdO69C-oD3zmS9cMSfw_lcUU_JCPSBVR" },
    { title: "Class 06 Note", id: "1E_DUmtM5akVE3YdxhEwfXm0OJ73y-l_g" },
    { title: "Class 07 Note", id: "1E_AU-1aQ3RrDh36PqrC1BXCIjaGxhHMu" },
    { title: "Class 08 Note", id: "1EZupU0EDonGCiGHRffVYl56NeCEY_0iw" },
    { title: "Class 09 Note", id: "1ES0HZQk1o3LMjed-192smEAtvxUY8Yx6" },
    { title: "Class 10 Note", id: "1EQ6rH5Wx1iDV2-TSRmWNGJCzFbqcQ6H0" },
    { title: "Class 11 Note", id: "1ELs3g03I1xRK-DSvrh0w3JrN0HCNKuOQ" },
    { title: "Class 12 Note", id: "1EKNkwW-gwpr60NLnRohwduoKyzw3OfLX" },
    { title: "Class 13 Note", id: "1EKDQdJ6B28zgWkAgPYto1FL4foMgZrgH" },
    { title: "Class 14 Note", id: "1EHi9KWTRpG8-ZLFpl9PCxgRYfVnlz5sT" },
    { title: "Class 15 Note", id: "1EEe7PNo6rzTlQYJxwEoegMPPoGnI8K1R" },
    { title: "Class 16 Note", id: "1E10eiL6oQ6NXeDaXzE5CAPBjJUWGi9j6" },
    { title: "Class 17 Note", id: "1E0uiCMCqTEskfNO7sjepGsrGQsKUF_Xf" }
];

// State Variables
let currentPdfIndex = 0;
let zoomLevel = 1;
let rotation = 0;
let isInverted = false;

// 2. Prevent Browser Auto-Scroll Restoration (Fix for Page Jumping)
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

// 3. Render Buttons in Grid
function renderPdfButtons() {
    const container = document.getElementById("pdf-grid-container");
    if (!container) return;
    container.innerHTML = ""; 

    algebraPdfList.forEach((pdf, index) => {
        const card = document.createElement("div");
        card.className = "pdf-card";
        card.onclick = () => openPdf(index);
        
        card.innerHTML = `
            <i class="fa-solid fa-file-pdf"></i>
            <span>${pdf.title}</span>
        `;
        container.appendChild(card);
    });
}

// 4. Open PDF Logic
function openPdf(index) {
    if (index < 0 || index >= algebraPdfList.length) return;

    currentPdfIndex = index;
    const pdfData = algebraPdfList[index];

    // Get Elements
    const modal = document.getElementById("fullScreenPdfModal");
    const frame = document.getElementById("pdfViewerFrame");
    const titleSpan = document.getElementById("pdfModalTitle");
    const loader = document.getElementById("pdfLoader"); // Updated ID to match HTML

    // Reset View Settings
    zoomLevel = 1;
    rotation = 0;
    isInverted = false;
    updateFrameTransform();

    // Show Loader & Hide Frame
    if (loader) loader.style.display = "flex";
    frame.style.opacity = "0";

    // Set Data
    // Using 'preview' for cleaner UI without Google toolbars
    frame.src = `https://drive.google.com/file/d/${pdfData.id}/preview`;
    titleSpan.innerText = `${pdfData.title} (${index + 1}/${algebraPdfList.length})`;

    // Show Modal
    modal.style.display = "flex"; 
    document.body.style.overflow = "hidden"; // Stop background scroll

    // Trigger Full Screen
    enterFullScreen(modal);

    // When PDF Loads
    frame.onload = function() {
        if (loader) loader.style.display = "none"; // Hide Loader
        frame.style.opacity = "1"; // Show Frame
        frame.focus(); // Focus so arrow keys scroll the iframe
    };
}

// 5. Change PDF (Next/Prev)
function changePdf(direction) {
    const newIndex = currentPdfIndex + direction;
    if (newIndex >= 0 && newIndex < algebraPdfList.length) {
        openPdf(newIndex);
    }
}

// 6. Advanced Controls (Zoom, Rotate, Invert)
function adjustZoom(delta) {
    zoomLevel += delta;
    if (zoomLevel < 0.5) zoomLevel = 0.5; // Min Zoom
    if (zoomLevel > 3.0) zoomLevel = 3.0; // Max Zoom
    updateFrameTransform();
}

function rotatePdf() {
    rotation = (rotation + 90) % 360;
    updateFrameTransform();
}

function toggleInvert() {
    isInverted = !isInverted;
    updateFrameTransform();
}

function updateFrameTransform() {
    const frame = document.getElementById("pdfViewerFrame");
    const invertVal = isInverted ? "invert(1) hue-rotate(180deg)" : "none";
    frame.style.filter = invertVal;
    frame.style.transform = `scale(${zoomLevel}) rotate(${rotation}deg)`;
}

// 7. Close PDF
function closePdf() {
    const modal = document.getElementById("fullScreenPdfModal");
    const frame = document.getElementById("pdfViewerFrame");
    
    modal.style.display = "none";
    frame.src = ""; // Clear source to stop buffering
    document.body.style.overflow = "auto";
    exitFullScreen();
}

// 8. Keyboard Shortcuts
document.addEventListener('keydown', function(event) {
    const modal = document.getElementById("fullScreenPdfModal");
    
    // Only execute if modal is open
    if (modal.style.display !== "none" && modal.style.display !== "") { 
        
        // Navigation (Ctrl + Arrow)
        if (event.key === "ArrowRight" && event.ctrlKey) { 
            changePdf(1); 
        } 
        else if (event.key === "ArrowLeft" && event.ctrlKey) { 
            changePdf(-1); 
        }
        else if (event.key === "Escape") {
            closePdf();
        }
        // Zoom
        else if (event.key === "+" || event.key === "=") {
            adjustZoom(0.1);
        }
        else if (event.key === "-") {
            adjustZoom(-0.1);
        }
        
        // Note: Normal Up/Down arrows will work for scrolling automatically 
        // because we focused the iframe in the openPdf function.
    }
});

// Helper: Enter Full Screen
function enterFullScreen(element) {
    if(element.requestFullscreen) element.requestFullscreen().catch(()=>{});
    else if(element.webkitRequestFullscreen) element.webkitRequestFullscreen();
    else if(element.mozRequestFullScreen) element.mozRequestFullScreen();
    else if(element.msRequestFullscreen) element.msRequestFullscreen();
}

// Helper: Exit Full Screen
function exitFullScreen() {
    if(document.exitFullscreen) document.exitFullscreen().catch(()=>{});
    else if(document.webkitExitFullscreen) document.webkitExitFullscreen();
    else if(document.mozCancelFullScreen) document.mozCancelFullScreen();
    else if(document.msExitFullscreen) document.msExitFullscreen();
}

// 9. Initialize Page
document.addEventListener("DOMContentLoaded", () => {
    // FIX: Remove hash to prevent jumping to #pdf-notes
    if (window.location.hash) {
        history.replaceState(null, null, window.location.pathname);
    }

    // FIX: Force scroll to top immediately
    window.scrollTo(0, 0);

    // Render Buttons
    renderPdfButtons();
});