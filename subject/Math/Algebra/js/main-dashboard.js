// js/main-dashboard.js
document.addEventListener('DOMContentLoaded', async () => {
    const db = firebase.firestore();
    const chapterId = "Algebra";
    let chapterData = null;

    // ডেটা লোড
    const doc = await db.collection("chapters").doc(chapterId).get();
    if (doc.exists) {
        chapterData = doc.data();
        renderDashboard(chapterData);
    }

    // ডাইনামিক নেভিগেশন রেন্ডার
    await renderDynamicNav();

    // বুকমার্ক চেক
    const lastRead = localStorage.getItem("last_read_algebra");
    if (lastRead) {
        const continueBtn = document.getElementById("continue-reading");
        if (continueBtn) {
            continueBtn.style.display = "block";
            continueBtn.href = `class/template.html?id=${lastRead}`;
        }
    }

    // সার্চ লজিক
    const searchBar = document.getElementById("search-bar");
    if (searchBar) {
        searchBar.addEventListener("input", (e) => {
            const term = e.target.value.toLowerCase();
            if (!chapterData) return;

            // ক্লাস ফিল্টার
            if (chapterData.classes) {
                const filteredClasses = chapterData.classes.filter(c => 
                    c.title.toLowerCase().includes(term)
                );
                renderList("dynamic-class-list", filteredClasses, "class");
            }

            // পিডিএফ ফিল্টার
            if (chapterData.pdfs) {
                const filteredPdfs = chapterData.pdfs.filter(p => 
                    p.title.toLowerCase().includes(term)
                );
                renderList("pdf-grid-container", filteredPdfs, "pdf");
            }
        });
    }
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

function renderDashboard(data) {
    // চ্যাপ্টার নাম আপডেট
    const titleElement = document.querySelector('.header-text h1');
    if (titleElement && data.name) {
        titleElement.innerText = `অধ্যায়: ${data.name}`;
    }

    // CBT লিংক আপডেট
    const cbtBtn = document.querySelector('.nav-button.color-cbt');
    if (cbtBtn && data.cbtLink) {
        cbtBtn.href = data.cbtLink;
    }

    // লিস্ট রেন্ডার
    if (data.classes) renderList("dynamic-class-list", data.classes, "class");
    if (data.pdfs) renderList("pdf-grid-container", data.pdfs, "pdf");
}

function renderList(containerId, list, type) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = list.map(item => {
        if (type === 'class') {
            return `<a href="class/template.html?id=${item.id}">
                <i class="fa-solid fa-person-chalkboard fa-fw"></i> ${item.title}
            </a>`;
        } else if (type === 'pdf') {
            return `<div class="pdf-card" onclick="openPdf('${item.id}')">
                <i class="fa-solid fa-file-pdf"></i>
                <span>${item.title}</span>
            </div>`;
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