// Navigation HTML Generator
function loadNavigation() {
  const navHTML = `
    <header class="site-header">
      <div class="header-grid">
        <a href="index.html" class="logo-link">
          <img src="images/logo.jpg" alt="Study With Keshab Logo" class="logo-img" />
        </a>
        
        <nav class="primary-navigation">
          <ul>
            <li><a href="index.html" class="nav-home"><i class="fas fa-home"></i> Home</a></li>
            <li><a href="index.html#subjects" class="nav-subjects"><i class="fas fa-book-open"></i> Subjects</a></li>
            <li><a href="about.html" class="nav-about"><i class="fas fa-info-circle"></i> About</a></li>
            <li><a href="contact.html" class="nav-contact"><i class="fas fa-envelope"></i> Contact</a></li>
            <li><a href="index.html#feedback-module" class="nav-feedback"><i class="fas fa-comment-alt"></i> Feedback</a></li>
            <li><a href="#cbt-exam-section" class="nav-cbt"><i class="fas fa-laptop-code"></i> CBT Exam</a></li>
            <li class="auth-link" id="guest-link-desktop"><a href="login.html" class="login"><i class="fas fa-sign-in-alt"></i> Login / Sign Up</a></li>
            <li class="auth-link" id="admin-link-desktop" style="display: none"><a href="admin.html"><i class="fas fa-user-shield"></i> Admin Panel</a></li>
            <li class="auth-link" id="logout-link-desktop" style="display: none"><a href="#" id="logout-btn-desktop"><i class="fas fa-sign-out-alt"></i> Log out</a></li>
          </ul>
        </nav>
        
        <div class="header-actions">
          <div id="user-info-cluster" class="user-info-cluster" style="display: none">
            <img id="header-profile-pic" src="images/default-avatar.png" alt="Profile" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 2px solid #4a90e2; cursor: pointer;" />
            <span id="user-name-display" class="nav-user-name"></span>
            <button id="show-notification-btn" title="নোটিফিকেশন" class="notification-bell-btn">
              <i class="fa-solid fa-bell"></i>
              <span id="notification-badge"></span>
            </button>
            <button class="toggle-view-btn header-action-btn" title="ডেস্কটপ মোড">
              <i class="fas fa-desktop"></i>
            </button>
          </div>
          <button class="mobile-nav-toggle" aria-controls="mobile-navigation-menu" aria-expanded="false">
            <span class="sr-only">Menu</span>
          </button>
        </div>
      </div>
    </header>

    <nav id="mobile-navigation-menu" class="mobile-navigation-menu" data-visible="false">
      <ul>
        <li><a href="index.html"><i class="fas fa-home"></i> Home</a></li>
        <li><a href="index.html#subjects"><i class="fas fa-book-open"></i> Subjects</a></li>
        <li><a href="about.html"><i class="fas fa-info-circle"></i> About</a></li>
        <li><a href="contact.html"><i class="fas fa-envelope"></i> Contact</a></li>
        <li><a href="index.html#feedback-module"><i class="fas fa-comment-alt"></i> Feedback</a></li>
        <li><a href="#cbt-exam-section"><i class="fas fa-laptop-code"></i> CBT Exam</a></li>
        <li class="auth-link" id="guest-link-mobile"><a href="login.html"><i class="fas fa-sign-in-alt"></i> Login / Sign Up</a></li>
        <li class="auth-link" id="admin-link-mobile" style="display: none"><a href="admin.html"><i class="fas fa-user-shield"></i> Admin Panel</a></li>
        <li class="auth-link" id="logout-link-mobile" style="display: none"><a href="#" id="logout-btn-mobile"><i class="fas fa-sign-out-alt"></i> Log out</a></li>
        <li><a href="#" class="toggle-view-btn"><i class="fas fa-desktop"></i> <span class="toggle-view-text">ডেস্কটপ মোড</span></a></li>
      </ul>
    </nav>

    <div class="menu-overlay" id="menu-overlay"></div>
  `;
  
  document.body.insertAdjacentHTML('afterbegin', navHTML);
}

// Load navigation when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadNavigation);
} else {
  loadNavigation();
}
