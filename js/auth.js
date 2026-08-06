/* ==========================================================================
   FoodiVerse Authentication & User Session Module
   Supports Login, Signup, Remember Me, Show/Hide Password, Strength Meter,
   Form Validations and LocalStorage persistence.
   ========================================================================== */

const Auth = {
  currentUser: JSON.parse(localStorage.getItem('foodiverse_user')) || null,
  usersDatabase: JSON.parse(localStorage.getItem('foodiverse_users_db')) || [
    {
      name: 'Alex Morgan',
      email: 'alex@example.com',
      phone: '+1 555-019-2834',
      password: 'Password123!',
      joined: '01/01/2026'
    }
  ],

  init() {
    this.updateUserUI();
    this.bindGlobalEvents();
    this.initStandalonePages();
  },

  bindGlobalEvents() {
    // Open modal triggers if on a page with modal
    document.querySelectorAll('.auth-btn-trigger').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const mode = btn.dataset.mode || 'login';
        // Check if on dedicated auth page or modal page
        if (window.location.pathname.endsWith('login.html') || window.location.pathname.endsWith('signup.html')) {
          window.location.href = mode === 'signup' ? 'signup.html' : 'login.html';
        } else {
          e.preventDefault();
          this.openAuthModal(mode);
        }
      });
    });

    const closeBtn = document.getElementById('closeAuthModalBtn');
    const modalOverlay = document.getElementById('authModalOverlay');
    if (closeBtn) closeBtn.addEventListener('click', () => this.closeAuthModal());
    if (modalOverlay) {
      modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) this.closeAuthModal();
      });
    }

    // Modal tabs toggle
    document.querySelectorAll('.auth-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.switchTab(btn.dataset.tab);
      });
    });

    // Modal Form Submissions
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleLogin();
      });
    }
    if (signupForm) {
      signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSignup();
      });
    }
  },

  /* --------------------------------------------------------------------------
     Standalone Login & Signup Page Logic
     -------------------------------------------------------------------------- */
  initStandalonePages() {
    // Login Page Specifics
    const pageLoginForm = document.getElementById('pageLoginForm');
    if (pageLoginForm) {
      // Remember me email pre-fill
      const rememberedEmail = localStorage.getItem('foodiverse_remembered_email');
      const emailInput = document.getElementById('pageLoginEmail');
      const rememberCheckbox = document.getElementById('rememberMe');
      if (rememberedEmail && emailInput) {
        emailInput.value = rememberedEmail;
        if (rememberCheckbox) rememberCheckbox.checked = true;
      }

      pageLoginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handlePageLogin();
      });
    }

    // Signup Page Specifics
    const pageSignupForm = document.getElementById('pageSignupForm');
    const passInput = document.getElementById('pageSignupPassword');

    if (passInput) {
      passInput.addEventListener('input', () => {
        this.checkPasswordStrength(passInput.value);
      });
    }

    if (pageSignupForm) {
      pageSignupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handlePageSignup();
      });
    }
  },

  /* Password Visibility Toggle Helper */
  togglePasswordVisibility(inputId, iconId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);
    if (!input || !icon) return;

    if (input.type === 'password') {
      input.type = 'text';
      icon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
      input.type = 'password';
      icon.classList.replace('fa-eye-slash', 'fa-eye');
    }
  },

  /* Password Strength Meter */
  checkPasswordStrength(password) {
    const meterFill = document.getElementById('strengthMeterFill');
    const meterText = document.getElementById('strengthMeterText');
    if (!meterFill || !meterText) return;

    if (!password) {
      meterFill.className = 'strength-meter-fill';
      meterFill.style.width = '0%';
      meterText.textContent = '';
      return;
    }

    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    meterFill.className = 'strength-meter-fill';

    if (score <= 2) {
      meterFill.classList.add('strength-weak');
      meterText.textContent = 'Weak Password';
      meterText.style.color = 'var(--danger)';
    } else if (score <= 4) {
      meterFill.classList.add('strength-medium');
      meterText.textContent = 'Medium Strength';
      meterText.style.color = 'var(--warning)';
    } else {
      meterFill.classList.add('strength-strong');
      meterText.textContent = 'Strong Password';
      meterText.style.color = 'var(--success)';
    }
  },

  /* Validation Helpers */
  validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },

  validatePhone(phone) {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 10;
  },

  /* Handle Standalone Login */
  handlePageLogin() {
    const email = document.getElementById('pageLoginEmail')?.value.trim();
    const password = document.getElementById('pageLoginPassword')?.value;
    const rememberMe = document.getElementById('rememberMe')?.checked;

    if (!email || !password) {
      if (window.showToast) window.showToast('Please enter both email and password');
      return;
    }

    if (!this.validateEmail(email)) {
      if (window.showToast) window.showToast('Please enter a valid email address');
      return;
    }

    // Verify against DB
    const existingUser = this.usersDatabase.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!existingUser) {
      // Allow demo fallback login if user not found in DB
      const newUser = {
        name: email.split('@')[0],
        email: email,
        joined: new Date().toLocaleDateString()
      };
      this.usersDatabase.push(newUser);
      localStorage.setItem('foodiverse_users_db', JSON.stringify(this.usersDatabase));
      this.loginUserSuccess(newUser, rememberMe);
    } else {
      if (existingUser.password && existingUser.password !== password) {
        if (window.showToast) window.showToast('Invalid email or password');
        return;
      }
      this.loginUserSuccess(existingUser, rememberMe);
    }
  },

  /* Handle Standalone Signup */
  handlePageSignup() {
    const name = document.getElementById('pageSignupName')?.value.trim();
    const email = document.getElementById('pageSignupEmail')?.value.trim();
    const phone = document.getElementById('pageSignupPhone')?.value.trim();
    const password = document.getElementById('pageSignupPassword')?.value;
    const confirmPassword = document.getElementById('pageSignupConfirmPassword')?.value;

    if (!name || !email || !phone || !password || !confirmPassword) {
      if (window.showToast) window.showToast('Please complete all required fields');
      return;
    }

    if (!this.validateEmail(email)) {
      if (window.showToast) window.showToast('Please enter a valid email address');
      return;
    }

    if (!this.validatePhone(phone)) {
      if (window.showToast) window.showToast('Please enter a valid phone number (min 10 digits)');
      return;
    }

    if (password.length < 6) {
      if (window.showToast) window.showToast('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      if (window.showToast) window.showToast('Passwords do not match');
      return;
    }

    // Check if user already exists
    const existing = this.usersDatabase.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      if (window.showToast) window.showToast('An account with this email already exists. Please login.');
      return;
    }

    const newUser = {
      name: name,
      email: email,
      phone: phone,
      password: password,
      joined: new Date().toLocaleDateString()
    };

    this.usersDatabase.push(newUser);
    localStorage.setItem('foodiverse_users_db', JSON.stringify(this.usersDatabase));

    this.loginUserSuccess(newUser, true);
  },

  /* Login Success Helper */
  loginUserSuccess(user, rememberMe = false) {
    this.currentUser = user;
    localStorage.setItem('foodiverse_user', JSON.stringify(user));

    if (rememberMe) {
      localStorage.setItem('foodiverse_remembered_email', user.email);
    } else {
      localStorage.removeItem('foodiverse_remembered_email');
    }

    this.updateUserUI();

    if (window.showToast) window.showToast(`Success! Welcome to FoodiVerse, ${user.name}!`);

    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1200);
  },

  /* Modal Login Handler */
  handleLogin() {
    const email = document.getElementById('loginEmail')?.value.trim();
    const pass = document.getElementById('loginPassword')?.value;
    if (!email || !pass) {
      if (window.showToast) window.showToast('Please fill in login details');
      return;
    }
    const user = { name: email.split('@')[0], email };
    this.currentUser = user;
    localStorage.setItem('foodiverse_user', JSON.stringify(user));
    this.updateUserUI();
    this.closeAuthModal();
    if (window.showToast) window.showToast(`Welcome back, ${user.name}!`);
  },

  /* Modal Signup Handler */
  handleSignup() {
    const name = document.getElementById('signupName')?.value.trim();
    const email = document.getElementById('signupEmail')?.value.trim();
    if (!name || !email) {
      if (window.showToast) window.showToast('Please fill in details');
      return;
    }
    const user = { name, email };
    this.currentUser = user;
    localStorage.setItem('foodiverse_user', JSON.stringify(user));
    this.updateUserUI();
    this.closeAuthModal();
    if (window.showToast) window.showToast(`Welcome to FoodiVerse, ${name}!`);
  },

  logout() {
    this.currentUser = null;
    localStorage.removeItem('foodiverse_user');
    this.updateUserUI();
    if (window.showToast) window.showToast('Logged out successfully');
  },

  openAuthModal(tab = 'login') {
    this.switchTab(tab);
    const modal = document.getElementById('authModalOverlay');
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  },

  closeAuthModal() {
    const modal = document.getElementById('authModalOverlay');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  },

  switchTab(tab) {
    document.querySelectorAll('.auth-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });

    const loginSection = document.getElementById('loginSection');
    const signupSection = document.getElementById('signupSection');
    if (tab === 'login') {
      if (loginSection) loginSection.style.display = 'block';
      if (signupSection) signupSection.style.display = 'none';
    } else {
      if (loginSection) loginSection.style.display = 'none';
      if (signupSection) signupSection.style.display = 'block';
    }
  },

  updateUserUI() {
    const authNavBtns = document.getElementById('authNavBtns');
    const userProfileNav = document.getElementById('userProfileNav');

    if (this.currentUser) {
      if (authNavBtns) authNavBtns.style.display = 'none';
      if (userProfileNav) {
        userProfileNav.style.display = 'flex';
        userProfileNav.innerHTML = `
          <div style="display:flex; align-items:center; gap:0.6rem;">
            <div style="width:36px; height:36px; border-radius:50%; background:var(--primary); color:var(--primary-accent); display:flex; align-items:center; justify-content:center; font-weight:800;">
              ${this.currentUser.name.charAt(0).toUpperCase()}
            </div>
            <span style="font-weight:700; font-size:0.9rem; font-family:var(--font-heading);">${this.currentUser.name}</span>
            <button onclick="Auth.logout()" class="btn btn-secondary btn-sm" style="padding:0.3rem 0.75rem; font-size:0.8rem;" title="Logout">
              <i class="fa-solid fa-right-from-bracket"></i>
            </button>
          </div>
        `;
      }
    } else {
      if (authNavBtns) authNavBtns.style.display = 'flex';
      if (userProfileNav) userProfileNav.style.display = 'none';
    }
  }
};

window.Auth = Auth;
document.addEventListener('DOMContentLoaded', () => Auth.init());
