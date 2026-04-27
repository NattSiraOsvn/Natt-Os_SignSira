// security-overlay.js — natt-os Tường Lửa
// Chuyển đổi từ SecurityOverlay.tsx → JS thuần
// Lắng Nahere: quantum.kill, quantum.violation, quantum.lockdown
// PIN verify qua Kênh /api/auth (fallback mock khi offline)

const SecurityOverlay = (() => {
  const AUTO_LOCK_DELAY = 600_000; // 10 phút
  const BASE = 'http://localhost:3001';

  let _isLocked = false;
  let _isStaging = false;
  let _lockStep = 'PIN'; // 'PIN' | 'MFA'
  let _lastActivity = Date.now();
  let _threatDetails = null;
  let _activityTimer = null;

  // ── DOM inject ────────────────────────────────────────
  function _injectStyles() {
    if (document.getElementById('so-styles')) return;
    const s = document.createElement('style');
    s.id = 'so-styles';
    s.textContent = `
      #so-overlay { position:fixed;inset:0;z-index:9999;display:none;align-items:center;justify-content:center;
        backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);background:rgba(5,0,0,.92);
        animation:soFadeIn .4s ease; }
      #so-overlay.threat { background:rgba(80,0,0,.95); }
      #so-overlay.active { display:flex; }
      @keyframes soFadeIn { from{opacity:0} to{opacity:1} }
      #so-box { width:100%;max-width:420px;padding:48px 40px;background:rgba(8,8,14,.96);
        border:2px solid rgba(255,255,255,.08);border-radius:48px;text-align:center;position:relative;
        box-shadow:0 0 120px rgba(0,0,0,.8); }
      #so-overlay.threat #so-box { border-color:rgba(255,60,60,.5);box-shadow:0 0 80px rgba(255,0,0,.3); }
      #so-shimmer { position:absolute;top:0;left:0;right:0;height:2px;
        background:linear-gradient(90deg,#3b82f6,#06b6d4,#3b82f6);
        background-size:200%;animation:soShimmer 2s infinite; }
      #so-overlay.threat #so-shimmer { background:linear-gradient(90deg,#dc2626,#fff,#dc2626);background-size:200%; }
      @keyframes soShimmer { 0%{background-position:0%} 100%{background-position:200%} }
      #so-icon { font-size:72px;margin-bottom:24px;animation:soPulse 2s infinite; }
      @keyframes soPulse { 0%,100%{opacity:1} 50%{opacity:.6} }
      #so-title { font-size:28px;font-weight:900;text-transform:uppercase;letter-spacing:.15em;
        color:#fff;margin-bottom:6px; }
      #so-sub { font-size:9px;color:#555;text-transform:uppercase;letter-spacing:.4em;
        font-weight:900;margin-bottom:32px; }
      #so-input { width:100%;background:rgba(0,0,0,.6);border:1px solid rgba(255,255,255,.1);
        border-radius:16px;padding:20px;text-align:center;color:#fff;font-size:28px;
        font-weight:900;letter-spacing:.5em;outline:none;box-sizing:border-box;
        transition:border-color .2s; }
      #so-input:focus { border-color:#f59e0b; }
      #so-input::placeholder { font-size:9px;letter-spacing:.3em;opacity:.3; }
      #so-error { font-size:9px;color:#ef4444;font-weight:900;text-transform:uppercase;
        letter-spacing:.2em;margin:12px 0;min-height:16px; }
      #so-btn { width:100%;padding:20px;background:#fff;color:#000;font-weight:900;
        font-size:10px;text-transform:uppercase;letter-spacing:.5em;border:none;
        border-radius:28px;cursor:pointer;transition:all .2s;margin-top:8px; }
      #so-btn:hover { background:#f59e0b; }
      #so-btn:active { transform:scale(.97); }
      #so-watermark { position:fixed;inset:0;pointer-events:none;z-index:9998;opacity:.025;overflow:hidden; }
      #so-watermark span { position:absolute;color:#fff;font-family:monospace;font-size:14px;
        font-weight:900;transform:rotate(-12deg);white-space:nowrap; }
      #so-staging { position:fixed;inset:0;z-index:9998;display:none;align-items:center;
        justify-content:center;background:rgba(0,0,0,.6);backdrop-filter:blur(32px); }
      #so-staging.active { display:flex; }
      #so-staging-box { padding:48px;background:rgba(0,10,20,.85);border:1px solid rgba(6,182,212,.2);
        border-radius:48px;text-align:center;max-width:400px;
        box-shadow:0 0 80px rgba(6,182,212,.1); }
      #so-staging-pulse { width:80px;height:80px;border-radius:50%;margin:0 auto 24px;
        background:rgba(6,182,212,.15);border:2px solid rgba(6,182,212,.4);
        animation:soPulse 1.5s infinite; }
      #so-staging-msg { font-size:11px;color:#06b6d4;font-weight:900;text-transform:uppercase;
        letter-spacing:.2em; }
    `;
    document.head.appendChild(s);
  }

  function _injectDOM() {
    if (document.getElementById('so-overlay')) return;

    // Watermark
    const wm = document.createElement('div');
    wm.id = 'so-watermark';
    for (let i = 0; i < 8; i++) for (let j = 0; j < 6; j++) {
      const sp = document.createElement('span');
      sp.textContent = 'natt-os • SECURE • AES-256';
      sp.style.cssText = `top:${i*12.5}%;left:${j*18}%`;
      wm.appendChild(sp);
    }

    // Staging overlay (SOFT)
    const staging = document.createElement('div');
    staging.id = 'so-staging';
    staging.innerHTML = `
      <div id="so-staging-box">
        <div id="so-staging-pulse"></div>
        <div id="so-staging-msg">Quantum Buffer đang xử lý…</div>
      </div>`;

    // Lock overlay (HARD)
    const overlay = document.createElement('div');
    overlay.id = 'so-overlay';
    overlay.innerHTML = `
      <div id="so-box">
        <div id="so-shimmer"></div>
        <div id="so-icon">🔐</div>
        <div id="so-title">Access Restricted</div>
        <div id="so-sub">Session Verification Required</div>
        <input id="so-input" type="password" maxlength="6" placeholder="NHẬP PIN QUẢN TRỊ" autocomplete="off"/>
        <div id="so-error"></div>
        <button id="so-btn">VALIDATE IDENTITY</button>
      </div>`;

    document.body.appendChild(wm);
    document.body.appendChild(staging);
    document.body.appendChild(overlay);

    document.getElementById('so-btn').addEventListener('click', _handleUnlock);
    document.getElementById('so-input').addEventListener('keydown', e => { if (e.key === 'Enter') _handleUnlock(); });
  }

  // ── Verify PIN qua server ─────────────────────────────
  async function _verifyPin(pin) {
    try {
      const r = await fetch(`${BASE}/api/auth/verify-pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      if (r.ok) {
        const d = await r.json();
        return d.valid === true;
      }
    } catch {}
    // Fallback khi server offline — sẽ bị xóa sau khi có DB
    return pin === '123456' || pin === '654321';
  }

  async function _verifyMfa(code) {
    try {
      const r = await fetch(`${BASE}/api/auth/verify-mfa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      if (r.ok) {
        const d = await r.json();
        return d.valid === true;
      }
    } catch {}
    return code === '123456'; // Fallback mock
  }

  // ── Unlock flow ───────────────────────────────────────
  async function _handleUnlock() {
    const input = document.getElementById('so-input');
    const error = document.getElementById('so-error');
    const btn = document.getElementById('so-btn');
    const val = input.value.trim();

    btn.textContent = 'Đang xác thực…';
    btn.disabled = true;

    if (_lockStep === 'PIN') {
      const valid = await _verifyPin(val);
      if (valid) {
        if (_threatDetails) {
          _lockStep = 'MFA';
          input.type = 'text';
          input.placeholder = 'MÃ XÁC THỰC OMEGA';
          input.value = '';
          btn.textContent = 'RESTORE TERMINAL';
          error.textContent = '';
        } else {
          _completeUnlock();
        }
      } else {
        error.textContent = 'Mã PIN quản trị không chính xác';
        input.value = '';
      }
    } else {
      const valid = await _verifyMfa(val);
      if (valid) {
        _completeUnlock();
      } else {
        error.textContent = 'Mã xác thực MFA không đúng';
        input.value = '';
      }
    }

    btn.disabled = false;
    btn.textContent = _lockStep === 'PIN' ? 'VALIDATE IDENTITY' : 'RESTORE TERMINAL';
    setTimeout(() => input.focus(), 100);
  }

  function _completeUnlock() {
    _isLocked = false;
    _isStaging = false;
    _threatDetails = null;
    _lockStep = 'PIN';
    _lastActivity = Date.now();
    document.getElementById('so-overlay').classList.remove('active', 'threat');
    document.getElementById('so-input').type = 'password';
    document.getElementById('so-input').placeholder = 'NHẬP PIN QUẢN TRỊ';
    document.getElementById('so-input').value = '';
    document.getElementById('so-error').textContent = '';
    console.log('[SecurityOverlay] ✅ Unlocked');
  }

  // ── Trigger lockdown ──────────────────────────────────
  function lock(threat = null) {
    _isLocked = true;
    _threatDetails = threat;
    _lockStep = 'PIN';
    const overlay = document.getElementById('so-overlay');
    const icon = document.getElementById('so-icon');
    overlay.classList.add('active');
    if (threat) {
      overlay.classList.add('threat');
      icon.textContent = '🚨';
    } else {
      overlay.classList.remove('threat');
      icon.textContent = '🔐';
    }
    setTimeout(() => document.getElementById('so-input')?.focus(), 200);
    console.warn('[SecurityOverlay] 🔒 LOCKED', threat || '(auto)');
  }

  function staging(msg = null) {
    _isStaging = true;
    const el = document.getElementById('so-staging');
    const msgEl = document.getElementById('so-staging-msg');
    el.classList.add('active');
    if (msg) msgEl.textContent = msg;
  }

  function clearStaging() {
    _isStaging = false;
    document.getElementById('so-staging')?.classList.remove('active');
  }

  // ── Activity tracking → auto-lock ────────────────────
  function _trackActivity() {
    _lastActivity = Date.now();
  }

  function _startAutoLock() {
    clearInterval(_activityTimer);
    _activityTimer = setInterval(() => {
      if (!_isLocked && Date.now() - _lastActivity > AUTO_LOCK_DELAY) {
        lock(null);
      }
    }, 5000);
  }

  // ── Lắng Nahere từ Mạch HeyNa ────────────────────────
  function _wireEventBus() {
    // Lắng từ SSE Mạch HeyNa
    window.addEventListener('nattosEvent', (e) => {
      const { event, payload } = e.detail || {};
      if (event === 'quantum.kill' || event === 'quantum.lockdown') {
        lock({ level: 'CRITICAL', details: payload?.reason || 'Quantum Defense triggered' });
      }
      if (event === 'quantum.violation' && payload?.severity === 'CRITICAL') {
        lock({ level: 'CRITICAL', details: payload?.type || 'Constitutional violation' });
      }
    });

    // Lắng CustomEvent từ FraudGuard
    window.addEventListener('OMEGA_LOCKDOWN', (e) => {
      lock({ level: 'CRITICAL', details: e.detail?.reason || 'OMEGA lockdown' });
    });
  }

  // ── Init ──────────────────────────────────────────────
  function init() {
    _injectStyles();
    _injectDOM();
    _wireEventBus();
    _startAutoLock();

    ['mousemove', 'keydown', 'click', 'touchstart'].forEach(ev =>
      window.addEventListener(ev, _trackActivity, { passive: true })
    );

    console.log('[SecurityOverlay] 🛡️ Tường lửa active — auto-lock:', AUTO_LOCK_DELAY / 60000, 'phút');
  }

  return { init, lock, staging, clearStaging };
})();

// Auto-init khi DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', SecurityOverlay.init);
} else {
  SecurityOverlay.init();
}

export { SecurityOverlay };
