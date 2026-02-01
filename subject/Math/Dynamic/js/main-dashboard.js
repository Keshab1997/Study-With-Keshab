// js/main-dashboard.js
document.addEventListener('DOMContentLoaded', async () => {
    const db = firebase.firestore();
    const chapterId = "Algebra";

    // ১. চ্যাপ্টারের সাধারণ তথ্য লোড করা (নাম, সাবটাইটেল, পিডিএফ)
    const chapterDoc = await db.collection("chapters").doc(chapterId).get();
    if (chapterDoc.exists) {
        const data = chapterDoc.data();
        renderChapterInfo(data);
        // পিডিএফ এবং কুইজ আগের মতোই চ্যাপ্টার সেটিংস থেকে আসবে
        if (data.pdfs) renderList("pdf-grid-container", data.pdfs, "pdf");
        if (data.quizzes) renderList("dynamic-quiz-list", data.quizzes, "quiz");
    }

    // ২. ক্লাস লিস্ট অটোমেটিক লোড করা (সরাসরি class_notes কালেকশন থেকে)
    loadAutomaticClassList();

    // ৩. বুকমার্ক চেক (আগের মতোই)
    const lastRead = localStorage.getItem("last_read_algebra");
    if (lastRead) {
        const continueBtn = document.getElementById("continue-reading");
        if (continueBtn) {
            continueBtn.style.display = "block";
            continueBtn.href = `class/template.html?id=${lastRead}`;
        }
    }

    // ডাইনামিক নেভিগেশন রেন্ডার
    await renderDynamicNav();
});

// ডাইনামিক নেভিগেশন রেন্ডার
async function renderDynamicNav() {
    const db = firebase.firestore();
    const chapterId = "Algebra";
    const navContainer = document.querySelector('.nav-grid');
    if (!navContainer) return;

    try {
        const doc = await db.collection("settings").doc(chapterId + "_nav").get();
        if (doc.exists) {
            const buttons = doc.data().buttons;
            navContainer.innerHTML = buttons.map(btn => `
                <a href="${btn.link}" class="nav-button ${btn.color}">
                    <i class="fa-solid ${btn.icon}"></i>
                    <span>${btn.title}</span>
                </a>
            `).join('');
        }
    } catch (error) {
        console.log("Navigation settings not found, using default");
    }
}

// সরাসরি কালেকশন থেকে ক্লাস লিস্ট আনার ফাংশন
async function loadAutomaticClassList() {
    const db = firebase.firestore();
    const classContainer = document.getElementById("dynamic-class-list");
    
    if (!classContainer) return;

    try {
        // class_notes কালেকশন থেকে সব ডকুমেন্ট আনা (আপডেট টাইম অনুযায়ী সাজানো)
        const snapshot = await db.collection("class_notes").orderBy("updatedAt", "desc").get();
        
        if (snapshot.empty) {
            classContainer.innerHTML = "<p>কোনো ক্লাস নোট পাওয়া যায়নি।</p>";
            return;
        }

        let html = "";
        snapshot.forEach(doc => {
            const data = doc.data();
            // অটোমেটিক লিঙ্ক তৈরি
            html += `
                <a href="class/template.html?id=${doc.id}" class="class-link">
                    <i class="fa-solid fa-person-chalkboard fa-fw"></i> ${data.title}
                </a>
            `;
        });
        classContainer.innerHTML = html;
    } catch (error) {
        console.error("Error loading classes:", error);
        classContainer.innerHTML = "<p>ক্লাস লোড করতে সমস্যা হয়েছে।</p>";
    }
}

function renderChapterInfo(data) {
    const titleElement = document.querySelector('.header-text h1');
    const subtitleElement = document.querySelector('.header-text p');
    if (titleElement && data.name) titleElement.innerText = `অধ্যায়: ${data.name}`;
    if (subtitleElement && data.subtitle) subtitleElement.innerText = data.subtitle;
}

// অন্যান্য লিস্টের জন্য রেন্ডার ফাংশন
function renderList(containerId, list, type) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = list.map(item => {
        if (type === 'pdf') {
            return `<div class="pdf-card" onclick="openPdf('${item.id}')">
                <i class="fa-solid fa-file-pdf"></i>
                <span>${item.title}</span>
            </div>`;
        } else if (type === 'quiz') {
            return `<a href="quiz/${item.id}.html">
                <i class="fa-solid fa-circle-question fa-fw"></i> ${item.title}
            </a>`;
        }
    }).join('');
}

// পিডিএফ ওপেন ফাংশন
function openPdf(driveId) {
    const pdfUrl = `https://drive.google.com/file/d/${driveId}/preview`;
    // আপনার বিদ্যমান PDF viewer modal ব্যবহার করুন
    if (typeof openPdfModal === 'function') {
        openPdfModal(pdfUrl);
    } else {
        window.open(pdfUrl, '_blank');
    }
}