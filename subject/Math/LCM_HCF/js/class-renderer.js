document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const classId = urlParams.get('id') || '1';

    try {
        const response = await fetch(`../data/class${classId}.json`);
        const data = await response.json();

        document.getElementById('dynamic-chapter-name').innerText = data.chapterName;
        document.getElementById('dynamic-class-no').innerText = `CLASS NO: ${data.classNumber}`;

        const contentArea = document.getElementById('class-content-area');
        
        contentArea.innerHTML = data.sections.map(section => {
            switch(section.type) {
                case "title": return `<h3><strong>${section.content}</strong></h3>`;
                case "header": return `<h4><strong>${section.content}</strong></h4>`;
                case "text": return `<p>${section.content}</p>`;
                case "math": return `<div class="math-eq">${section.content}</div>`;
                case "box": return `<div class="content-box">${section.content}</div>`;
                case "list": return `<ul>${section.items.map(i => `<li>${i}</li>`).join('')}</ul>`;
                case "question": return `
                    <div class="question-item">
                        <h3>প্রশ্ন</h3>
                        <p>${section.qText}</p>
                        <div class="explanation">${section.explanation}</div>
                    </div>`;
                default: return '';
            }
        }).join('');

    } catch (error) {
        console.error("Error:", error);
        document.getElementById('class-content-area').innerHTML = "<p>ক্লাস কন্টেন্ট পাওয়া যায়নি।</p>";
    }
});
