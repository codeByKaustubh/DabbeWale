// User Registration Handler

const API_BASE_URL = 'http://localhost:5000';

document.addEventListener('DOMContentLoaded', function() {
  console.log("Main.js loaded successfully");
  
  // Registration
  const registerForm = document.querySelector('form[action="register"]') || (window.location.pathname.includes('register') && document.querySelector('form'));
  if (registerForm) {
    console.log("Registration form found");
    registerForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      const name = document.getElementById('name')?.value.trim();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const role = 'consumer';
      
      console.log("Registration attempt for:", { name, email, role });
      
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, role })
        });
        const data = await res.json();
        console.log("Registration response:", data);
        
        if (res.ok) {
          showNotification('Registration successful! You can now log in.');
          setTimeout(() => { window.location.href = 'login.html'; }, 1800);
        } else {
          showNotification(data.msg || 'Registration failed.');
        }
      } catch (err) {
        console.error("Registration error:", err);
        showNotification('Connection error. Please check if the server is running at http://localhost:5000');
      }
    });
  }

  // Login
  const loginForm = document.querySelector('form[action="login"]') || (window.location.pathname.includes('login') && document.querySelector('form'));
  if (loginForm) {
    console.log("Login form found");
    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      
      console.log("Login attempt for:", email);
      
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        console.log("Login response:", data);
        
        if (res.ok && data.token) {
          localStorage.setItem('token', data.token);
          if (data.user && data.user.name) {
            localStorage.setItem('userName', data.user.name);
          }
          showNotification('Login successful!');
          // Show welcome modal
          showWelcomeModal(data.user && data.user.name ? data.user.name : 'User');
        } else {
          showNotification(data.msg || 'Login failed.');
        }
      } catch (err) {
        console.error("Login error:", err);
        showNotification('Connection error. Please check if the server is running at http://localhost:5000');
      }
    });
  }

  // Signout
  const signoutBtn = document.getElementById('signoutBtn');
  if (signoutBtn) {
    signoutBtn.addEventListener('click', function(e) {
      e.preventDefault();
      localStorage.removeItem('token');
      localStorage.removeItem('userName');
      showNotification('You have been signed out.');
      setTimeout(() => { window.location.href = 'login.html'; }, 1200);
    });
  }

  // Profile dropdown user info
  // (Removed old userInfo/loginBtn/profileIcon logic to avoid redeclaration)

  // Profile Icon and Dropdown
  const nav = document.querySelector('.main-navbar.improved-navbar');
  if (nav && !document.getElementById('profileIcon')) {
    const container = document.createElement('div');
    container.className = 'profile-icon-container';
    container.innerHTML = `
      <span id="profileIcon" tabindex="0" aria-haspopup="true" aria-expanded="false">👤</span>
      <div id="profileDropdown" class="profile-dropdown" tabindex="-1"></div>
    `;
    nav.appendChild(container);
  }

  const profileIcon = document.getElementById('profileIcon');
  const profileDropdown = document.getElementById('profileDropdown');

  function renderProfileDropdown() {
    const token = localStorage.getItem('token');
    let html = '';
    if (token) {
      let name = localStorage.getItem('userName');
      if (!name) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          name = payload.name || payload.email || 'User';
        } catch (e) {
          name = 'User';
        }
      }
      html = `
        <div class="dropdown-item" tabindex="-1" style="font-weight:700; cursor:default;">👋 ${name}</div>
        <hr class="dropdown-divider" />
        <button class="dropdown-item" id="signoutBtn" tabindex="0">Sign Out</button>
      `;
    } else {
      html = `
        <button class="dropdown-item" onclick="window.location.href='login.html'" tabindex="0">Log in as User</button>
        <button class="dropdown-item" onclick="window.location.href='provider-login.html'" tabindex="0">Provider Login</button>
        <button class="dropdown-item" onclick="window.location.href='provider-register.html'" tabindex="0">Provider Register</button>
        <button class="dropdown-item" onclick="window.location.href='register.html'" tabindex="0">User Sign Up</button>
      `;
    }
    profileDropdown.innerHTML = html;
  }

  if (profileIcon && profileDropdown) {
    renderProfileDropdown();
    profileIcon.addEventListener('click', function(e) {
      e.stopPropagation();
      const expanded = profileDropdown.classList.toggle('show');
      profileIcon.setAttribute('aria-expanded', expanded);
      if (expanded) renderProfileDropdown();
    });
    profileIcon.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        profileDropdown.classList.toggle('show');
        renderProfileDropdown();
      }
    });
    document.addEventListener('click', function(e) {
      if (!profileDropdown.contains(e.target) && e.target !== profileIcon) {
        profileDropdown.classList.remove('show');
        profileIcon.setAttribute('aria-expanded', 'false');
      }
    });
    profileDropdown.addEventListener('click', function(e) {
      if (e.target && e.target.id === 'signoutBtn') {
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        showNotification('You have been signed out.');
        setTimeout(() => { window.location.href = 'login.html'; }, 1200);
      }
    });
  }
});

// Notification utility
function showNotification(message, duration = 2500) {
  const notification = document.getElementById('notification');
  if (!notification) return;
  notification.textContent = message;
  notification.style.display = 'block';
  notification.style.opacity = '1';
  setTimeout(() => {
    notification.style.opacity = '0';
    setTimeout(() => {
      notification.style.display = 'none';
    }, 400);
  }, duration);
}

function showWelcomeModal(name) {
  // Remove any existing modal
  const oldModal = document.getElementById('welcomeModal');
  if (oldModal) oldModal.remove();
  // Create modal HTML
  const modal = document.createElement('div');
  modal.id = 'welcomeModal';
  modal.style.position = 'fixed';
  modal.style.top = '0';
  modal.style.left = '0';
  modal.style.width = '100vw';
  modal.style.height = '100vh';
  modal.style.background = 'rgba(0,0,0,0.35)';
  modal.style.display = 'flex';
  modal.style.alignItems = 'center';
  modal.style.justifyContent = 'center';
  modal.style.zIndex = '10000';
  modal.innerHTML = `
    <style>
      #welcomeModalBox {
        background: #fffbe7;
        border-radius: 16px;
        box-shadow: 0 4px 24px rgba(67,160,71,0.13);
        padding: 2.5rem 2.2rem;
        max-width: 350px;
        width: 96vw;
        text-align: center;
      }
      #welcomeModalBox h2 {
        color: #388e3c;
        margin-bottom: 1.2rem;
        font-size: 2rem;
      }
      #welcomeModalBox p {
        font-size: 1.1rem;
        color: #333;
        margin-bottom: 1.7rem;
      }
      #closeWelcomeModal {
        background: #388e3c;
        color: #fff;
        border: none;
        border-radius: 8px;
        padding: 0.7em 2em;
        font-size: 1.1rem;
        font-weight: 600;
        cursor: pointer;
      }
      @media (max-width: 500px) {
        #welcomeModalBox {
          padding: 1.2rem 0.7rem;
        }
      }
      @media (max-width: 350px) {
        #welcomeModalBox {
          padding: 0.7rem 0.2rem;
        }
        #welcomeModalBox h2 {
          font-size: 1.25rem;
        }
        #welcomeModalBox p {
          font-size: 0.95rem;
        }
        #closeWelcomeModal {
          padding: 0.5em 1.1em;
          font-size: 0.98rem;
        }
      }
    </style>
    <div id="welcomeModalBox">
      <h2>Welcome, ${name}!</h2>
      <p>You have successfully logged in to DabbeWale.</p>
      <button id="closeWelcomeModal">Continue</button>
    </div>
  `;
  document.body.appendChild(modal);
  document.getElementById('closeWelcomeModal').onclick = function() {
    modal.remove();
    setTimeout(() => { window.location.href = 'index.html'; }, 200);
  };
}
