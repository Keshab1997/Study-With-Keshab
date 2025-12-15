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

// 2. Render Buttons
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

// 3. Open PDF
function openPdf(index) {
    if (index < 0 || index >= algebraPdfList.length) return;

    currentPdfIndex = index;
    const pdfData = algebraPdfList[index];

    const modal = document.getElementById("fullScreenPdfModal");
    const frame = document.getElementById("pdfViewerFrame");
    const titleSpan = document.getElementById("pdfModalTitle");
    const loader = document.querySelector(".pdf-loader");

    // Reset View Settings
    zoomLevel = 1;
    rotation = 0;
    isInverted = false;
    updateFrameTransform();

    // Show Loader
    loader.style.display = "block";
    frame.style.opacity = "0";

    // Set URL (Preview Mode)
    frame.src = `https://drive.google.com/file/d/${pdfData.id}/preview`;
    titleSpan.innerText = `${pdfData.title} (${index + 1}/${algebraPdfList.length})`;

    // Show Modal
    modal.style.display = "flex"; // Changed to flex for layout
    document.body.style.overflow = "hidden";

    // Enter Full Screen
    enterFullScreen(modal);

    // Focus Hack for Keyboard Scrolling
    frame.onload = function() {
        loader.style.display = "none";
        frame.style.opacity = "1";
        frame.focus(); // Important: Focus iframe so arrow keys work for scrolling
    };
}

// 4. Change PDF (Next/Prev)
function changePdf(direction) {
    const newIndex = currentPdfIndex + direction;
    if (newIndex >= 0 && newIndex < algebraPdfList.length) {
        openPdf(newIndex);
    }
}

// 5. Advanced Controls (Zoom, Rotate, Invert)
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

// 6. Close PDF
function closePdf() {
    const modal = document.getElementById("fullScreenPdfModal");
    const frame = document.getElementById("pdfViewerFrame");
    
    modal.style.display = "none";
    frame.src = ""; 
    document.body.style.overflow = "auto";
    exitFullScreen();
}

// 7. Keyboard Controls
document.addEventListener('keydown', function(event) {
    const modal = document.getElementById("fullScreenPdfModal");
    if (modal.style.display !== "none") { // If modal is open
        
        // Navigation
        if (event.key === "ArrowRight" && event.ctrlKey) { 
            // Ctrl + Right Arrow -> Next PDF (Prevent conflict with scroll)
            changePdf(1); 
        } 
        else if (event.key === "ArrowLeft" && event.ctrlKey) { 
            // Ctrl + Left Arrow -> Prev PDF
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

        // Note: Simple ArrowUp/ArrowDown will naturally scroll the iframe 
        // IF the iframe has focus. We let that happen natively.
    }
});

// Helper: Full Screen
function enterFullScreen(element) {
    if(element.requestFullscreen) element.requestFullscreen().catch(()=>{});
    else if(element.webkitRequestFullscreen) element.webkitRequestFullscreen();
}

function exitFullScreen() {
    if(document.exitFullscreen) document.exitFullscreen().catch(()=>{});
}

// Init
document.addEventListener("DOMContentLoaded", renderPdfButtons);