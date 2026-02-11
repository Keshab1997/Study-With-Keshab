// Features Section Animations
document.addEventListener('DOMContentLoaded', function() {
    
    // Add progress bars to feature items
    const featureItems = document.querySelectorAll('.feature-item');
    const progressValues = [90, 85, 95, 88]; // Different progress for each feature
    
    featureItems.forEach((item, index) => {
        // Add progress bar
        const progressBar = document.createElement('div');
        progressBar.className = 'feature-progress';
        progressBar.innerHTML = `<div class="feature-progress-bar" style="--progress: ${progressValues[index]}%"></div>`;
        item.appendChild(progressBar);
        
        // Add percentage text
        const percentText = document.createElement('span');
        percentText.className = 'feature-percent';
        percentText.textContent = `${progressValues[index]}% সফলতার হার`;
        percentText.style.cssText = 'display: block; margin-top: 10px; font-size: 14px; color: #4a90e2; opacity: 0; transition: opacity 0.3s;';
        item.appendChild(percentText);
        
        // Show percentage on hover
        item.addEventListener('mouseenter', () => {
            percentText.style.opacity = '1';
        });
        
        item.addEventListener('mouseleave', () => {
            percentText.style.opacity = '0';
        });
    });
    
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.2,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.6s ease-out forwards';
                entry.target.style.opacity = '1';
            }
        });
    }, observerOptions);
    
    featureItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.animationDelay = `${index * 0.1}s`;
        observer.observe(item);
    });
    
    // Stats counter animation (if not already implemented)
    const statNumbers = document.querySelectorAll('.stat-number');
    
    const animateCounter = (element) => {
        const target = parseInt(element.getAttribute('data-target'));
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;
        
        const updateCounter = () => {
            current += increment;
            if (current < target) {
                element.textContent = Math.floor(current);
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target;
            }
        };
        
        updateCounter();
    };
    
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.target.textContent === '0') {
                animateCounter(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    statNumbers.forEach(stat => {
        statsObserver.observe(stat);
    });
});
