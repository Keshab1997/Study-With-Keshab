// js/pdf-viewer.js

// 1. PDF Data List (Firebase থেকে ডেটা আনার আগ পর্যন্ত এটি কাজ করবে)
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

// 2. Function to Render PDF Buttons Dynamically
function renderPdfButtons() {
    const container = document.getElementById("pdf-grid-container");
    
    if (!container) return; // যদি কন্টেইনার না থাকে তবে থামুন

    container.innerHTML = ""; // আগের কন্টেন্ট ক্লিয়ার করা

    algebraPdfList.forEach((pdf, index) => {
        // Create Card Div
        const card = document.createElement("div");
        card.className = "pdf-card";
        card.onclick = () => openPdf(pdf.id, pdf.title);

        // Icon
        const icon = document.createElement("i");
        icon.className = "fa-solid fa-file-pdf";

        // Title
        const span = document.createElement("span");
        span.innerText = pdf.title;

        // Append to Card
        card.appendChild(icon);
        card.appendChild(span);

        // Append to Container
        container.appendChild(card);
    });
}

// 3. Function to Open PDF in Full Screen Modal
function openPdf(fileId, title) {
    const modal = document.getElementById("fullScreenPdfModal");
    const frame = document.getElementById("pdfViewerFrame");
    const titleSpan = document.getElementById("pdfModalTitle");

    // Google Drive Preview URL
    const url = `https://drive.google.com/file/d/${fileId}/preview`;
    
    // Set content
    frame.src = url;
    titleSpan.innerText = title;

    // Show Modal
    modal.style.display = "block";
    
    // Disable background scrolling
    document.body.style.overflow = "hidden";
}

// 4. Function to Close PDF
function closePdf() {
    const modal = document.getElementById("fullScreenPdfModal");
    const frame = document.getElementById("pdfViewerFrame");
    
    // Hide Modal
    modal.style.display = "none";
    
    // Clear src to save memory
    frame.src = ""; 
    
    // Re-enable background scrolling
    document.body.style.overflow = "auto";
}

// Close modal if user presses 'Escape' key
document.addEventListener('keydown', function(event) {
    if (event.key === "Escape") {
        closePdf();
    }
});

// Load buttons when page loads
document.addEventListener("DOMContentLoaded", renderPdfButtons);