// js/pdf-viewer.js

const algebraPdfList = [
    { title: "all question and answer", id: "1ScBMw_gEaZsvJq7itgow2p5tZYR7JyfH" },
    { title: "all question", id: "1lNk_TIX72srWSZawDLpWJQOGAlp10JiD" },
    { title: "Class 01 Note", id: "1_HHzvObXCcULKZgPpThinpBarOc3kX2U" },
    { title: "Class 02 Note", id: "1LkVUVU3-gp_8BJL4sfJKWB6ThJhAXLN6" },
    { title: "Class 03 Note", id: "12olizINBY6cxKp6SSw6zNJgnZZoc483p" },
    { title: "Class 04 Note", id: "14KXNfffjpq2SAec37QxHQ-xLbThzdfWj" },
    { title: "Class 05 Note", id: "1hkUvWZCtvTTpaWJi0XJuRf7b-vhD-UMX" },
    { title: "Class 06 Note", id: "1XQrCd2N87Vf8twjNSlvPYTyFWgB2aNvL" },
    { title: "Class 07 Note", id: "16bZTxRlPGoKxrdcDi2QzzckpXRwigwLB" },
    { title: "Class 08 Note", id: "10MKrEa380LoTO6xpJHqOMqubokaQ-vxs" },
    { title: "Class 09 Note", id: "1WaHFwqU3x66gd1HxvhE74PBHRvc0Vxda" },
    { title: "Class 10 Note", id: "1sJVsWzRmFhbFs6oC4SaAutXLTHxwXLHu" },
    { title: "Class 11 Note", id: "1hxblODfO2UAuDrmV6rvinPLrnz57Fm9O" }
];

// State Variables
let currentPdfIndex = 0;
let zoomLevel = 1;
let rotation = 0;
let isInverted = false;

// 2. Prevent Browser Auto-Scroll Restoration
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

// 3. Render Buttons in Grid
function renderPdfButtons() {
    const container = document.getElementById("pdf-grid-container");
    // Safety check: যদি HTML এ কন্টেইনার না থাকে তবে এরর দেবে না
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

// 4. Open PDF by DriveID (for dynamic PDFs from JSON)
function openPdfByDriveId(driveId, title) {
    const modal = document.getElementById("fullScreenPdfModal");
    const frame = document.getElementById("pdfViewerFrame");
    const titleSpan = document.getElementById("pdfModalTitle");
    const loader = document.getElementById("pdfLoader");

    if (!modal || !frame) {
        console.error("Error: Modal or Iframe not found in HTML!");
        return;
    }

    // Reset View Settings
    zoomLevel = 1;
    rotation = 0;
    isInverted = false;
    updateFrameTransform();

    // Show Loader & Hide Frame initially
    if (loader) loader.style.display = "flex";
    frame.style.opacity = "0";

    frame.src = `https://drive.google.com/file/d/${driveId}/preview`;
    
    if(titleSpan) {
        titleSpan.innerText = title;
    }

    // Show Modal
    modal.style.display = "flex"; 
    document.body.style.overflow = "hidden";

    enterFullScreen(modal);

    // When PDF Loads
    frame.onload = function() {
        if (loader) loader.style.display = "none";
        frame.style.opacity = "1";
        frame.focus();
    };
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
    const loader = document.getElementById("pdfLoader");

    // Safety Check: HTML এ আইডগুলো আছে কি না
    if (!modal || !frame) {
        console.error("Error: Modal or Iframe not found in HTML!");
        return;
    }

    // Reset View Settings
    zoomLevel = 1;
    rotation = 0;
    isInverted = false;
    updateFrameTransform();

    // Show Loader & Hide Frame initially
    if (loader) loader.style.display = "flex";
    frame.style.opacity = "0";

    // --- IMPORTANT FIX: Using '/preview' fixes X-Frame-Options Error ---
    frame.src = `https://drive.google.com/file/d/${pdfData.id}/preview`;
    
    if(titleSpan) {
        titleSpan.innerText = `${pdfData.title} (${index + 1}/${algebraPdfList.length})`;
    }

    // Show Modal
    modal.style.display = "flex"; 
    document.body.style.overflow = "hidden"; // Stop background scroll

    // Trigger Full Screen (Optional, remove if annoying)
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
    if (!frame) return;

    const invertVal = isInverted ? "invert(1) hue-rotate(180deg)" : "none";
    // Combine filters correctly
    frame.style.filter = invertVal;
    frame.style.transform = `scale(${zoomLevel}) rotate(${rotation}deg)`;
}

// 7. Close PDF
function closePdf() {
    const modal = document.getElementById("fullScreenPdfModal");
    const frame = document.getElementById("pdfViewerFrame");
    
    if (modal) modal.style.display = "none";
    if (frame) frame.src = ""; // Clear source to stop buffering/playing
    
    document.body.style.overflow = "auto";
    exitFullScreen();
}

// 8. Keyboard Shortcuts
document.addEventListener('keydown', function(event) {
    const modal = document.getElementById("fullScreenPdfModal");
    
    // Only execute if modal is open
    if (modal && modal.style.display !== "none" && modal.style.display !== "") { 
        
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
    }
});

// Helper: Enter Full Screen
function enterFullScreen(element) {
    if (!element) return;
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
    // FIX: Remove hash to prevent jumping
    if (window.location.hash) {
        history.replaceState(null, null, window.location.pathname);
    }

    // FIX: Force scroll to top
    window.scrollTo(0, 0);

    // Render Buttons
    renderPdfButtons();
});