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
            if (section.type === "title") return `<h4><strong>${section.content}</strong></h4>`;
            if (section.type === "text") return `<p>${section.content}</p>`;
            if (section.type === "math") return `<div class="math-eq">${section.content}</div>`;
            if (section.type === "box") return `<div class="content-box"><strong>${section.title}</strong><br>${section.content}</div>`;
            if (section.type === "list") return `<ul>${section.items.map(i => `<li>${i}</li>`).join('')}</ul>`;
            return '';
        }).join('');

    } catch (error) {
        contentArea.innerHTML = "<p>ক্লাস কন্টেন্ট পাওয়া যায়নি।</p>";
    }
});