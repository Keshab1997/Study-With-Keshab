// js/class-loader.js

document.addEventListener("DOMContentLoaded", async () => {
    const db = firebase.firestore();
    const contentDiv = document.getElementById("class-content");
    const titleDiv = document.getElementById("class-title");

    const urlParams = new URLSearchParams(window.location.search);
    const classId = urlParams.get('id');

    if (!classId) return;

    try {
        const doc = await db.collection("class_notes").doc(classId).get();
        if (doc.exists) {
            const data = doc.data();
            titleDiv.innerText = data.title;
            contentDiv.innerHTML = masterParser(data.content);
            localStorage.setItem("last_read_algebra", classId);
        }
    } catch (error) {
        console.error("Error:", error);
    }
});

function masterParser(html) {
    // ১. Quill-এর হিডেন ট্যাগ পরিষ্কার করা এবং লাইন ব্রেক ঠিক করা
    let cleanText = html
        .replace(/<\/p><p>/g, "\n")
        .replace(/<p>|<\/p>|<br>/g, "\n")
        .replace(/&nbsp;/g, " ");

    // ২. HTML এনটিটি ডিকোড করা (যাতে # বা Q: ঠিকমতো চেনা যায়)
    let txtDoc = new DOMParser().parseFromString(cleanText, 'text/html');
    let text = txtDoc.body.textContent || "";

    let output = text;

    // ৩. টেবিল পার্সার [TABLE] ... [/TABLE]
    output = output.replace(/\[TABLE\]([\s\S]*?)\[\/TABLE\]/g, function(match, content) {
        let rows = content.trim().split('\n').filter(r => r.trim() !== "");
        let tableHTML = '<div class="table-container"><table class="styled-table"><thead><tr>';
        rows.forEach((row, index) => {
            let cols = row.split('|').map(c => c.trim());
            if (index === 0) {
                cols.forEach(col => tableHTML += `<th>${col}</th>`);
                tableHTML += '</tr></thead><tbody>';
            } else {
                tableHTML += '<tr>';
                cols.forEach(col => tableHTML += `<td>${col}</td>`);
                tableHTML += '</tr>';
            }
        });
        return tableHTML + '</tbody></table></div>';
    });

    // ৪. নোট এবং ওয়ার্নিং
    output = output.replace(/\[NOTE\]([\s\S]*?)\[\/NOTE\]/g, '<div class="info-note"><i class="fa-solid fa-circle-info"></i> $1</div>');
    output = output.replace(/\[WARN\]([\s\S]*?)\[\/WARN\]/g, '<div class="warn-note"><i class="fa-solid fa-triangle-exclamation"></i> $1</div>');

    // ৫. সুপার ফ্লেক্সিবল MCQ পার্সার (সব ধরণের গ্যাপ হ্যান্ডেল করবে)
    const mcqRegex = /Q:\s*([\s\S]*?)\s*A\.\s*([\s\S]*?)\s*B\.\s*([\s\S]*?)\s*C\.\s*([\s\S]*?)\s*D\.\s*([\s\S]*?)\s*Ans:\s*([\s\S]*?)(?:\n|Exp:|$)(?:Exp:\s*([\s\S]*?))?(?=\n\s*Q:|\n\s*\[|\n\s*#|$)/g;
    
    output = output.replace(mcqRegex, function(match, q, a, b, c, d, ans, exp) {
        return `
        <div class="question-card">
            <div class="q-header"><i class="fa-solid fa-file-signature"></i> প্রশ্ন</div>
            <div class="q-body">${q.trim()}</div>
            <div class="opt-grid">
                <div class="opt-item"><span>A</span> ${a.trim()}</div>
                <div class="opt-item"><span>B</span> ${b.trim()}</div>
                <div class="opt-item"><span>C</span> ${c.trim()}</div>
                <div class="opt-item"><span>D</span> ${d.trim()}</div>
            </div>
            <div class="ans-footer">
                <div class="ans-badge">সঠিক উত্তর: ${ans.trim()}</div>
                ${exp ? `<div class="exp-box"><strong>ব্যাখ্যা:</strong> ${exp.trim()}</div>` : ''}
            </div>
        </div>`;
    });

    // ৬. ম্যাথ ফরম্যাটিং (পাওয়ার এবং ভগ্নাংশ)
    output = output.replace(/\$\$(.*?)\$\$/g, function(match, math) {
        let m = math.replace(/(\w+|\d+)\/(\w+|\d+)/g, '<span class="fraction"><span class="top">$1</span><span class="bottom">$2</span></span>');
        m = m.replace(/\^(\w+)/g, '<sup>$1</sup>');
        return `<span class="math-box">${m}</span>`;
    });

    // ৭. হেডিং এবং লাইন ব্রেক (Markdown Style)
    output = output.replace(/^# (.*$)/gim, '<h2>$1</h2>');
    output = output.replace(/^## (.*$)/gim, '<h3>$1</h3>');
    output = output.replace(/\n/g, "<br>");

    return output;
}