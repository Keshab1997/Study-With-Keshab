// Navigation HTML Generator
function loadNavigation() {
  // Check for manual override first
  const rootPath = window.__MANUAL_ROOT_PATH__ || (() => {
    const pathDepth = window.location.pathname.split('/').filter(p => p && p !== 'index.html').length;
    return pathDepth > 1 ? '../../' : pathDepth === 1 ? '../' : '';
  })();
  
  const navHTML = `
    <header class="site-header">
      <div class="header-container">
        <a href="${rootPath}index.html" class="logo-link">
          <img src="${rootPath}images/icons/icon-512x512.png" alt="Study With Keshab Logo" class="logo-img" />
        </a>
        
        <nav class="desktop-nav">
          <a href="${rootPath}index.html" class="nav-link"><i class="fas fa-home"></i> Home</a>
          <a href="${rootPath}index.html#subjects" class="nav-link"><i class="fas fa-book-open"></i> Subjects</a>
          <a href="${rootPath}about.html" class="nav-link"><i class="fas fa-info-circle"></i> About</a>
          <a href="${rootPath}contact.html" class="nav-link"><i class="fas fa-envelope"></i> Contact</a>
          <a href="${rootPath}index.html#cbt-exam-section" class="nav-link"><i class="fas fa-laptop-code"></i> CBT Exam</a>
          <a href="${rootPath}profile.html" id="desktop-profile" class="nav-link" style="display:none"><i class="fas fa-user"></i> Profile</a>
          <a href="${rootPath}admin.html" id="desktop-admin" class="nav-link" style="display:none"><i class="fas fa-user-shield"></i> Admin</a>
        </nav>
        
        <div class="header-right">
          <div id="user-info" class="user-info" style="display: none">
            <img id="header-profile-pic" src="${rootPath}images/default-avatar.png" alt="Profile" class="profile-pic" />
            <button id="show-notification-btn" class="icon-btn" title="নোটিফিকেশন">
              <i class="fa-solid fa-bell"></i>
              <span id="notification-badge" class="badge"></span>
            </button>
          </div>
          <a href="${rootPath}login.html" id="login-btn" class="btn-login">Login</a>
          <button class="hamburger" id="hamburger" aria-label="Menu">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </header>

    ${window.__CHAPTER_BANNER__ || ''}

    <nav class="mobile-nav" id="mobile-nav">
      <!-- User Profile Header -->
      <div class="nav-user-header" id="nav-user-header" style="display: none">
        <img id="nav-profile-img" src="${rootPath}images/default-avatar.png" alt="User" />
        <h4 id="nav-user-name">Guest</h4>
      </div>
      
      <div class="mobile-nav-links">
        <a href="${rootPath}index.html" class="mobile-link"><i class="fas fa-home"></i> Home</a>
        <a href="${rootPath}index.html#subjects" class="mobile-link"><i class="fas fa-book-open"></i> Subjects</a>
        <a href="${rootPath}about.html" class="mobile-link"><i class="fas fa-info-circle"></i> About</a>
        <a href="${rootPath}contact.html" class="mobile-link"><i class="fas fa-envelope"></i> Contact</a>
        <a href="${rootPath}index.html#cbt-exam-section" class="mobile-link"><i class="fas fa-laptop-code"></i> CBT Exam</a>
        <a href="${rootPath}login.html" id="mobile-login" class="mobile-link"><i class="fas fa-sign-in-alt"></i> Login</a>
        <a href="${rootPath}profile.html" id="mobile-profile" class="mobile-link" style="display:none"><i class="fas fa-user"></i> Profile</a>
        <a href="${rootPath}admin.html" id="mobile-admin" class="mobile-link" style="display:none"><i class="fas fa-user-shield"></i> Admin</a>
        <a href="#" id="mobile-logout" class="mobile-link" style="display:none"><i class="fas fa-sign-out-alt"></i> Logout</a>
      </div>
    </nav>

    <div class="overlay" id="overlay"></div>
  `;
  
  document.body.insertAdjacentHTML('afterbegin', navHTML);
  
  // Hamburger menu toggle
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobile-nav');
  const overlay = document.getElementById('overlay');
  
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mobileNav.classList.toggle('active');
    overlay.classList.toggle('active');
  });
  
  overlay.addEventListener('click', () => {
    hamburger.classList.remove('active');
    mobileNav.classList.remove('active');
    overlay.classList.remove('active');
  });
  
  // Auto-close mobile menu when clicking any link
  const mobileLinks = mobileNav.querySelectorAll('.mobile-link');
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      mobileNav.classList.remove('active');
      overlay.classList.remove('active');
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadNavigation);
} else {
  loadNavigation();
}

// Page Transition Animation
document.addEventListener('DOMContentLoaded', () => {
  const rootPath = window.__MANUAL_ROOT_PATH__ || (() => {
    const pathDepth = window.location.pathname.split('/').filter(p => p && p !== 'index.html').length;
    return pathDepth > 1 ? '../../' : pathDepth === 1 ? '../' : '';
  })();
  
  const overlay = document.createElement('div');
  overlay.className = 'page-transition';
  overlay.innerHTML = `
    <div class="transition-circle"></div>
    <img src="${rootPath}images/icons/icon-192x192.png" class="transition-logo" alt="">
  `;
  document.body.appendChild(overlay);

  const links = document.querySelectorAll('a');
  
  links.forEach(link => {
    link.addEventListener('click', e => {
      const targetUrl = link.href;

      if (targetUrl.includes(window.location.hostname) && !targetUrl.includes('#') && !link.target) {
        e.preventDefault();
        overlay.classList.add('active');
        setTimeout(() => {
          window.location.href = targetUrl;
        }, 800);
      }
    });
  });
});

window.addEventListener('pageshow', () => {
  const overlay = document.querySelector('.page-transition');
  if (overlay) {
    overlay.classList.remove('active');
  }
});
