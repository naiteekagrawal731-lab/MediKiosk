const endpoints = {
  register: {
    method: 'POST',
    title: 'Register User',
    url: '/api/register',
    requiresAuth: false,
    render: () => `
      <div class="info-note">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
        <span>Create a new user account. Passwords are hashed before storing in the database.</span>
      </div>
      <div class="input-group">
        <label class="input-label">USERNAME</label>
        <input class="input-field" type="text" id="req-username" placeholder="johndoe" autocomplete="off" spellcheck="false" />
      </div>
      <div class="input-group">
        <label class="input-label">PASSWORD</label>
        <input class="input-field" type="password" id="req-password" placeholder="••••••••" />
      </div>
      <div class="send-action">
        <button class="btn-send" onclick="sendRegister()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          Send Request
        </button>
      </div>
    `
  },
  login: {
    method: 'POST',
    title: 'Login',
    url: '/api/login/usernamepassword',
    requiresAuth: false,
    render: () => `
      <div class="info-note">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
        <span>On success, the backend sets an HttpOnly cookie containing the refresh_token.</span>
      </div>
      <div class="input-group">
        <label class="input-label">USERNAME</label>
        <input class="input-field" type="text" id="req-username" placeholder="johndoe" autocomplete="off" spellcheck="false" />
      </div>
      <div class="input-group">
        <label class="input-label">PASSWORD</label>
        <input class="input-field" type="password" id="req-password" placeholder="••••••••" />
      </div>
      <div class="send-action">
        <button class="btn-send" onclick="sendLogin()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          Send Request
        </button>
      </div>
    `
  },
  token: {
    method: 'GET',
    title: 'Get Access Token',
    url: '/api/auth/token',
    requiresAuth: false,
    render: () => `
      <div class="info-note">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
        <span>Exchanges the refresh_token cookie for a short-lived JWT access token.</span>
      </div>
      <div class="send-action">
        <button class="btn-send" onclick="sendToken()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          Send Request
        </button>
      </div>
    `
  },
  changepassword: {
    method: 'POST',
    title: 'Change Password',
    url: '/api/changepassword',
    requiresAuth: true,
    render: () => `
      <div class="info-note">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        <span>Protected endpoint. Requires a valid JWT access token in the Authorization header.</span>
      </div>
      <div class="input-group">
        <label class="input-label">NEW PASSWORD</label>
        <input class="input-field" type="password" id="req-newpassword" placeholder="••••••••" />
      </div>
      <div class="send-action">
        <button class="btn-send" onclick="sendChangePassword()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          Send Request
        </button>
      </div>
    `
  },
  logout: {
    method: 'POST',
    title: 'Logout',
    url: '/api/logout',
    requiresAuth: false,
    render: () => `
      <div class="info-note">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        <span>Invalidates the refresh token on the server and clears the cookie.</span>
      </div>
      <div class="send-action">
        <button class="btn-send" onclick="sendLogout()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          Send Request
        </button>
      </div>
    `
  }
};

let currentToken = null;

function setTokenStatus(token) {
  currentToken = token;
  const dot = document.getElementById('token-dot');
  const label = document.getElementById('token-label');
  
  if (token) {
    dot.className = 'dot dot-on';
    label.textContent = 'Token active';
  } else {
    dot.className = 'dot dot-off';
    label.textContent = 'No token';
  }
}

function selectEndpoint(key) {
  // Update sidebar active state
  document.querySelectorAll('.ep-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(`btn-${key}`).classList.add('active');

  const ep = endpoints[key];
  
  // Update Header
  const methodEl = document.getElementById('panel-method');
  methodEl.textContent = ep.method;
  methodEl.className = \`panel-method \${ep.method.toLowerCase()}\`;
  
  document.getElementById('panel-title').textContent = ep.title;
  document.getElementById('panel-url').textContent = ep.url;
  
  // Update Body
  document.getElementById('panel-body').innerHTML = ep.render();
  
  // Reset Response
  resetResponse();
}

function resetResponse() {
  document.getElementById('res-placeholder').style.display = 'flex';
  document.getElementById('res-content').style.display = 'none';
  document.getElementById('status-pill').style.display = 'none';
  document.getElementById('copy-token-btn').style.display = 'none';
  document.getElementById('token-box').style.display = 'none';
}

function showSpinner(show) {
  document.getElementById('spinner').style.display = show ? 'block' : 'none';
  if (show) {
    document.getElementById('res-placeholder').style.display = 'none';
    document.getElementById('res-content').style.display = 'none';
  }
}

function showResponse(status, data, isTokenRes = false) {
  showSpinner(false);
  document.getElementById('res-placeholder').style.display = 'none';
  document.getElementById('res-content').style.display = 'block';
  
  const pill = document.getElementById('status-pill');
  pill.textContent = \`\${status}\`;
  pill.className = \`status-pill \${status >= 200 && status < 300 ? 'ok' : 'error'}\`;
  pill.style.display = 'block';

  if (isTokenRes && status === 201 && data && data.accessToken) {
    setTokenStatus(data.accessToken);
    document.getElementById('token-box').style.display = 'block';
    document.getElementById('token-value').textContent = data.accessToken;
    document.getElementById('copy-token-btn').style.display = 'flex';
  } else {
    document.getElementById('token-box').style.display = 'none';
    document.getElementById('copy-token-btn').style.display = 'none';
  }

  const pre = document.getElementById('res-pre');
  if (typeof data === 'object') {
    pre.textContent = JSON.stringify(data, null, 2);
  } else {
    pre.textContent = data;
  }
}

async function doFetch(method, path, bodyObj = null, requiresAuth = false) {
  const baseUrl = document.getElementById('base-url').value.replace(/\/$/, '');
  const url = baseUrl + path;
  
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include' // Important for cookies!
  };

  if (requiresAuth && currentToken) {
    options.headers['Authorization'] = \`Bearer \${currentToken}\`;
  }

  if (bodyObj) {
    options.body = JSON.stringify(bodyObj);
  }

  showSpinner(true);

  try {
    const response = await fetch(url, options);
    const contentType = response.headers.get('content-type');
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }
    return { status: response.status, data };
  } catch (error) {
    showSpinner(false);
    
    let errMsg = error.message;
    if (errMsg === 'Failed to fetch') {
      errMsg = 'Network Error: Backend is unreachable or CORS blocked the request. Ensure backend is running on ' + baseUrl;
    }
    
    showResponse(0, \`Fetch error: \${errMsg}\n\nHint: Check if the backend is actually running. If you are opening this HTML file directly (file://), you might hit CORS issues unless your backend allows it.\`);
    throw error;
  }
}

// Action Handlers
async function sendRegister() {
  const username = document.getElementById('req-username').value;
  const password = document.getElementById('req-password').value;
  if (!username || !password) return alert('Fill in all fields');
  
  const res = await doFetch('POST', '/api/register', { username, password });
  showResponse(res.status, res.data);
}

async function sendLogin() {
  const username = document.getElementById('req-username').value;
  const password = document.getElementById('req-password').value;
  if (!username || !password) return alert('Fill in all fields');
  
  const res = await doFetch('POST', '/api/login/usernamepassword', { username, password });
  showResponse(res.status, res.data);
}

async function sendToken() {
  const res = await doFetch('GET', '/api/auth/token');
  showResponse(res.status, res.data, true);
}

async function sendChangePassword() {
  const newPassword = document.getElementById('req-newpassword').value;
  if (!newPassword) return alert('Enter a new password');
  if (!currentToken) return alert('You need an access token first (Get Token).');
  
  const res = await doFetch('POST', '/api/changepassword', { newPassword }, true);
  showResponse(res.status, res.data);
}

async function sendLogout() {
  const res = await doFetch('POST', '/api/logout');
  if (res.status >= 200 && res.status < 300) {
    setTokenStatus(null);
  }
  showResponse(res.status, res.data);
}

function copyToken() {
  if (currentToken) {
    navigator.clipboard.writeText(currentToken);
    const btn = document.getElementById('copy-token-btn');
    const originalContent = btn.innerHTML;
    btn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Copied!';
    setTimeout(() => {
      btn.innerHTML = originalContent;
    }, 2000);
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  selectEndpoint('register');
});
