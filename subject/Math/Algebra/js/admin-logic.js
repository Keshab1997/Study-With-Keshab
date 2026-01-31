// js/admin-logic.js
const db = firebase.firestore();
const chapterId = "Algebra";
let quill;

// Initialize Quill
document.addEventListener('DOMContentLoaded', () => {
    quill = new Quill('#editor', {
        theme: 'snow',
        modules: { toolbar: [['header'], ['bold', 'italic'], [{ 'list': 'ordered'}, { 'list': 'bullet' }], ['link', 'image'], ['clean']] }
    });
    loadClassList();
    loadChapterSettings();
    loadNavSettings(); // নতুন ফাংশন
});

// --- Navigation Manager Logic ---
function addNavRow(title = "", icon = "", link = "", color = "color-home") {
    const container = document.getElementById('navButtonsContainer');
    const div = document.createElement('div');
    div.className = 'item-row';
    div.innerHTML = `
        <input type="text" placeholder="বাটন নাম" value="${title}" class="nav-title">
        <input type="text" placeholder="Icon (e.g. fa-house)" value="${icon}" class="nav-icon">
        <input type="text" placeholder="লিংক" value="${link}" class="nav-link-val">
        <select class="nav-color">
            <option value="color-home" ${color==='color-home'?'selected':''}> Blue</option>
            <option value="color-quiz" ${color==='color-quiz'?'selected':''}> Green</option>
            <option value="color-dashboard" ${color==='color-dashboard'?'selected':''}> Sky</option>
            <option value="color-pdf" ${color==='color-pdf'?'selected':''}> Red</option>
        </select>
        <button class="btn-delete" style="width:40px; border-radius:8px;" onclick="this.parentElement.remove()">X</button>
    `;
    container.appendChild(div);
}

async function loadNavSettings() {
    const doc = await db.collection("settings").doc(chapterId + "_nav").get();
    if (doc.exists) {
        const data = doc.data().buttons;
        data.forEach(b => addNavRow(b.title, b.icon, b.link, b.color));
    } else {
        // ডিফল্ট কিছু বাটন
        addNavRow("হোম", "fa-house", "../../../../index.html", "color-home");
        addNavRow("ড্যাশবোর্ড", "fa-chart-line", "#dashboard", "color-dashboard");
        addNavRow("ক্লাস নোট", "fa-book-open", "#class-notes", "color-quiz");
    }
}

async function saveNavSettings() {
    const buttons = [];
    document.querySelectorAll('#navButtonsContainer .item-row').forEach(row => {
        buttons.push({
            title: row.querySelector('.nav-title').value,
            icon: row.querySelector('.nav-icon').value,
            link: row.querySelector('.nav-link-val').value,
            color: row.querySelector('.nav-color').value
        });
    });
    try {
        await db.collection("settings").doc(chapterId + "_nav").set({ buttons });
        alert("Navigation Updated Successfully!");
    } catch (e) { alert("Error: " + e.message); }
}

// --- Existing Class Logic ---
function loadClassList() {
    const select = document.getElementById('existingClasses');
    select.innerHTML = '<option value="">-- নতুন ক্লাস তৈরি করুন --</option>';
    db.collection("class_notes").get().then(snap => {
        snap.forEach(doc => {
            const opt = document.createElement('option');
            opt.value = doc.id;
            opt.text = `${doc.data().title} (${doc.id})`;
            select.appendChild(opt);
        });
    });
}

function loadSelectedClass() {
    const id = document.getElementById('existingClasses').value;
    if (!id) {
        document.getElementById('docId').value = '';
        document.getElementById('classTitle').value = '';
        quill.root.innerHTML = '';
        document.getElementById('deleteBtn').style.display = 'none';
        return;
    }
    
    document.getElementById('deleteBtn').style.display = 'block';
    db.collection("class_notes").doc(id).get().then(doc => {
        if (doc.exists) {
            document.getElementById('docId').value = doc.id;
            document.getElementById('classTitle').value = doc.data().title;
            quill.root.innerHTML = doc.data().content;
        }
    });
}

async function saveClassData() {
    const id = document.getElementById('docId').value;
    const title = document.getElementById('classTitle').value;
    const content = quill.root.innerHTML;
    
    if (!id || !title) return alert("ID এবং Title দিন");
    
    try {
        // ক্লাস ডেটা সেভ
        await db.collection("class_notes").doc(id).set({
            title: title,
            content: content,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        alert("সেভ হয়েছে! হোমপেজ অটোমেটিক আপডেট হবে।");
        loadClassList();
    } catch (error) {
        alert("Error: " + error.message);
    }
}

function deleteClassData() {
    if (confirm("এই ক্লাসটি ডিলিট করবেন?")) {
        const id = document.getElementById('docId').value;
        db.collection("class_notes").doc(id).delete().then(() => {
            alert("ডিলিট হয়েছে!");
            document.getElementById('docId').value = '';
            document.getElementById('classTitle').value = '';
            quill.root.innerHTML = '';
            document.getElementById('deleteBtn').style.display = 'none';
            loadClassList();
        });
    }
}

// --- Chapter Settings ---
function addRow(containerId, idVal = "", titleVal = "") {
    const container = document.getElementById(containerId);
    const div = document.createElement('div');
    div.className = 'item-row';
    div.innerHTML = `
        <input type="text" placeholder="ID" value="${idVal}" class="item-id">
        <input type="text" placeholder="Title" value="${titleVal}" class="item-title">
        <button class="btn-delete" style="width:40px; border-radius:8px;" onclick="this.parentElement.remove()">×</button>
    `;
    container.appendChild(div);
}

async function loadChapterSettings() {
    const doc = await db.collection("chapters").doc(chapterId).get();
    if (doc.exists) {
        const data = doc.data();
        document.getElementById('chapterName').value = data.name || "";
        document.getElementById('chapterSubtitle').value = data.subtitle || "";
        
        // পিডিএফ লিস্ট
        document.getElementById('pdfListContainer').innerHTML = "";
        if (data.pdfs) {
            data.pdfs.forEach(p => addRow('pdfListContainer', p.id, p.title));
        }
    }
}

async function saveChapterSettings() {
    const name = document.getElementById('chapterName').value;
    const subtitle = document.getElementById('chapterSubtitle').value;
    
    // PDFs সংগ্রহ
    const pdfs = [];
    document.querySelectorAll('#pdfListContainer .item-row').forEach(row => {
        const id = row.querySelector('.item-id').value;
        const title = row.querySelector('.item-title').value;
        if (id && title) pdfs.push({id, title});
    });
    
    try {
        await db.collection("chapters").doc(chapterId).set({
            name: name,
            subtitle: subtitle,
            pdfs: pdfs,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        
        alert("চ্যাপ্টার সেটিংস সেভ হয়েছে!");
    } catch (e) {
        alert("Error: " + e.message);
    }
}

// হোমপেজ ক্লাস লিস্ট অটোমেটিক আপডেট ফাংশন (আর দরকার নেই)
// async function updateHomepageClassList() { ... }

// প্রিভিউ ফাংশন
function previewContent() {
    const content = quill.root.innerHTML;
    const formattedContent = formatMath(content);
    
    // নতুন উইন্ডোতে প্রিভিউ দেখান
    const previewWindow = window.open('', '_blank', 'width=800,height=600');
    previewWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Content Preview</title>
            <link rel="stylesheet" href="../css/class-view.css">
            <style>
                body { padding: 20px; font-family: 'Hind Siliguri', sans-serif; }
                .preview-header { background: #3498db; color: white; padding: 15px; margin: -20px -20px 20px; }
            </style>
        </head>
        <body>
            <div class="preview-header">
                <h2>📖 Content Preview</h2>
                <p>এটি দেখতে হবে যেমন স্টুডেন্টরা দেখবে</p>
            </div>
            <div class="ql-editor">
                ${formattedContent}
            </div>
        </body>
        </html>
    `);
}

// ম্যাথ ফরম্যাটিং ফাংশন
function formatMath(html) {
    // ভগ্নাংশ ফরম্যাট: \frac{a}{b} -> <div class="fraction">...</div>
    html = html.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, 
        '<div class="fraction"><span class="numerator">$1</span><span class="denominator">$2</span></div>');
    
    // পাওয়ার ফরম্যাট: x^2 -> x<sup>2</sup>
    html = html.replace(/(\w+)\^\{([^}]+)\}/g, '$1<sup>$2</sup>');
    html = html.replace(/(\w+)\^(\d+)/g, '$1<sup>$2</sup>');
    
    // স্কয়ার রুট: \sqrt{x} -> √x
    html = html.replace(/\\sqrt\{([^}]+)\}/g, '√$1');
    
    // ম্যাথ বক্স: $$...$$
    html = html.replace(/\$\$([^$]+)\$\$/g, '<div class="math-box">$1</div>');
    
    return html;
}

// অথ চেক
firebase.auth().onAuthStateChanged(user => {
    if (!user) {
        window.location.href = "../../../../login.html";
    }
});