/**
 * FreshCart - Main Frontend Application & Authentication Engine
 * Handles Navigation, Mobile Drawer, Session Management, Real-Time Form Validation,
 * Role-Based Access Control, Toast Notifications, and Dynamic Header State.
 */

const USERS_STORAGE_KEY = 'freshcart_users';
const SESSION_STORAGE_KEY = 'freshcart_session';

// Pre-seeded Demo Accounts
const DEFAULT_USERS = [
  {
    id: 'usr_cust_1',
    name: 'Ananya Sharma',
    email: 'customer@freshcart.com',
    phone: '9876543210',
    password: 'customer123',
    role: 'customer',
    address: 'Flat 402, Green Palm Residency, 14th Main Road, HSR Layout Sector 2, Bengaluru, Karnataka - 560102'
  },
  {
    id: 'usr_owner_1',
    name: 'Rajesh Varma',
    email: 'owner@freshcart.com',
    phone: '9811223344',
    password: 'owner123',
    role: 'owner',
    title: 'Store Owner & General Manager'
  },
  {
    id: 'usr_worker_1',
    name: 'Suresh Kumar',
    email: 'worker@freshcart.com',
    phone: '9733445566',
    password: 'worker123',
    role: 'worker',
    title: 'Order Packing & Kitchen Fulfilment Staff'
  }
];

// --- User Storage & Session Engine ---
function getUsersFromStorage() {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error reading users from localStorage', e);
  }
  saveUsersToStorage(DEFAULT_USERS);
  return DEFAULT_USERS;
}

function saveUsersToStorage(users) {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Error saving users to localStorage', e);
  }
}

function getCurrentUser() {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function setCurrentUser(user) {
  try {
    if (user) {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
    updateHeaderUserState();
  } catch (e) {
    console.error('Error setting session', e);
  }
}

function logoutUser() {
  const user = getCurrentUser();
  localStorage.removeItem(SESSION_STORAGE_KEY);
  if (typeof showToast === 'function') {
    showToast('Signed Out', 'You have been successfully signed out.', 'info');
  }
  setTimeout(() => {
    window.location.href = 'login.html';
  }, 400);
}

// Register new customer
function registerCustomerAccount(name, email, phone, password, address = '') {
  const users = getUsersFromStorage();
  const existing = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  if (existing) {
    return { success: false, message: 'An account with this email address already exists.' };
  }

  const newUser = {
    id: 'usr_cust_' + Date.now(),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone.trim(),
    password: password,
    role: 'customer',
    address: address.trim() || 'HSR Layout, Bengaluru'
  };

  users.push(newUser);
  saveUsersToStorage(users);
  setCurrentUser(newUser);
  return { success: true, user: newUser };
}

// Authenticate user
function authenticateUser(email, password) {
  const users = getUsersFromStorage();
  const cleanEmail = email.trim().toLowerCase();
  const user = users.find(u => u.email.toLowerCase() === cleanEmail);

  if (!user) {
    return { success: false, message: 'No registered account found with this email.' };
  }
  if (user.password !== password) {
    return { success: false, message: 'Incorrect password. Please try again.' };
  }

  setCurrentUser(user);
  return { success: true, user: user };
}

// Update profile details
function updateCurrentProfile(updatedFields) {
  const current = getCurrentUser();
  if (!current) return false;

  const users = getUsersFromStorage();
  const idx = users.findIndex(u => u.id === current.id);
  if (idx !== -1) {
    users[idx] = { ...users[idx], ...updatedFields };
    saveUsersToStorage(users);
    setCurrentUser(users[idx]);
    return true;
  }
  return false;
}

// --- Role-Based Access Control Guard ---
function checkRoleAccessGuard(allowedRoles) {
  const user = getCurrentUser();
  if (!user) {
    if (typeof showToast === 'function') {
      showToast('Authentication Required', 'Please sign in to access this portal.', 'warning');
    }
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 600);
    return false;
  }

  if (!allowedRoles.includes(user.role)) {
    alert(`Access Denied: Your account role (${user.role}) does not have permission to view this page.`);
    window.location.href = user.role === 'owner' ? 'owner-dashboard.html' : (user.role === 'worker' ? 'worker-dashboard.html' : 'index.html');
    return false;
  }

  return true;
}

// --- Sticky Header on Scroll ---
window.addEventListener('scroll', () => {
  const header = document.querySelector('.main-header');
  if (header) {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
      header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
    } else {
      header.classList.remove('scrolled');
      header.style.boxShadow = 'var(--shadow-sm)';
    }
  }
});

// --- Dynamic Header User Menu State ---
function updateHeaderUserState() {
  const user = getCurrentUser();
  const headerActions = document.querySelector('.header-actions');
  const drawerNav = document.querySelector('.drawer-nav');

  if (!headerActions) return;

  // Find or create user container
  let userContainer = document.getElementById('header-user-wrapper');
  if (!userContainer) {
    userContainer = document.createElement('div');
    userContainer.id = 'header-user-wrapper';
    userContainer.className = 'user-menu-wrap';
    // Insert before cart button or at start
    const cartBtn = headerActions.querySelector('a[href="cart.html"]');
    if (cartBtn) {
      headerActions.insertBefore(userContainer, cartBtn);
    } else {
      headerActions.prepend(userContainer);
    }
  }

  // Remove existing static account button if present
  const oldAccountBtn = headerActions.querySelector('a[href="login.html"].action-btn');
  if (oldAccountBtn) oldAccountBtn.remove();

  if (user) {
    let roleBadgeClass = 'role-customer';
    let roleIcon = 'fa-user';
    let roleText = 'Customer';
    let dashboardLink = 'profile.html';
    let dashboardLabel = 'My Profile & Orders';

    if (user.role === 'owner') {
      roleBadgeClass = 'role-owner';
      roleIcon = 'fa-crown';
      roleText = 'Owner';
      dashboardLink = 'owner-dashboard.html';
      dashboardLabel = 'Owner Dashboard';
    } else if (user.role === 'worker') {
      roleBadgeClass = 'role-worker';
      roleIcon = 'fa-clipboard-check';
      roleText = 'Worker';
      dashboardLink = 'worker-dashboard.html';
      dashboardLabel = 'Worker Dashboard';
    }

    const firstName = user.name ? user.name.split(' ')[0] : 'User';

    userContainer.innerHTML = `
      <button type="button" class="user-nav-btn" id="user-menu-trigger" aria-haspopup="true">
        <i class="fas ${roleIcon}" style="color: var(--primary);"></i>
        <span>${firstName}</span>
        <span class="role-badge ${roleBadgeClass}">${roleText}</span>
        <i class="fas fa-chevron-down" style="font-size: 0.7rem; color: var(--text-muted);"></i>
      </button>

      <div class="user-dropdown-menu" id="user-dropdown-menu">
        <div class="user-dropdown-header">
          <strong>${user.name}</strong>
          <span>${user.email}</span>
        </div>
        ${user.role === 'customer' ? `
          <a href="profile.html" class="user-dropdown-item"><i class="fas fa-user-circle"></i> My Profile</a>
          <a href="profile.html#orders" class="user-dropdown-item"><i class="fas fa-receipt"></i> Order History</a>
        ` : ''}
        ${user.role === 'owner' ? `
          <a href="owner-dashboard.html" class="user-dropdown-item"><i class="fas fa-chart-line"></i> Owner Dashboard</a>
          <a href="worker-dashboard.html" class="user-dropdown-item"><i class="fas fa-clipboard-check"></i> Worker Portal</a>
          <a href="products.html" class="user-dropdown-item"><i class="fas fa-boxes-stacked"></i> Manage Catalog</a>
        ` : ''}
        ${user.role === 'worker' ? `
          <a href="worker-dashboard.html" class="user-dropdown-item"><i class="fas fa-box-open"></i> Order Packing Tasks</a>
        ` : ''}
        <a href="cart.html" class="user-dropdown-item"><i class="fas fa-basket-shopping"></i> View Cart</a>
        <a href="#" class="user-dropdown-item danger-item" onclick="logoutUser(); return false;"><i class="fas fa-arrow-right-from-bracket"></i> Sign Out</a>
      </div>
    `;

    // Dropdown toggle handler
    const trigger = document.getElementById('user-menu-trigger');
    const menu = document.getElementById('user-dropdown-menu');
    if (trigger && menu) {
      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.classList.toggle('active');
      });
      document.addEventListener('click', () => {
        menu.classList.remove('active');
      });
    }

    // Update Mobile Drawer Account Link
    if (drawerNav) {
      const drawerAuthLink = drawerNav.querySelector('a[href="login.html"]');
      if (drawerAuthLink) {
        drawerAuthLink.setAttribute('href', dashboardLink);
        drawerAuthLink.innerHTML = `<i class="fas ${roleIcon}" style="margin-right: 10px; color: var(--primary);"></i> ${dashboardLabel} (${roleText})`;
      }
    }
  } else {
    userContainer.innerHTML = `
      <a href="login.html" class="user-nav-btn" title="Sign In">
        <i class="far fa-user"></i>
        <span>Sign In</span>
      </a>
    `;

    if (drawerNav) {
      const drawerAuthLink = drawerNav.querySelector('a[href="profile.html"], a[href="owner-dashboard.html"], a[href="worker-dashboard.html"]');
      if (drawerAuthLink) {
        drawerAuthLink.setAttribute('href', 'login.html');
        drawerAuthLink.innerHTML = `<i class="fas fa-user-circle" style="margin-right: 10px; color: var(--primary);"></i> Sign In / Register`;
      }
    }
  }
}

// --- Mobile Navigation Drawer ---
function initMobileDrawer() {
  const toggleBtn = document.querySelector('.mobile-toggle');
  const drawer = document.querySelector('.mobile-drawer');
  const overlay = document.querySelector('.drawer-overlay');
  const closeBtn = document.querySelector('.drawer-close');

  if (!toggleBtn || !drawer || !overlay) return;

  function openDrawer() {
    drawer.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    drawer.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  toggleBtn.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  overlay.addEventListener('click', closeDrawer);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('active')) {
      closeDrawer();
    }
  });
}

// --- Header Search Bar Handler ---
function initHeaderSearch() {
  const searchForms = document.querySelectorAll('.header-search form, .drawer-search form');
  searchForms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input[type="text"], input[type="search"]');
      if (input && input.value.trim()) {
        const query = encodeURIComponent(input.value.trim());
        window.location.href = `products.html?search=${query}`;
      }
    });
  });
}

// --- Active Nav Link Highlighting ---
function highlightActiveNav() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-link, .drawer-nav a');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

// --- Toast Notification System ---
function showToast(title, message, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  let iconHtml = '<i class="fas fa-check-circle toast-icon"></i>';
  if (type === 'error') {
    iconHtml = '<i class="fas fa-exclamation-circle toast-icon"></i>';
  } else if (type === 'info') {
    iconHtml = '<i class="fas fa-info-circle toast-icon"></i>';
  } else if (type === 'warning') {
    iconHtml = '<i class="fas fa-triangle-exclamation toast-icon" style="color: #FF9800;"></i>';
  }

  toast.innerHTML = `
    <div class="toast-content">
      ${iconHtml}
      <div>
        <div style="font-weight: 700; font-size: 0.95rem;">${title}</div>
        <div style="font-size: 0.8rem; font-weight: 400; color: var(--text-muted);">${message}</div>
      </div>
    </div>
    <button style="color: var(--text-muted); font-size: 0.9rem;" onclick="this.parentElement.remove()">
      <i class="fas fa-times"></i>
    </button>
  `;

  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      toast.remove();
    }, 400);
  }, 3500);
}

// --- Professional Real-Time Form Validation Engine ---
function setFieldValidation(input, isValid, errorMessage = '') {
  if (!input) return;
  const parent = input.closest('.form-group');
  if (!parent) return;

  let errorEl = parent.querySelector('.field-error');
  if (!errorEl) {
    errorEl = document.createElement('div');
    errorEl.className = 'field-error';
    parent.appendChild(errorEl);
  }

  if (isValid) {
    parent.classList.remove('has-error');
    parent.classList.add('is-valid');
    errorEl.textContent = '';
    errorEl.style.display = 'none';
  } else {
    parent.classList.remove('is-valid');
    parent.classList.add('has-error');
    errorEl.textContent = errorMessage;
    errorEl.style.display = 'flex';
  }
}

function clearFieldValidation(input) {
  if (!input) return;
  const parent = input.closest('.form-group');
  if (!parent) return;
  parent.classList.remove('has-error', 'is-valid');
  const errorEl = parent.querySelector('.field-error');
  if (errorEl) {
    errorEl.textContent = '';
    errorEl.style.display = 'none';
  }
}

// --- Authentication Forms Engine (Login & Register) ---
function initAuthForms() {
  // Password Visibility Toggle
  const togglePassBtns = document.querySelectorAll('.toggle-password');
  togglePassBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.previousElementSibling;
      if (input && input.type === 'password') {
        input.type = 'text';
        btn.classList.remove('fa-eye');
        btn.classList.add('fa-eye-slash');
      } else if (input) {
        input.type = 'password';
        btn.classList.remove('fa-eye-slash');
        btn.classList.add('fa-eye');
      }
    });
  });

  // Login Form
  const loginForm = document.getElementById('login-form');
  const loginEmail = document.getElementById('login-email');
  const loginPass = document.getElementById('login-password');

  if (loginEmail) {
    loginEmail.addEventListener('input', () => {
      const val = loginEmail.value.trim();
      const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      setFieldValidation(loginEmail, isValid, 'Please enter a valid email address.');
    });
  }

  if (loginPass) {
    loginPass.addEventListener('input', () => {
      const val = loginPass.value.trim();
      setFieldValidation(loginPass, val.length >= 6, 'Password must be at least 6 characters.');
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailVal = loginEmail ? loginEmail.value.trim() : '';
      const passVal = loginPass ? loginPass.value.trim() : '';

      const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal);
      const isPassValid = passVal.length >= 6;

      setFieldValidation(loginEmail, isEmailValid, 'Please enter a valid email address.');
      setFieldValidation(loginPass, isPassValid, 'Password must be at least 6 characters.');

      if (!isEmailValid || !isPassValid) {
        showToast('Validation Error', 'Please correct the highlighted fields.', 'error');
        return;
      }

      const res = authenticateUser(emailVal, passVal);
      if (res.success) {
        showToast('Login Successful', `Welcome back, ${res.user.name}!`, 'success');
        setTimeout(() => {
          if (res.user.role === 'owner') {
            window.location.href = 'owner-dashboard.html';
          } else if (res.user.role === 'worker') {
            window.location.href = 'worker-dashboard.html';
          } else {
            window.location.href = 'profile.html';
          }
        }, 800);
      } else {
        showToast('Login Failed', res.message, 'error');
      }
    });
  }

  // Register Form
  const regForm = document.getElementById('register-form');
  const regName = document.getElementById('reg-name');
  const regEmail = document.getElementById('reg-email');
  const regPhone = document.getElementById('reg-phone');
  const regPass = document.getElementById('reg-password');
  const regConfirmPass = document.getElementById('reg-confirm-password');
  const regAddress = document.getElementById('reg-address');
  const strengthBar = document.getElementById('password-strength-bar');
  const strengthText = document.getElementById('password-strength-text');

  if (regName) {
    regName.addEventListener('input', () => {
      setFieldValidation(regName, regName.value.trim().length >= 3, 'Full name must be at least 3 characters.');
    });
  }

  if (regEmail) {
    regEmail.addEventListener('input', () => {
      const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail.value.trim());
      setFieldValidation(regEmail, isValid, 'Please provide a valid email format.');
    });
  }

  if (regPhone) {
    regPhone.addEventListener('input', () => {
      const isValid = /^[6-9]\d{9}$/.test(regPhone.value.trim());
      setFieldValidation(regPhone, isValid, 'Enter a valid 10-digit mobile number (e.g. 9876543210).');
    });
  }

  if (regPass) {
    regPass.addEventListener('input', () => {
      const val = regPass.value;
      let score = 0;
      if (val.length >= 6) score++;
      if (val.length >= 10) score++;
      if (/[A-Z]/.test(val)) score++;
      if (/[0-9]/.test(val)) score++;
      if (/[^A-Za-z0-9]/.test(val)) score++;

      if (strengthBar && strengthText) {
        if (val.length === 0) {
          strengthBar.style.width = '0%';
          strengthText.textContent = '';
        } else if (score <= 2) {
          strengthBar.style.width = '33%';
          strengthBar.style.background = '#E53935';
          strengthText.textContent = 'Weak password';
          strengthText.style.color = '#E53935';
        } else if (score <= 4) {
          strengthBar.style.width = '66%';
          strengthBar.style.background = '#FFA000';
          strengthText.textContent = 'Medium strength';
          strengthText.style.color = '#FFA000';
        } else {
          strengthBar.style.width = '100%';
          strengthBar.style.background = '#2E7D32';
          strengthText.textContent = 'Strong password';
          strengthText.style.color = '#2E7D32';
        }
      }

      setFieldValidation(regPass, val.length >= 6, 'Password must be at least 6 characters.');

      if (regConfirmPass && regConfirmPass.value) {
        setFieldValidation(regConfirmPass, regConfirmPass.value === val, 'Passwords do not match.');
      }
    });
  }

  if (regConfirmPass) {
    regConfirmPass.addEventListener('input', () => {
      const matches = regConfirmPass.value === (regPass ? regPass.value : '');
      setFieldValidation(regConfirmPass, matches, 'Passwords do not match.');
    });
  }

  if (regForm) {
    regForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameVal = regName.value.trim();
      const emailVal = regEmail.value.trim();
      const phoneVal = regPhone.value.trim();
      const passVal = regPass.value;
      const confirmVal = regConfirmPass.value;
      const addressVal = regAddress ? regAddress.value.trim() : '';

      const isNameValid = nameVal.length >= 3;
      const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal);
      const isPhoneValid = /^[6-9]\d{9}$/.test(phoneVal);
      const isPassValid = passVal.length >= 6;
      const isConfirmValid = passVal === confirmVal;

      setFieldValidation(regName, isNameValid, 'Full name must be at least 3 characters.');
      setFieldValidation(regEmail, isEmailValid, 'Please provide a valid email format.');
      setFieldValidation(regPhone, isPhoneValid, 'Enter a valid 10-digit mobile number.');
      setFieldValidation(regPass, isPassValid, 'Password must be at least 6 characters.');
      setFieldValidation(regConfirmPass, isConfirmValid, 'Passwords do not match.');

      if (!isNameValid || !isEmailValid || !isPhoneValid || !isPassValid || !isConfirmValid) {
        showToast('Validation Error', 'Please complete all required fields correctly.', 'error');
        return;
      }

      const res = registerCustomerAccount(nameVal, emailVal, phoneVal, passVal, addressVal);
      if (res.success) {
        showToast('Account Created!', `Welcome to FreshCart, ${res.user.name}!`, 'success');
        setTimeout(() => {
          window.location.href = 'profile.html';
        }, 800);
      } else {
        showToast('Registration Error', res.message, 'error');
      }
    });
  }
}

// Quick 1-Click Role Fill on Login Page (for Academic Testing)
window.fillDemoAccount = function(role) {
  const emailInput = document.getElementById('login-email');
  const passInput = document.getElementById('login-password');
  if (!emailInput || !passInput) return;

  if (role === 'customer') {
    emailInput.value = 'customer@freshcart.com';
    passInput.value = 'customer123';
  } else if (role === 'owner') {
    emailInput.value = 'owner@freshcart.com';
    passInput.value = 'owner123';
  } else if (role === 'worker') {
    emailInput.value = 'worker@freshcart.com';
    passInput.value = 'worker123';
  }

  clearFieldValidation(emailInput);
  clearFieldValidation(passInput);
  showToast('Demo Credentials Filled', `Selected role: ${role.toUpperCase()}`, 'info');
};

// --- Newsletter Subscription Form ---
function initNewsletter() {
  const forms = document.querySelectorAll('.newsletter-form');
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      if (!input) return;

      const email = input.value.trim();
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailPattern.test(email)) {
        showToast('Invalid Email', 'Please enter a valid email address.', 'error');
        return;
      }

      showToast('Subscribed Successfully!', 'Thank you! Use coupon FRESH50 on your next order.', 'success');
      input.value = '';
    });
  });
}

// --- Today's Deal Countdown Timer ---
function initDealCountdown() {
  const hoursEl = document.getElementById('deal-hours');
  const minsEl = document.getElementById('deal-mins');
  const secsEl = document.getElementById('deal-secs');

  if (!hoursEl || !minsEl || !secsEl) return;

  function updateTimer() {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(23, 59, 59, 999);

    const diff = midnight - now;
    if (diff <= 0) {
      hoursEl.textContent = '00';
      minsEl.textContent = '00';
      secsEl.textContent = '00';
      return;
    }

    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    hoursEl.textContent = String(hours).padStart(2, '0');
    minsEl.textContent = String(minutes).padStart(2, '0');
    secsEl.textContent = String(seconds).padStart(2, '0');
  }

  updateTimer();
  setInterval(updateTimer, 1000);
}

// --- Contact Page Form Validation & Handling ---
function initContactForm() {
  const contactForm = document.getElementById('contact-form');
  if (!contactForm) return;

  const name = document.getElementById('contact-name');
  const email = document.getElementById('contact-email');
  const subject = document.getElementById('contact-subject');
  const message = document.getElementById('contact-message');

  if (name) name.addEventListener('input', () => setFieldValidation(name, name.value.trim().length >= 3, 'Name must be at least 3 characters.'));
  if (email) email.addEventListener('input', () => setFieldValidation(email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()), 'Enter a valid email address.'));
  if (subject) subject.addEventListener('change', () => setFieldValidation(subject, subject.value !== '', 'Please select a subject category.'));
  if (message) message.addEventListener('input', () => setFieldValidation(message, message.value.trim().length >= 10, 'Message must be at least 10 characters.'));

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const isNameValid = name.value.trim().length >= 3;
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
    const isSubjectValid = subject.value !== '';
    const isMsgValid = message.value.trim().length >= 10;

    setFieldValidation(name, isNameValid, 'Name must be at least 3 characters.');
    setFieldValidation(email, isEmailValid, 'Enter a valid email address.');
    setFieldValidation(subject, isSubjectValid, 'Please select a subject category.');
    setFieldValidation(message, isMsgValid, 'Message must be at least 10 characters.');

    if (!isNameValid || !isEmailValid || !isSubjectValid || !isMsgValid) {
      showToast('Validation Error', 'Please complete all required fields.', 'error');
      return;
    }

    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const origHtml = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Sending Message...`;

    setTimeout(() => {
      showToast('Message Sent!', 'Our customer care team will respond within 2 hours.', 'success');
      contactForm.reset();
      clearFieldValidation(name);
      clearFieldValidation(email);
      clearFieldValidation(subject);
      clearFieldValidation(message);
      submitBtn.disabled = false;
      submitBtn.innerHTML = origHtml;
    }, 1000);
  });
}

// --- FAQ Accordion (contact.html) ---
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (question) {
      question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        faqItems.forEach(i => i.classList.remove('active'));
        if (!isActive) {
          item.classList.add('active');
        }
      });
    }
  });
}

// --- DOM Ready Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  getUsersFromStorage();
  updateHeaderUserState();
  initMobileDrawer();
  initHeaderSearch();
  highlightActiveNav();
  initNewsletter();
  initDealCountdown();
  initContactForm();
  initFaqAccordion();
  initAuthForms();
});
