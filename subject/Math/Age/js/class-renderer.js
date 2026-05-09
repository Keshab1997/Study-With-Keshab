document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const classId = urlParams.get('id') || '1';

    try {
        // Load chapter info for logo and navigation
        const chapterInfoResponse = await fetch('../data/chapter-info.json');
        const chapterInfo = await chapterInfoResponse.json();
        
        // Set logo if available
        if (chapterInfo.logoURL) {
            const logoImg = document.querySelector('header .logo');
            if (logoImg) logoImg.src = chapterInfo.logoURL;
        }
        
        // Create navigation buttons
        const navContainer = document.getElementById('class-navigation');
        if (navContainer && chapterInfo.classes) {
            navContainer.innerHTML = chapterInfo.classes.map(cls => {
                const isActive = cls.id === classId;
                return `<a href="class.html?id=${cls.id}" style="padding: 10px 20px; background: ${isActive ? '#667eea' : '#f0f0f0'}; color: ${isActive ? 'white' : '#333'}; border-radius: 8px; text-decoration: none; font-weight: ${isActive ? 'bold' : 'normal'};">Class ${cls.id}</a>`;
            }).join('');
        }
        
        // Load class content
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
