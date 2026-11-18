/**
 * FreshCart - Configuration & Supabase Dual-Mode Backend Adapter
 * Provides transparent switching between live Supabase cloud backend and
 * high-fidelity offline demonstration database engine with full relational capabilities.
 */

const FRESH_CONFIG = {
  appName: 'FreshCart',
  currency: '₹',
  taxRateCGST: 0.025, // 2.5% CGST
  taxRateSGST: 0.025, // 2.5% SGST
  freeDeliveryThreshold: 500,
  standardDeliveryFee: 40,
  urgentPrepMinutes: 30,
  defaultPrepMinutes: 45,
  
  // Supabase Configuration
  // Users can set their Supabase credentials here or through the backend settings modal
  SUPABASE_URL: window.__FRESH_SUPABASE_URL || localStorage.getItem('freshcart_supabase_url') || '',
  SUPABASE_ANON_KEY: window.__FRESH_SUPABASE_ANON_KEY || localStorage.getItem('freshcart_supabase_anon_key') || '',
};

// Check if Supabase client library is available and configured
let supabaseClient = null;
let isLiveBackend = false;

function initSupabase() {
  if (typeof supabase !== 'undefined' && FRESH_CONFIG.SUPABASE_URL && FRESH_CONFIG.SUPABASE_ANON_KEY) {
    try {
      supabaseClient = supabase.createClient(FRESH_CONFIG.SUPABASE_URL, FRESH_CONFIG.SUPABASE_ANON_KEY);
      isLiveBackend = true;
      console.log('FreshCart: Connected to live Supabase backend');
    } catch (e) {
      console.warn('FreshCart: Supabase initialization failed, falling back to local demo DB', e);
      isLiveBackend = false;
    }
  } else {
    isLiveBackend = false;
  }
}

// Global notification / banner for backend mode
function renderBackendModeBanner() {
  const existing = document.getElementById('backend-mode-banner');
  if (existing) return;

  const banner = document.createElement('div');
  banner.id = 'backend-mode-banner';
  banner.className = 'backend-mode-banner';
  
  if (isLiveBackend) {
    banner.innerHTML = `
      <div class="banner-inner container">
        <span><i class="fas fa-cloud" style="color: #4CAF50;"></i> Connected to <strong>Supabase Cloud Database</strong></span>
        <button class="banner-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
      </div>
    `;
    banner.classList.add('live-mode');
  } else {
    banner.innerHTML = `
      <div class="banner-inner container">
        <span><i class="fas fa-database" style="color: #A5D66A;"></i> <strong>Demo Mode:</strong> Full interactive grocery management with persistent local storage. <a href="javascript:void(0)" onclick="openBackendConfigModal()">Configure Supabase</a></span>
        <button class="banner-close" onclick="this.parentElement.parentElement.remove()" title="Dismiss">&times;</button>
      </div>
    `;
    banner.classList.add('demo-mode');
  }

  // Inject at top of body after DOM is loaded
  if (document.body) {
    document.body.prepend(banner);
  } else {
    window.addEventListener('DOMContentLoaded', () => document.body.prepend(banner));
  }
}

// Backend Configuration Modal for user to connect Supabase anytime
function openBackendConfigModal() {
  let modal = document.getElementById('backend-config-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'backend-config-modal';
    modal.className = 'fresh-modal-backdrop';
    modal.innerHTML = `
      <div class="fresh-modal-dialog">
        <div class="fresh-modal-header">
          <h3><i class="fas fa-server"></i> Supabase Backend Connection</h3>
          <button class="modal-close-btn" onclick="closeBackendConfigModal()">&times;</button>
        </div>
        <div class="fresh-modal-body">
          <p style="margin-bottom: 12px; color: var(--text-muted); font-size: 0.9rem;">
            FreshCart seamlessly works in <strong>Demo Mode</strong> without any external keys. To synchronize across multiple devices or production servers, enter your Supabase Project URL and Public Anon Key below:
          </p>
          <div class="form-group" style="margin-bottom: 12px;">
            <label style="display:block; font-weight:600; margin-bottom:4px;">Supabase Project URL</label>
            <input type="url" id="cfg-supabase-url" class="form-control" placeholder="https://xyz.supabase.co" value="${FRESH_CONFIG.SUPABASE_URL || ''}" style="width:100%; padding:8px 12px; border:1px solid #ccc; border-radius:6px;">
          </div>
          <div class="form-group" style="margin-bottom: 16px;">
            <label style="display:block; font-weight:600; margin-bottom:4px;">Supabase Anon / Public Key</label>
            <input type="text" id="cfg-supabase-key" class="form-control" placeholder="eyJhbGciOi..." value="${FRESH_CONFIG.SUPABASE_ANON_KEY || ''}" style="width:100%; padding:8px 12px; border:1px solid #ccc; border-radius:6px;">
          </div>
          <div style="background:#eef7ee; padding:10px 14px; border-radius:6px; font-size:0.85rem; color:#1B5E35; margin-bottom:16px;">
            <i class="fas fa-circle-info"></i> Migration SQL file is available in <code>supabase/migrations/001_freshcart_schema.sql</code>. Run it in your Supabase SQL editor to set up all tables and security policies.
          </div>
          <div style="display:flex; justify-content:flex-end; gap:10px;">
            <button class="btn btn-outline" onclick="resetBackendDemoMode()">Use Local Demo Mode</button>
            <button class="btn btn-primary" onclick="saveBackendConfig()">Save & Connect</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }
  modal.style.display = 'flex';
}

function closeBackendConfigModal() {
  const modal = document.getElementById('backend-config-modal');
  if (modal) modal.style.display = 'none';
}

function saveBackendConfig() {
  const url = document.getElementById('cfg-supabase-url')?.value.trim();
  const key = document.getElementById('cfg-supabase-key')?.value.trim();
  if (url && key) {
    localStorage.setItem('freshcart_supabase_url', url);
    localStorage.setItem('freshcart_supabase_anon_key', key);
    alert('Supabase credentials saved! Reloading application...');
    window.location.reload();
  } else {
    alert('Please enter both Supabase URL and Anon Key, or choose "Use Local Demo Mode".');
  }
}

function resetBackendDemoMode() {
  localStorage.removeItem('freshcart_supabase_url');
  localStorage.removeItem('freshcart_supabase_anon_key');
  alert('Switched back to Local Demo Database mode. Reloading...');
  window.location.reload();
}

// Initialise upon script load
initSupabase();
window.addEventListener('DOMContentLoaded', renderBackendModeBanner);
