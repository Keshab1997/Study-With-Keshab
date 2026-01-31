// js/admin-logic.js
const db = firebase.firestore();
const chapterId = "Algebra";
var quill;

// ট্যাব সুইচিং
function openTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    event.currentTarget.classList.add('active');
}

// এডিটর ইনিশিয়ালাইজ
document.addEventListener('DOMContentLoaded', () => {
    quill = new Quill('#editor', {
        theme: 'snow',
        modules: {
            toolbar: [['header'], ['bold', 'italic'], ['list'], ['link'], ['clean']]
        }
    });
    loadClassList();
    loadChapterSettings();
});

// ক্লাস লিস্ট লোড
function loadClassList() {
    const select = document.getElementById('existingClasses');
    select.innerHTML = '<option value="">-- নতুন ক্লাস --</option>';
    db.collection("class_notes").get().then(snap => {
        snap.forEach(doc => {
            const opt = document.createElement('option');
            opt.value = doc.id;
            opt.text = `${doc.data().title} (${doc.id})`;
            select.appendChild(opt);
        });
    });
}

// ক্লাস সিলেক্ট
function loadSelectedClass() {
    const id = document.getElementById('existingClasses').value;
    if (!id) {
        document.getElementById('docId').value = '';
        document.getElementById('classTitle').value = '';
        quill.root.innerHTML = '';
        return;
    }
    
    db.collection("class_notes").doc(id).get().then(doc => {
        if (doc.exists) {
            document.getElementById('docId').value = doc.id;
            document.getElementById('classTitle').value = doc.data().title;
            quill.root.innerHTML = doc.data().content;
        }
    });
}

// ক্লাস সেভ
function saveClassData() {
    const id = document.getElementById('docId').value;
    const title = document.getElementById('classTitle').value;
    const content = quill.root.innerHTML;
    
    if (!id || !title) return alert("ID এবং Title দিন");
    
    db.collection("class_notes").doc(id).set({
        title: title,
        content: content,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        alert("সেভ হয়েছে!");
        loadClassList();
    });
}

// রো যোগ করা
function addRow(containerId, idVal = "", titleVal = "") {
    const container = document.getElementById(containerId);
    const div = document.createElement('div');
    div.className = 'item-row';
    div.innerHTML = `
        <input type="text" placeholder="ID" value="${idVal}" class="item-id">
        <input type="text" placeholder="Title" value="${titleVal}" class="item-title">
        <button class="btn-remove" onclick="this.parentElement.remove()">×</button>
    `;
    container.appendChild(div);
}

// চ্যাপ্টার সেটিংস লোড
async function loadChapterSettings() {
    const doc = await db.collection("chapters").doc(chapterId).get();
    if (doc.exists) {
        const data = doc.data();
        document.getElementById('chapterName').value = data.name || "";
        document.getElementById('cbtLink').value = data.cbtLink || "";
        
        // ক্লাস লিস্ট
        document.getElementById('classListContainer').innerHTML = "";
        if (data.classes) {
            data.classes.forEach(c => addRow('classListContainer', c.id, c.title));
        }
        
        // পিডিএফ লিস্ট
        document.getElementById('pdfListContainer').innerHTML = "";
        if (data.pdfs) {
            data.pdfs.forEach(p => addRow('pdfListContainer', p.id, p.title));
        }
    }
}

// চ্যাপ্টার সেটিংস সেভ
async function saveChapterSettings() {
    const name = document.getElementById('chapterName').value;
    const cbtLink = document.getElementById('cbtLink').value;
    
    const classes = [];
    document.querySelectorAll('#classListContainer .item-row').forEach(row => {
        const id = row.querySelector('.item-id').value;
        const title = row.querySelector('.item-title').value;
        if (id && title) classes.push({id, title});
    });
    
    const pdfs = [];
    document.querySelectorAll('#pdfListContainer .item-row').forEach(row => {
        const id = row.querySelector('.item-id').value;
        const title = row.querySelector('.item-title').value;
        if (id && title) pdfs.push({id, title});
    });
    
    await db.collection("chapters").doc(chapterId).set({
        name: name,
        cbtLink: cbtLink,
        classes: classes,
        pdfs: pdfs,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    alert("হোমপেজ আপডেট হয়েছে!");
}

// অথ চেক
firebase.auth().onAuthStateChanged(user => {
    if (!user) {
        window.location.href = "../../../../login.html";
    }
});