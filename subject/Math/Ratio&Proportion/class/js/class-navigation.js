// Class Navigation Auto-Generator
// এই ফাইলটি automatically class navigation buttons তৈরি করবে

// ⚙️ Configuration: এখানে শুধু total class সংখ্যা দাও
const TOTAL_CLASSES = 8; // কতগুলো class আছে তা লিখো

// 🔍 বর্তমান class number বের করা
function getCurrentClassNumber() {
    const fileName = window.location.pathname.split('/').pop();
    const match = fileName.match(/class(\d+)\.html/);
    return match ? parseInt(match[1]) : 1;
}

// 🎨 Navigation buttons তৈরি করা
function createClassNavigation() {
    const currentClass = getCurrentClassNumber();
    
    let navHTML = '<div class="class-navigation" style="margin: 30px 0; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">';
    navHTML += '<h3 style="margin-bottom: 20px; color: white; text-align: center; font-size: 1.5rem;">📚 ক্লাস নেভিগেশন</h3>';
    navHTML += '<div class="class-nav-buttons" style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; margin-bottom: 20px;">';
    
    for (let i = 1; i <= TOTAL_CLASSES; i++) {
        const isActive = i === currentClass;
        const buttonStyle = isActive 
            ? 'background: white; color: #667eea; font-weight: bold; transform: scale(1.15); box-shadow: 0 6px 20px rgba(255,255,255,0.4);'
            : 'background: rgba(255,255,255,0.2); color: white; border: 2px solid rgba(255,255,255,0.3);';
        
        navHTML += `<a href="class${i}.html" style="text-decoration: none;">
            <button style="${buttonStyle} padding: 12px 20px; border: none; border-radius: 10px; cursor: pointer; font-size: 16px; transition: all 0.3s; min-width: 60px;" 
                onmouseover="if(${!isActive}) { this.style.background='rgba(255,255,255,0.3)'; this.style.transform='scale(1.1)'; }" 
                onmouseout="if(${!isActive}) { this.style.background='rgba(255,255,255,0.2)'; this.style.transform='scale(1)'; }">
                ${isActive ? '✓ ' + i : i}
            </button>
        </a>`;
    }
    
    navHTML += '</div>';
    
    // Previous/Next buttons
    navHTML += '<div class="prev-next-buttons" style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">';
    
    if (currentClass > 1) {
        navHTML += `<a href="class${currentClass - 1}.html" style="text-decoration: none;">
            <button style="padding: 12px 30px; background: white; color: #667eea; border: none; border-radius: 10px; cursor: pointer; font-size: 16px; font-weight: bold; transition: all 0.3s; box-shadow: 0 4px 15px rgba(0,0,0,0.2);" 
                onmouseover="this.style.transform='translateX(-5px)'; this.style.boxShadow='0 6px 20px rgba(0,0,0,0.3)';" 
                onmouseout="this.style.transform='translateX(0)'; this.style.boxShadow='0 4px 15px rgba(0,0,0,0.2)';">
                ← আগের
            </button>
        </a>`;
    }
    
    navHTML += `<a href="../index.html" style="text-decoration: none;">
        <button style="padding: 12px 20px; background: #FFD700; color: #333; border: none; border-radius: 10px; cursor: pointer; font-size: 20px; font-weight: bold; transition: all 0.3s; box-shadow: 0 4px 15px rgba(0,0,0,0.2);" 
            onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 6px 20px rgba(255,215,0,0.5)';" 
            onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 15px rgba(0,0,0,0.2)';">
            🏠
        </button>
    </a>`;
    
    if (currentClass < TOTAL_CLASSES) {
        navHTML += `<a href="class${currentClass + 1}.html" style="text-decoration: none;">
            <button style="padding: 12px 30px; background: white; color: #667eea; border: none; border-radius: 10px; cursor: pointer; font-size: 16px; font-weight: bold; transition: all 0.3s; box-shadow: 0 4px 15px rgba(0,0,0,0.2);" 
                onmouseover="this.style.transform='translateX(5px)'; this.style.boxShadow='0 6px 20px rgba(0,0,0,0.3)';" 
                onmouseout="this.style.transform='translateX(0)'; this.style.boxShadow='0 4px 15px rgba(0,0,0,0.2)';">
                পরের →
            </button>
        </a>`;
    }
    
    navHTML += '</div>';
    navHTML += '</div>';
    
    return navHTML;
}

// 🚀 Page load হলে navigation insert করা
document.addEventListener('DOMContentLoaded', function() {
    const container = document.querySelector('.container');
    if (container) {
        // Navigation টা content এর শুরুতে add করো
        const navElement = document.createElement('div');
        navElement.innerHTML = createClassNavigation();
        container.insertBefore(navElement, container.firstChild);
        
        // Content এর শেষেও add করো
        const navElementBottom = document.createElement('div');
        navElementBottom.innerHTML = createClassNavigation();
        container.appendChild(navElementBottom);
    }
});

// 📱 Dark mode support
const style = document.createElement('style');
style.textContent = `
    body.dark-mode .class-navigation {
        background: linear-gradient(135deg, #2d3561 0%, #3d2d52 100%) !important;
    }
    
    @media (max-width: 768px) {
        .class-nav-buttons button {
            min-width: 50px !important;
            padding: 10px 15px !important;
            font-size: 14px !important;
        }
        .prev-next-buttons button {
            padding: 10px 20px !important;
            font-size: 14px !important;
        }
        .prev-next-buttons a:nth-child(2) button {
            padding: 10px 15px !important;
            font-size: 18px !important;
        }
    }
`;
document.head.appendChild(style);
