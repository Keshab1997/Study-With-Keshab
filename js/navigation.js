// Navigation HTML Generator
function loadNavigation() {
  const navHTML = `
    <header class="site-header">
      <div class="header-container">
        <a href="index.html" class="logo-link">
          <img src="images/logo.jpg" alt="Study With Keshab Logo" class="logo-img" />
        </a>
        
        <nav class="desktop-nav">
          <a href="index.html" class="nav-link"><i class="fas fa-home"></i> Home</a>
          <a href="index.html#subjects" class="nav-link"><i class="fas fa-book-open"></i> Subjects</a>
          <a href="about.html" class="nav-link"><i class="fas fa-info-circle"></i> About</a>
          <a href="contact.html" class="nav-link"><i class="fas fa-envelope"></i> Contact</a>
          <a href="#cbt-exam-section" class="nav-link"><i class="fas fa-laptop-code"></i> CBT Exam</a>
          <a href="admin.html" id="desktop-admin" class="nav-link" style="display:none"><i class="fas fa-user-shield"></i> Admin</a>
        </nav>
        
        <div class="header-right">
          <div id="user-info" class="user-info" style="display: none">
            <img id="header-profile-pic" src="images/default-avatar.png" alt="Profile" class="profile-pic" />
            <button id="show-notification-btn" class="icon-btn" title="নোটিফিকেশন">
              <i class="fa-solid fa-bell"></i>
              <span id="notification-badge" class="badge"></span>
            </button>
          </div>
          <a href="login.html" id="login-btn" class="btn-login">Login</a>
          <button class="hamburger" id="hamburger" aria-label="Menu">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </header>

    <nav class="mobile-nav" id="mobile-nav">
      <a href="index.html" class="mobile-link"><i class="fas fa-home"></i> Home</a>
      <a href="index.html#subjects" class="mobile-link"><i class="fas fa-book-open"></i> Subjects</a>
      <a href="about.html" class="mobile-link"><i class="fas fa-info-circle"></i> About</a>
      <a href="contact.html" class="mobile-link"><i class="fas fa-envelope"></i> Contact</a>
      <a href="#cbt-exam-section" class="mobile-link"><i class="fas fa-laptop-code"></i> CBT Exam</a>
      <a href="login.html" id="mobile-login" class="mobile-link"><i class="fas fa-sign-in-alt"></i> Login</a>
      <a href="admin.html" id="mobile-admin" class="mobile-link" style="display:none"><i class="fas fa-user-shield"></i> Admin</a>
      <a href="#" id="mobile-logout" class="mobile-link" style="display:none"><i class="fas fa-sign-out-alt"></i> Logout</a>
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
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadNavigation);
} else {
  loadNavigation();
}
