/**
 * MediKiosk API Studio & Test Client
 * Interacts with Spring Boot Controllers
 */

let activeToken = null;
let currentEndpointKey = 'register';

const endpoints = {
  // --- Auth & User Controller ---
  'register': {
    title: 'Register New User',
    method: 'POST',
    url: '/api/register',
    requiresAuth: false,
    note: 'Creates a new user in the system. Passwords are BCrypt hashed before storage.',
    inputs: [
      { id: 'username', label: 'USERNAME', type: 'text', placeholder: 'test_patient' },
      { id: 'password', label: 'PASSWORD', type: 'password', placeholder: 'Pass@1234' }
    ],
    sampleData: {
      username: 'patient_' + Math.floor(100 + Math.random() * 900),
      password: 'Password@123'
    },
    action: async () => {
      const username = getInputValue('username');
      const password = getInputValue('password');
      if (!username || !password) return alert('Please enter both Username and Password.');
      return doFetch('POST', '/api/register', { username, password });
    }
  },

  'login': {
    title: 'User Login (Username & Password)',
    method: 'POST',
    url: '/api/login/usernamepassword',
    requiresAuth: false,
    note: 'Authenticates credentials. On success, server sets an HttpOnly cookie containing refresh_token.',
    inputs: [
      { id: 'username', label: 'USERNAME', type: 'text', placeholder: 'test_patient' },
      { id: 'password', label: 'PASSWORD', type: 'password', placeholder: 'Pass@1234' }
    ],
    sampleData: {
      username: 'test_patient',
      password: 'Password@123'
    },
    action: async () => {
      const username = getInputValue('username');
      const password = getInputValue('password');
      if (!username || !password) return alert('Please enter both Username and Password.');
      return doFetch('POST', '/api/login/usernamepassword', { username, password });
    }
  },

  'token': {
    title: 'Get Access Token',
    method: 'GET',
    url: '/api/auth/token',
    requiresAuth: false,
    note: 'Exchanges the refresh_token cookie for a short-lived JWT access token. Run "Login" first.',
    inputs: [],
    sampleData: {},
    action: async () => {
      return doFetch('GET', '/api/auth/token');
    }
  },

  'changepassword': {
    title: 'Change User Password',
    method: 'POST',
    url: '/api/changepassword',
    requiresAuth: true,
    note: 'Protected endpoint. Requires a valid JWT access token in the Authorization header.',
    inputs: [
      { id: 'newPassword', label: 'NEW PASSWORD', type: 'password', placeholder: 'NewPass@2026' }
    ],
    sampleData: {
      newPassword: 'NewPassword@2026'
    },
    action: async () => {
      const newPassword = getInputValue('newPassword');
      if (!newPassword) return alert('Please enter a new password.');
      return doFetch('POST', '/api/changepassword', { newPassword }, true);
    }
  },

  'logout': {
    title: 'User Logout',
    method: 'POST',
    url: '/api/logout',
    requiresAuth: false,
    note: 'Invalidates the refresh token on the server and clears the HttpOnly cookie.',
    inputs: [],
    sampleData: {},
    action: async () => {
      const res = await doFetch('POST', '/api/logout');
      if (res.status >= 200 && res.status < 300) {
        setActiveToken(null);
      }
      return res;
    }
  },

  // --- Admin Controller ---
  'admin-create': {
    title: 'Create Admin User',
    method: 'POST',
    url: '/admin/create',
    requiresAuth: true,
    note: 'Admin Controller endpoint. Requires a JWT token with ROLE_ADMIN authority.',
    inputs: [
      { id: 'username', label: 'ADMIN USERNAME', type: 'text', placeholder: 'sys_admin_1' },
      { id: 'password', label: 'ADMIN PASSWORD', type: 'password', placeholder: 'AdminPass@123' }
    ],
    sampleData: {
      username: 'admin_' + Math.floor(100 + Math.random() * 900),
      password: 'AdminPassword@123'
    },
    action: async () => {
      const username = getInputValue('username');
      const password = getInputValue('password');
      if (!username || !password) return alert('Please enter Username and Password.');
      return doFetch('POST', '/admin/create', { username, password }, true);
    }
  },

  'admin-all': {
    title: 'Search & List Admins',
    method: 'GET',
    url: '/admin/all',
    requiresAuth: true,
    note: 'Retrieves a paginated list of admin users matching the given username filter.',
    inputs: [
      { id: 'username', label: 'USERNAME FILTER', type: 'text', placeholder: 'admin' },
      { id: 'page', label: 'PAGE NUMBER', type: 'number', placeholder: '0' },
      { id: 'size', label: 'PAGE SIZE', type: 'number', placeholder: '10' }
    ],
    sampleData: {
      username: 'admin',
      page: '0',
      size: '10'
    },
    action: async () => {
      const username = getInputValue('username') || '';
      const page = getInputValue('page') || '0';
      const size = getInputValue('size') || '10';
      const query = `?username=${encodeURIComponent(username)}&page=${page}&size=${size}`;
      return doFetch('GET', `/admin/all${query}`, null, true);
    }
  },

  'admin-delete': {
    title: 'Delete Admin User',
    method: 'DELETE',
    url: '/admin/delete',
    requiresAuth: true,
    note: 'Deletes an admin user by UUID. Requires ROLE_ADMIN authority.',
    inputs: [
      { id: 'id', label: 'ADMIN USER ID (UUID)', type: 'text', placeholder: 'e.g. 550e8400-e29b-41d4-a716-446655440000' }
    ],
    sampleData: {
      id: '123e4567-e89b-12d3-a456-426614174000'
    },
    action: async () => {
      const id = getInputValue('id');
      if (!id) return alert('Please enter the Admin User UUID to delete.');
      return doFetch('DELETE', `/admin/delete?id=${encodeURIComponent(id)}`, null, true);
    }
  },

  // --- Hospital Controller ---
  'hospital-create': {
    title: 'Create Hospital Account',
    method: 'POST',
    url: '/hospital/create',
    requiresAuth: true,
    note: 'Creates a new hospital entity. Requires ROLE_ADMIN authentication.',
    inputs: [
      { id: 'hospitalName', label: 'HOSPITAL NAME', type: 'text', placeholder: 'Metro City Hospital' },
      { id: 'password', label: 'ACCOUNT PASSWORD', type: 'password', placeholder: 'HospPass@123' },
      { id: 'address', label: 'ADDRESS', type: 'text', placeholder: '123 Health Ave' },
      { id: 'city', label: 'CITY', type: 'text', placeholder: 'Mumbai' },
      { id: 'state', label: 'STATE', type: 'text', placeholder: 'Maharashtra' },
      { id: 'phoneNumber', label: 'PHONE NUMBER', type: 'text', placeholder: '9876543210' }
    ],
    sampleData: {
      hospitalName: 'Apollo_Clinic_' + Math.floor(10 + Math.random() * 90),
      password: 'HospitalPass@123',
      address: '45 Care Street',
      city: 'Delhi',
      state: 'Delhi',
      phoneNumber: '98100' + Math.floor(10000 + Math.random() * 90000)
    },
    action: async () => {
      const data = {
        hospitalName: getInputValue('hospitalName'),
        password: getInputValue('password'),
        address: getInputValue('address'),
        city: getInputValue('city'),
        state: getInputValue('state'),
        phoneNumber: getInputValue('phoneNumber')
      };
      if (!data.hospitalName || !data.password) return alert('Hospital Name and Password are required.');
      return doFetch('POST', '/hospital/create', data, true);
    }
  },

  'hospital-reg': {
    title: 'Get Hospital Registration Number',
    method: 'GET',
    url: '/hospital/registrationNumber',
    requiresAuth: true,
    note: 'Fetches the registration UUID for the currently authenticated hospital user.',
    inputs: [],
    sampleData: {},
    action: async () => {
      return doFetch('GET', '/hospital/registrationNumber', null, true);
    }
  }
};

// State Management
function setActiveToken(token) {
  activeToken = token;
  const dot = document.getElementById('token-dot');
  const label = document.getElementById('token-label');

  if (token) {
    dot.className = 'dot dot-on';
    label.textContent = `Token active (${token.substring(0, 12)}...)`;
  } else {
    dot.className = 'dot dot-off';
    label.textContent = 'No active access token';
  }
}

function copyActiveToken() {
  if (!activeToken) return alert('No active token to copy. Run "Get Access Token" first.');
  navigator.clipboard.writeText(activeToken);
  alert('Access Token copied to clipboard!');
}

function clearActiveToken() {
  setActiveToken(null);
}

function copyTokenFromBox() {
  if (activeToken) {
    navigator.clipboard.writeText(activeToken);
    alert('Token copied!');
  }
}

// Input Helpers
function getInputValue(id) {
  const el = document.getElementById(`input-${id}`);
  return el ? el.value.trim() : '';
}

function setInputValue(id, val) {
  const el = document.getElementById(`input-${id}`);
  if (el) el.value = val;
}

function fillSampleData() {
  const config = endpoints[currentEndpointKey];
  if (!config || !config.sampleData) return;
  Object.keys(config.sampleData).forEach(key => {
    setInputValue(key, config.sampleData[key]);
  });
}

// UI Switcher
function selectEndpoint(key) {
  currentEndpointKey = key;

  // Update active sidebar button
  document.querySelectorAll('.ep-btn').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById(`btn-${key}`);
  if (btn) btn.classList.add('active');

  const config = endpoints[key];

  // Update Header details
  const methodEl = document.getElementById('panel-method');
  methodEl.textContent = config.method;
  methodEl.className = `panel-method ${config.method.toLowerCase()}`;

  document.getElementById('panel-title').textContent = config.title;
  document.getElementById('panel-url').textContent = config.url;

  // Render inputs form
  const bodyEl = document.getElementById('panel-body');
  let html = `
    <div class="info-note">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
      <span>${config.note}</span>
    </div>
  `;

  if (config.requiresAuth && !activeToken) {
    html += `
      <div class="info-note" style="background: rgba(239, 68, 68, 0.1); border-color: rgba(239, 68, 68, 0.3); color: #fca5a5;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        <span>Protected endpoint: Requires a Bearer access token. Run "Login" then "Get Access Token" first.</span>
      </div>
    `;
  }

  config.inputs.forEach(input => {
    html += `
      <div class="input-group">
        <label class="input-label">${input.label}</label>
        <input class="input-field" type="${input.type}" id="input-${input.id}" placeholder="${input.placeholder || ''}" autocomplete="off" spellcheck="false" />
      </div>
    `;
  });

  html += `
    <div class="send-action">
      <button class="btn-send" onclick="executeEndpoint()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        Send Request
      </button>
    </div>
  `;

  bodyEl.innerHTML = html;

  // Auto fill sample data on initial view
  fillSampleData();
  resetResponseView();
}

function resetResponseView() {
  document.getElementById('res-placeholder').style.display = 'flex';
  document.getElementById('spinner').style.display = 'none';
  document.getElementById('res-content').style.display = 'none';
  document.getElementById('status-pill').style.display = 'none';
  document.getElementById('latency-tag').textContent = '0 ms';
}

function showSpinner(show) {
  document.getElementById('res-placeholder').style.display = 'none';
  document.getElementById('res-content').style.display = 'none';
  document.getElementById('spinner').style.display = show ? 'flex' : 'none';
}

function displayResponse(status, statusText, data, latencyMs) {
  showSpinner(false);
  document.getElementById('res-placeholder').style.display = 'none';
  document.getElementById('res-content').style.display = 'block';

  document.getElementById('latency-tag').textContent = `${latencyMs} ms`;

  const pill = document.getElementById('status-pill');
  const isOk = status >= 200 && status < 300;
  pill.textContent = `${status} ${statusText || (isOk ? 'OK' : 'ERROR')}`;
  pill.className = `status-pill ${isOk ? 'ok' : 'error'}`;

  // Handle Token Extraction
  const tokenBox = document.getElementById('token-box');
  if (currentEndpointKey === 'token' && isOk && data && data.accessToken) {
    setActiveToken(data.accessToken);
    tokenBox.style.display = 'block';
    document.getElementById('token-value').textContent = data.accessToken;
  } else {
    tokenBox.style.display = 'none';
  }

  const pre = document.getElementById('res-pre');
  if (typeof data === 'object') {
    pre.textContent = JSON.stringify(data, null, 2);
  } else {
    pre.textContent = data;
  }
}

// Cookie & Origin Diagnostic Helper
function checkCookieEnvironment() {
  const warningEl = document.getElementById('cookie-warning-banner');
  if (!warningEl) return;

  const currentHost = window.location.hostname;
  const isFileProtocol = window.location.protocol === 'file:';
  const baseUrlInput = document.getElementById('base-url');
  let targetUrl = baseUrlInput ? baseUrlInput.value.trim() : '';

  let warningHtml = '';

  if (isFileProtocol) {
    warningHtml = `
      <div class="cookie-warning-box">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        <div class="warning-content">
          <strong>Cookie Warning: Opened via file:// Protocol</strong>
          <span>Browsers block HttpOnly cookies on file:// URLs. Please run a local web server (e.g. Live Server at http://localhost:5500 or http://127.0.0.1:5500).</span>
        </div>
      </div>
    `;
  } else if (currentHost) {
    let targetHost = '';
    try {
      targetHost = new URL(targetUrl).hostname;
    } catch (e) {}

    if (targetHost && currentHost !== targetHost && (currentHost === '127.0.0.1' || currentHost === 'localhost') && (targetHost === '127.0.0.1' || targetHost === 'localhost')) {
      const suggestedUrl = `http://${currentHost}:8081`;
      warningHtml = `
        <div class="cookie-warning-box mismatch">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
          <div class="warning-content">
            <strong>Origin Host Mismatch Detected (${currentHost} vs ${targetHost}):</strong>
            <span>Your browser is accessing the UI on <code>${currentHost}</code>, but target URL is set to <code>${targetHost}</code>. Browsers treat 127.0.0.1 and localhost as different origins and WILL NOT send cookies!</span>
          </div>
          <button class="fix-host-btn" onclick="syncHost('${suggestedUrl}')">Sync to ${suggestedUrl}</button>
        </div>
      `;
    }
  }

  if (warningHtml) {
    warningEl.innerHTML = warningHtml;
    warningEl.style.display = 'block';
  } else {
    warningEl.style.display = 'none';
  }
}

function syncHost(newUrl) {
  const baseUrlInput = document.getElementById('base-url');
  if (baseUrlInput) {
    baseUrlInput.value = newUrl;
    checkCookieEnvironment();
  }
}

// Fetch Engine
async function doFetch(method, path, bodyObj = null, requiresAuth = false) {
  const baseUrl = document.getElementById('base-url').value.replace(/\/$/, '');
  const url = baseUrl + path;

  const headers = {};

  if (bodyObj && (method === 'POST' || method === 'PUT')) {
    headers['Content-Type'] = 'application/json';
  }

  if (requiresAuth && activeToken) {
    headers['Authorization'] = `Bearer ${activeToken}`;
  }

  const options = {
    method,
    headers,
    credentials: 'include' // Instructs fetch to send refresh_token HttpOnly cookie
  };

  if (bodyObj && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(bodyObj);
  }

  showSpinner(true);
  const startTime = performance.now();

  try {
    const response = await fetch(url, options);
    const endTime = performance.now();
    const latencyMs = Math.round(endTime - startTime);

    const contentType = response.headers.get('content-type');
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    displayResponse(response.status, response.statusText, data, latencyMs);
    return { status: response.status, data };

  } catch (error) {
    const endTime = performance.now();
    const latencyMs = Math.round(endTime - startTime);
    showSpinner(false);

    let errMessage = error.message;
    if (errMessage === 'Failed to fetch') {
      errMessage = `Network Error: Could not connect to backend at ${baseUrl}.\n\nTroubleshooting Tips:\n1. Verify your Spring Boot app is running on port 8081.\n2. Ensure CORS credentials and origins are configured properly.\n3. Check browser console network tab.`;
    }

    displayResponse(0, 'Network Failure', errMessage, latencyMs);
    throw error;
  }
}

async function executeEndpoint() {
  const config = endpoints[currentEndpointKey];
  if (config && config.action) {
    await config.action();
  }
}

async function testConnection() {
  const baseUrl = document.getElementById('base-url').value.replace(/\/$/, '');
  const pingDot = document.getElementById('ping-indicator');
  const pingText = document.getElementById('ping-text');

  pingText.textContent = 'Ping...';
  try {
    const res = await fetch(baseUrl + '/api/register', { method: 'OPTIONS' });
    pingDot.style.background = '#10b981';
    pingText.textContent = 'Backend Online';
  } catch (err) {
    pingDot.style.background = '#ef4444';
    pingText.textContent = 'Backend Offline';
  }
}

// Initializer
document.addEventListener('DOMContentLoaded', () => {
  // Auto-align base-url domain with browser host (127.0.0.1 vs localhost)
  const baseUrlInput = document.getElementById('base-url');
  if (baseUrlInput) {
    if (window.location.hostname === '127.0.0.1' && baseUrlInput.value.includes('localhost')) {
      baseUrlInput.value = 'http://127.0.0.1:8081';
    } else if (window.location.hostname === 'localhost' && baseUrlInput.value.includes('127.0.0.1')) {
      baseUrlInput.value = 'http://localhost:8081';
    }
    baseUrlInput.addEventListener('input', checkCookieEnvironment);
  }

  checkCookieEnvironment();
  selectEndpoint('register');
});
