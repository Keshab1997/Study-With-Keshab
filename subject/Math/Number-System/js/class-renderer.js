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

        // Update browser title dynamically
        document.title = `${data.chapterName} - Class ${data.classNumber} | Study With Keshab`;

        document.getElementById('dynamic-chapter-name').innerText = data.chapterName;
        document.getElementById('dynamic-class-no').innerText = `CLASS NO: ${data.classNumber}`;

        const contentArea = document.getElementById('class-content-area');
        
        contentArea.innerHTML = data.sections.map(section => {
            switch(section.type) {
                case "title": return `<h3><strong>${section.content}</strong></h3>`;
                case "header": return `<h4><strong>${section.content}</strong></h4>`;
                case "text": return `<p>${renderFractions(section.content)}</p>`;
                case "math": return `<div class="math-formula">$$${section.content}$$</div>`;
                case "box": return `<div class="content-box">${section.content}</div>`;
                case "list": return `<ul>${section.items.map(i => `<li>${renderFractions(i)}</li>`).join('')}</ul>`;
                case "question": return `
                    <div class="question-item">
                        <h3>প্রশ্ন</h3>
                        <p>${section.qText}</p>
                        <div class="explanation">${section.explanation}</div>
                    </div>`;
                case "calculation": return `
                    <div class="calculation-box">
                        <pre>${renderFractions(section.content)}</pre>
                    </div>`;
                default: return '';
            }
        }).join('');

        // Add CSS for calculation box and math formula
        const style = document.createElement('style');
        style.textContent = `
            .calculation-box {
                background: #f8f9fa;
                border-left: 4px solid #667eea;
                padding: 15px;
                margin: 15px 0;
                border-radius: 8px;
                font-family: 'Courier New', monospace;
            }
            .calculation-box pre {
                margin: 0;
                white-space: pre;
                font-size: 1.1rem;
                line-height: 1.8;
                color: #333;
                tab-size: 4;
                -moz-tab-size: 4;
                letter-spacing: 0.05em;
            }
            .math-formula {
                background: #fff9e6;
                border: 2px solid #ffd700;
                padding: 20px;
                margin: 20px 0;
                border-radius: 12px;
                text-align: center;
                font-size: 1.3rem;
            }
            .fraction {
                display: inline-flex;
                flex-direction: column;
                vertical-align: middle;
                text-align: center;
                margin: 0 3px;
                font-size: 0.9em;
            }
            .fraction .numerator {
                border-bottom: 1.5px solid currentColor;
                padding: 0 4px 2px;
            }
            .fraction .denominator {
                padding: 2px 4px 0;
            }
        `;
        document.head.appendChild(style);

        // Function to render fractions
        function renderFractions(text) {
            // First handle superscripts like 10^K, 10^6, 10^-3
            text = text.replace(/(\d+)\^([A-Za-z]|\-?\d+|\([^)]+\))/g, (match, base, exponent) => {
                return `${base}<sup>${exponent}</sup>`;
            });
            
            // Match patterns like 3/(2 × 6) or 4/8 or 1/16
            return text.replace(/(\d+)\/(\d+|\([^)]+\))/g, (match, numerator, denominator) => {
                // Remove parentheses from denominator if present
                const cleanDenom = denominator.replace(/[()]/g, '');
                return `<span class="fraction"><span class="numerator">${numerator}</span><span class="denominator">${cleanDenom}</span></span>`;
            });
        }

        // Load MathJax for rendering LaTeX formulas
        if (!window.MathJax) {
            window.MathJax = {
                tex: {
                    inlineMath: [['$', '$']],
                    displayMath: [['$$', '$$']]
                },
                svg: { fontCache: 'global' }
            };
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js';
            script.async = true;
            document.head.appendChild(script);
        } else {
            MathJax.typesetPromise();
        }

    } catch (error) {
        console.error("Error:", error);
        document.getElementById('class-content-area').innerHTML = "<p>ক্লাস কন্টেন্ট পাওয়া যায়নি।</p>";
    }
});
