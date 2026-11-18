/**
 * FreshCart - Role-Based Authentication & Session Engine
 * Manages customer, worker, and owner authentication, profiles, role guards,
 * and seamless bridging between Supabase Auth and offline demo sessions.
 */

const AUTH_USERS_KEY = 'freshcart_users_v2';
const AUTH_SESSION_KEY = 'freshcart_session_v2';

// Standard Pre-seeded System Accounts
const SEED_USERS = [
  {
    id: 'usr_cust_001',
    name: 'Ananya Sharma',
    email: 'customer@freshcart.com',
    phone: '9876543210',
    password: 'customer123',
    role: 'customer',
    address: 'Flat 402, Green Palm Residency, 14th Main Road, HSR Layout Sector 2, Bengaluru - 560102',
    addresses: [
      {
        id: 'addr_1',
        label: 'Home',
        recipientName: 'Ananya Sharma',
        phone: '9876543210',
        street: 'Flat 402, Green Palm Residency, 14th Main Road, HSR Layout Sector 2',
        landmark: 'Near BDA Complex',
        city: 'Bengaluru',
        postalCode: '560102',
        isDefault: true
      },
      {
        id: 'addr_2',
        label: 'Office',
        recipientName: 'Ananya Sharma',
        phone: '9876543210',
        street: 'Embassy Tech Village, Block B, Outer Ring Road, Devarabisanahalli',
        landmark: 'Opposite New Horizon College',
        city: 'Bengaluru',
        postalCode: '560103',
        isDefault: false
      }
    ],
    createdAt: '2026-01-15T09:00:00Z'
  },
  {
    id: 'usr_worker_001',
    name: 'Suresh Kumar',
    email: 'worker@freshcart.com',
    phone: '9733445566',
    password: 'worker123',
    role: 'worker',
    employeeId: 'EMP-101',
    jobTitle: 'Order Fulfillment & Delivery Specialist',
    status: 'available', // available, busy, on_break, offline
    isActive: true,
    hiredDate: '2025-06-10',
    createdAt: '2025-06-10T08:30:00Z'
  },
  {
    id: 'usr_worker_002',
    name: 'Ramesh Patel',
    email: 'ramesh.worker@freshcart.com',
    phone: '9822334455',
    password: 'worker123',
    role: 'worker',
    employeeId: 'EMP-102',
    jobTitle: 'Senior Packer & Inventory Assistant',
    status: 'available',
    isActive: true,
    hiredDate: '2025-08-20',
    createdAt: '2025-08-20T08:30:00Z'
  },
  {
    id: 'usr_owner_001',
    name: 'Rajesh Varma',
    email: 'owner@freshcart.com',
    phone: '9811223344',
    password: 'owner123',
    role: 'owner',
    title: 'Store Owner & General Manager',
    createdAt: '2024-01-01T00:00:00Z'
  }
];

const AuthEngine = {
  // Retrieve all users from storage
  getAllUsers() {
    try {
      const raw = localStorage.getItem(AUTH_USERS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('AuthEngine: Error loading users', e);
    }
    this.saveAllUsers(SEED_USERS);
    return SEED_USERS;
  },

  saveAllUsers(users) {
    try {
      localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(users));
    } catch (e) {
      console.error('AuthEngine: Error saving users', e);
    }
  },

  // Session
  getCurrentUser() {
    try {
      const raw = localStorage.getItem(AUTH_SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  },

  setSession(user) {
    try {
      if (user) {
        // Strip sensitive password before writing to session state
        const sessionData = { ...user };
        delete sessionData.password;
        localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(sessionData));
      } else {
        localStorage.removeItem(AUTH_SESSION_KEY);
      }
      this.syncHeaderUI();
    } catch (e) {
      console.error('AuthEngine: Session error', e);
    }
  },

  logout(redirectUrl = 'index.html') {
    if (typeof supabaseClient !== 'undefined' && supabaseClient && isLiveBackend) {
      try { supabaseClient.auth.signOut(); } catch (e) {}
    }
    localStorage.removeItem(AUTH_SESSION_KEY);
    if (typeof showToast === 'function') {
      showToast('Signed Out', 'You have been successfully signed out.', 'info');
    }
    setTimeout(() => {
      window.location.href = redirectUrl;
    }, 400);
  },

  // Customer Self-Registration
  async registerCustomer(name, email, phone, password, address = '') {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim().replace(/[\s-]/g, '');

    // Check if live Supabase is active
    if (isLiveBackend && supabaseClient) {
      try {
        const { data: authData, error: authErr } = await supabaseClient.auth.signUp({
          email: cleanEmail,
          password: password,
          options: {
            data: { full_name: name.trim(), phone: cleanPhone, role: 'customer' }
          }
        });
        if (authErr) throw authErr;

        if (authData?.user) {
          await supabaseClient.from('profiles').upsert({
            id: authData.user.id,
            email: cleanEmail,
            full_name: name.trim(),
            phone: cleanPhone,
            role: 'customer'
          });
        }
      } catch (err) {
        console.warn('Supabase sign-up error, proceeding with local fallback:', err.message);
      }
    }

    // Local DB Record
    const users = this.getAllUsers();
    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, message: 'An account with this email address already exists.' };
    }

    const defaultAddress = address.trim() || 'HSR Layout Sector 2, Bengaluru';
    const newUser = {
      id: 'usr_cust_' + Date.now(),
      name: name.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      password: password,
      role: 'customer',
      address: defaultAddress,
      addresses: [
        {
          id: 'addr_' + Date.now(),
          label: 'Default Address',
          recipientName: name.trim(),
          phone: cleanPhone,
          street: defaultAddress,
          city: 'Bengaluru',
          postalCode: '560102',
          isDefault: true
        }
      ],
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    this.saveAllUsers(users);
    this.setSession(newUser);
    return { success: true, user: newUser };
  },

  // Login (Role specific or general)
  async login(email, password, requiredRole = null) {
    const cleanEmail = email.trim().toLowerCase();

    // Supabase Auth check if live
    if (isLiveBackend && supabaseClient) {
      try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
          email: cleanEmail,
          password: password
        });
        if (!error && data?.user) {
          const { data: profile } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (profile) {
            if (requiredRole && profile.role !== requiredRole && profile.role !== 'owner') {
              return { success: false, message: `Access denied. This portal requires ${requiredRole} credentials.` };
            }
            const sessionUser = {
              id: profile.id,
              name: profile.full_name,
              email: profile.email,
              phone: profile.phone,
              role: profile.role
            };
            this.setSession(sessionUser);
            return { success: true, user: sessionUser };
          }
        }
      } catch (err) {
        console.warn('Supabase sign-in fallback:', err.message);
      }
    }

    // Local DB authentication
    const users = this.getAllUsers();
    const user = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      return { success: false, message: 'No registered account found with this email address.' };
    }

    if (user.password !== password) {
      return { success: false, message: 'Incorrect password. Please verify and try again.' };
    }

    if (requiredRole && user.role !== requiredRole && user.role !== 'owner') {
      return { success: false, message: `Unauthorized: Your account role is "${user.role}". Please log in through your assigned portal.` };
    }

    this.setSession(user);
    return { success: true, user: user };
  },

  // Role Access Guard for Protected Pages
  requireRole(allowedRoles, redirectUrl = 'index.html') {
    const user = this.getCurrentUser();
    if (!user) {
      if (typeof showToast === 'function') {
        showToast('Authentication Required', 'Please sign in to access this page.', 'warning');
      }
      setTimeout(() => {
        if (allowedRoles.includes('owner')) window.location.href = 'owner-login.html';
        else if (allowedRoles.includes('worker')) window.location.href = 'worker-login.html';
        else window.location.href = 'customer-login.html';
      }, 500);
      return false;
    }

    if (!allowedRoles.includes(user.role)) {
      alert(`Access Restricted: This section is reserved for ${allowedRoles.join(' or ')} access only.`);
      if (user.role === 'owner') window.location.href = 'owner-dashboard.html';
      else if (user.role === 'worker') window.location.href = 'worker-dashboard.html';
      else window.location.href = 'customer-dashboard.html';
      return false;
    }

    return true;
  },

  // Employee Provisioning (Owner feature only)
  createEmployeeAccount(name, email, phone, password, employeeCode, jobTitle) {
    const current = this.getCurrentUser();
    if (!current || current.role !== 'owner') {
      return { success: false, message: 'Only store owners are authorized to provision worker accounts.' };
    }

    const users = this.getAllUsers();
    const cleanEmail = email.trim().toLowerCase();
    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, message: 'An employee with this email already exists.' };
    }

    const newWorker = {
      id: 'usr_worker_' + Date.now(),
      name: name.trim(),
      email: cleanEmail,
      phone: phone.trim(),
      password: password,
      role: 'worker',
      employeeId: employeeCode.trim().toUpperCase(),
      jobTitle: jobTitle.trim(),
      status: 'offline',
      isActive: true,
      hiredDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };

    users.push(newWorker);
    this.saveAllUsers(users);
    return { success: true, employee: newWorker };
  },

  // Toggle Employee Active Status
  toggleEmployeeActive(employeeId) {
    const current = this.getCurrentUser();
    if (!current || current.role !== 'owner') return false;

    const users = this.getAllUsers();
    const idx = users.findIndex(u => u.id === employeeId || u.employeeId === employeeId);
    if (idx !== -1) {
      users[idx].isActive = !users[idx].isActive;
      this.saveAllUsers(users);
      return users[idx].isActive;
    }
    return false;
  },

  // Update Worker Availability Status (Available / Busy / On Break / Offline)
  setWorkerStatus(status) {
    const user = this.getCurrentUser();
    if (!user || user.role !== 'worker') return false;

    user.status = status;
    this.setSession(user);

    const users = this.getAllUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx !== -1) {
      users[idx].status = status;
      this.saveAllUsers(users);
    }
    return true;
  },

  // Update Customer Profile
  updateProfile(updates) {
    const user = this.getCurrentUser();
    if (!user) return false;

    const updated = { ...user, ...updates };
    this.setSession(updated);

    const users = this.getAllUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...updates };
      this.saveAllUsers(users);
    }
    return true;
  },

  // Add / Update Customer Saved Address
  saveCustomerAddress(addressObj) {
    const user = this.getCurrentUser();
    if (!user) return false;

    if (!Array.isArray(user.addresses)) {
      user.addresses = [];
    }

    if (addressObj.isDefault) {
      user.addresses.forEach(a => a.isDefault = false);
    }

    if (addressObj.id) {
      const idx = user.addresses.findIndex(a => a.id === addressObj.id);
      if (idx !== -1) user.addresses[idx] = addressObj;
      else user.addresses.push(addressObj);
    } else {
      addressObj.id = 'addr_' + Date.now();
      if (user.addresses.length === 0) addressObj.isDefault = true;
      user.addresses.push(addressObj);
    }

    this.updateProfile({ addresses: user.addresses });
    return true;
  },

  // Synchronize header navigation user badge
  syncHeaderUI() {
    const user = this.getCurrentUser();
    const headerActions = document.querySelector('.header-actions');
    if (!headerActions) return;

    let userContainer = document.getElementById('header-user-wrapper');
    if (!userContainer) {
      userContainer = document.createElement('div');
      userContainer.id = 'header-user-wrapper';
      userContainer.className = 'user-menu-wrap';
      const cartBtn = headerActions.querySelector('a[href="cart.html"]');
      if (cartBtn) headerActions.insertBefore(userContainer, cartBtn);
      else headerActions.prepend(userContainer);
    }

    // Clear legacy static account link
    const oldLoginBtn = headerActions.querySelector('a[href*="login"].action-btn');
    if (oldLoginBtn) oldLoginBtn.remove();

    if (user) {
      let roleBadgeClass = 'role-customer';
      let roleIcon = 'fa-user';
      let roleText = 'Customer';
      let dashboardUrl = 'customer-dashboard.html';

      if (user.role === 'owner') {
        roleBadgeClass = 'role-owner';
        roleIcon = 'fa-crown';
        roleText = 'Owner';
        dashboardUrl = 'owner-dashboard.html';
      } else if (user.role === 'worker') {
        roleBadgeClass = 'role-worker';
        roleIcon = 'fa-clipboard-check';
        roleText = 'Worker';
        dashboardUrl = 'worker-dashboard.html';
      }

      const firstName = user.name ? user.name.split(' ')[0] : 'User';

      userContainer.innerHTML = `
        <button type="button" class="user-nav-btn" id="user-menu-trigger">
          <i class="fas ${roleIcon}" style="color: var(--primary);"></i>
          <span style="font-weight:600;">${firstName}</span>
          <span class="role-badge ${roleBadgeClass}">${roleText}</span>
          <i class="fas fa-chevron-down" style="font-size: 0.7rem; color: var(--text-muted);"></i>
        </button>

        <div class="user-dropdown-menu" id="user-dropdown-menu">
          <div class="user-dropdown-header">
            <strong>${user.name}</strong>
            <small style="display:block; color:var(--text-muted); font-size:0.75rem;">${user.email}</small>
          </div>
          <a href="${dashboardUrl}" class="dropdown-item"><i class="fas fa-gauge-high"></i> Dashboard</a>
          ${user.role === 'customer' ? '<a href="my-orders.html" class="dropdown-item"><i class="fas fa-bag-shopping"></i> My Orders</a>' : ''}
          ${user.role === 'customer' ? '<a href="wishlist.html" class="dropdown-item"><i class="fas fa-heart"></i> My Wishlist</a>' : ''}
          ${user.role === 'customer' ? '<a href="profile.html" class="dropdown-item"><i class="fas fa-id-card"></i> Profile & Addresses</a>' : ''}
          ${user.role === 'worker' ? '<a href="packing-tasks.html" class="dropdown-item"><i class="fas fa-box-open"></i> Packing Tasks</a>' : ''}
          ${user.role === 'worker' ? '<a href="delivery-tasks.html" class="dropdown-item"><i class="fas fa-truck-ramp-box"></i> Delivery Tasks</a>' : ''}
          ${user.role === 'owner' ? '<a href="manage-orders.html" class="dropdown-item"><i class="fas fa-clipboard-list"></i> Orders & Dispatch</a>' : ''}
          ${user.role === 'owner' ? '<a href="reports.html" class="dropdown-item"><i class="fas fa-chart-line"></i> Sales & Profit</a>' : ''}
          <div class="dropdown-divider"></div>
          <button type="button" class="dropdown-item text-danger" onclick="AuthEngine.logout()"><i class="fas fa-arrow-right-from-bracket"></i> Sign Out</button>
        </div>
      `;

      const trigger = document.getElementById('user-menu-trigger');
      const menu = document.getElementById('user-dropdown-menu');
      if (trigger && menu) {
        trigger.onclick = (e) => {
          e.stopPropagation();
          menu.classList.toggle('show');
        };
        document.addEventListener('click', (e) => {
          if (!userContainer.contains(e.target)) menu.classList.remove('show');
        });
      }
    } else {
      userContainer.innerHTML = `
        <a href="customer-login.html" class="action-btn" title="Sign In / Register">
          <i class="far fa-user"></i>
        </a>
      `;
    }
  }
};

// Expose globally for vanilla scripts
window.AuthEngine = AuthEngine;
window.getCurrentUser = () => AuthEngine.getCurrentUser();
window.logoutUser = () => AuthEngine.logout();
window.checkRoleAccessGuard = (roles) => AuthEngine.requireRole(roles);
