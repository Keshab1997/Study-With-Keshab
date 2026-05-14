document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const classId = urlParams.get('id') || '1';

    try {
        // Load chapter info for logo, navigation, title and favicon
        const chapterInfoResponse = await fetch('../data/chapter-info.json');
        const chapterInfo = await chapterInfoResponse.json();
        
        // Update browser title
        const pageTitle = `${chapterInfo.chapterName} - Class ${classId} | Study With Keshab`;
        document.title = pageTitle;
        
        // Update favicon
        if (chapterInfo.logoURL) {
            // Remove old favicon if exists
            const oldFavicon = document.querySelector('link[rel="icon"]');
            if (oldFavicon) {
                oldFavicon.remove();
            }
            
            // Add new favicon
            const newFavicon = document.createElement('link');
            newFavicon.rel = 'icon';
            newFavicon.type = 'image/png';
            newFavicon.href = chapterInfo.logoURL + '?v=' + Date.now();
            document.head.appendChild(newFavicon);
            
            // Update logo image
            const logoImg = document.querySelector('header .logo');
            if (logoImg) logoImg.src = chapterInfo.logoURL;
        }
        
        console.log('Class Page Title Updated:', pageTitle);
        console.log('Class Page Favicon Updated:', chapterInfo.logoURL);
        
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
        
        // Function to convert fractions to HTML format
        function convertFractions(text) {
            if (!text) return text;
            
            // Convert complex fractions with parentheses: (R1+R2)/(R1R2)
            text = text.replace(/\(([^)]+)\)\/\(([^)]+)\)/g, "<span class='fraction'><span class='top'>($1)</span><span class='bottom'>($2)</span></span>");
            
            // Convert fractions with parentheses on one side: R1R2/(R1+R2)
            text = text.replace(/(\w+)\/(\([^)]+\))/g, "<span class='fraction'><span class='top'>$1</span><span class='bottom'>$2</span></span>");
            text = text.replace(/(\([^)]+\))\/(\w+)/g, "<span class='fraction'><span class='top'>$1</span><span class='bottom'>$2</span></span>");
            
            // Convert simple fractions: 4/2, R1/R2
            text = text.replace(/(\w+)\/(\w+)/g, "<span class='fraction'><span class='top'>$1</span><span class='bottom'>$2</span></span>");
            
            return text;
        }
        
        contentArea.innerHTML = data.sections.map(section => {
            switch(section.type) {
                case "title": return `<h3><strong>${convertFractions(section.content)}</strong></h3>`;
                case "header": return `<h4><strong>${convertFractions(section.content)}</strong></h4>`;
                case "text": return `<p>${convertFractions(section.content)}</p>`;
                case "math": return `<div class="math-eq">${convertFractions(section.content)}</div>`;
                case "box": return `<div class="content-box">${convertFractions(section.content)}</div>`;
                case "list": return `<ul>${section.items.map(i => `<li>${convertFractions(i)}</li>`).join('')}</ul>`;
                case "question": {
                    // Extract correct answer if available
                    const correctAns = section.correctAnswer || '';
                    
                    // Convert fractions in question text and explanation
                    let qTextWithFractions = convertFractions(section.qText);
                    let explanationWithFractions = convertFractions(section.explanation);
                    
                    // Highlight correct answer in options
                    let qTextWithHighlight = qTextWithFractions;
                    if (correctAns) {
                        // Add highlighting to the correct option
                        qTextWithHighlight = qTextWithHighlight.replace(
                            new RegExp(`<li>\\(${correctAns}\\)([^<]+)</li>`, 'g'),
                            `<li style="background: #d4edda; border-left: 4px solid #28a745; padding: 8px; margin: 5px 0; border-radius: 4px; font-weight: bold;">(${correctAns})$1 ✓</li>`
                        );
                    }
                    
                    return `
                        <div class="question-item">
                            <h3>প্রশ্ন</h3>
                            <p>${qTextWithHighlight}</p>
                            ${correctAns ? `<div style="background: #fff3cd; padding: 10px; border-radius: 6px; margin: 10px 0; border-left: 4px solid #ffc107;"><strong>সঠিক উত্তর:</strong> (${correctAns})</div>` : ''}
                            <div class="explanation">${explanationWithFractions}</div>
                        </div>`;
                }
                default: return '';
            }
        }).join('');

    } catch (error) {
        console.error("Error:", error);
        document.getElementById('class-content-area').innerHTML = "<p>ক্লাস কন্টেন্ট পাওয়া যায়নি।</p>";
    }
});
