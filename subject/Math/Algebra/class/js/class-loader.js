// =========================================
// FILE: subject/Math/Algebra/class/js/class-loader.js
// (Upgraded with MCQ Numbering)
// =========================================

document.addEventListener("DOMContentLoaded", async () => {
    const db = firebase.firestore();
    const contentDiv = document.getElementById("class-content");
    const titleDiv = document.getElementById("class-title");

    const urlParams = new URLSearchParams(window.location.search);
    const classId = urlParams.get('id');

    if (!classId) {
        contentDiv.innerHTML = "<p class='error-msg'>কোনো ক্লাস আইডি পাওয়া যায়নি!</p>";
        return;
    }

    try {
        const doc = await db.collection("class_notes").doc(classId).get();
        if (doc.exists) {
            const data = doc.data();
            if(titleDiv) titleDiv.innerText = data.title;
            
            contentDiv.innerHTML = masterParser(data.content);
            
            localStorage.setItem("last_read_algebra", classId);
        } else {
            contentDiv.innerHTML = "<p class='error-msg'>দুঃখিত, এই ক্লাসটি খুঁজে পাওয়া যায়নি।</p>";
        }
    } catch (error) {
        console.error("Error:", error);
        contentDiv.innerHTML = `<p class='error-msg'>Error: ${error.message}</p>`;
    }
});

function masterParser(html) {
    if (!html) return "";

    // ১. Quill editor cleanup
    let cleanText = html
        .replace(/<\/p><p>/g, "\n")
        .replace(/<p>|<\/p>|<br>/g, "\n")
        .replace(/&nbsp;/g, " ");

    // ২. HTML entity decode
    let txtDoc = new DOMParser().parseFromString(cleanText, 'text/html');
    let text = txtDoc.body.textContent || "";

    let output = text;

    // ৩. Note & Warning Boxes
    output = output.replace(/\[NOTE\]([\s\S]*?)\[\/NOTE\]/g, `
        <div class="note-box info">
            <div class="box-icon"><i class="fas fa-info-circle"></i></div>
            <div>$1</div>
        </div>
    `);
    output = output.replace(/\[WARN\]([\s\S]*?)\[\/WARN\]/g, `
        <div class="note-box warning">
            <div class="box-icon"><i class="fas fa-exclamation-triangle"></i></div>
            <div>$1</div>
        </div>
    `);

    // ৪. Table
    output = output.replace(/\[TABLE\]([\s\S]*?)\[\/TABLE\]/g, function(match, content) {
        let rows = content.trim().split('\n').filter(r => r.trim() !== "");
        let tableHTML = '<div class="table-wrapper"><table class="styled-table"><thead><tr>';
        let headers = rows[0].split('|').map(c => c.trim());
        headers.forEach(h => tableHTML += `<th>${h}</th>`);
        tableHTML += '</tr></thead><tbody>';
        for (let i = 1; i < rows.length; i++) {
            let cols = rows[i].split('|').map(c => c.trim());
            tableHTML += '<tr>';
            cols.forEach(c => tableHTML += `<td>${c}</td>`);
            tableHTML += '</tr>';
        }
        return tableHTML + '</tbody></table></div>';
    });

    // ৫. *** MCQ Parser with Numbering ***
    let mcqCounter = 0;
    const mcqRegex = /Q:\s*([\s\S]*?)\s*A\.\s*([\s\S]*?)\s*B\.\s*([\s\S]*?)\s*C\.\s*([\s\S]*?)\s*D\.\s*([\s\S]*?)\s*Ans:\s*([\s\S]*?)(?:\n|Exp:|$)(?:Exp:\s*([\s\S]*?))?(?=\n\s*Q:|\n\s*\[|\n\s*#|$)/g;
    output = output.replace(mcqRegex, function(match, q, a, b, c, d, ans, exp) {
        mcqCounter++; // Increment counter for each question
        return `
        <div class="mcq-card">
            <div class="mcq-badge">প্রশ্ন ${mcqCounter}</div>
            <p class="mcq-question">${q.trim()}</p>
            <div class="mcq-options">
                <div class="mcq-option"><span>A.</span> ${a.trim()}</div>
                <div class="mcq-option"><span>B.</span> ${b.trim()}</div>
                <div class="mcq-option"><span>C.</span> ${c.trim()}</div>
                <div class="mcq-option"><span>D.</span> ${d.trim()}</div>
            </div>
            <div class="mcq-answer-box">
                <strong>সঠিক উত্তর: ${ans.trim()}</strong>
                ${exp ? `<br><small><b>ব্যাখ্যা:</b> ${exp.trim()}</small>` : ''}
            </div>
        </div>`;
    });

    // ৬. Advanced Math Parser
    output = output.replace(/\$\$(.*?)\$\$/g, function(match, mathContent) {
        let formattedMath = mathContent.trim();
        formattedMath = formattedMath.replace(/(\w+|\d+)\/(\w+|\d+)/g, 
            '<span class="fraction"><span class="numerator">$1</span><span class="denominator">$2</span></span>');
        formattedMath = formattedMath.replace(/\^(\w+|\d+|\{.*?\})/g, '<sup>$1</sup>');
        return `<span class="math-block">${formattedMath}</span>`;
    });

    // ৭. Headings
    output = output.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    output = output.replace(/^# (.*$)/gim, '<h1 style="font-size:2rem; text-align:center; margin:30px 0;">$1</h1>');
    output = output.replace(/\n/g, "<br>");

    return output;
}