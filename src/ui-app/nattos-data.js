/**
 * NATT-OS Data Layer v1.0
 * Client-side connector — UI apps gọi server 3001 để đọc/ghi GSheets thật
 *
 * Dùng: await NattosData.read('sx1')
 *       await NattosData.append('sx1', 'Sheet1', [[row data]])
 *       NattosData.onUpdate('sx1', callback)
 *
 * Auto-fallback về localStorage nếu server offline
 * LỆNH #001 compliant — zero LLM API
 */

const NattosData = (() => {
'use strict';

const SERVER = 'http://localhost:3001';
let isOnline  = false;
let listeners = {};
let pollTimers = {};

// ── HEALTH CHECK ──────────────────────────────────────────────────────────
async function checkServer() {
  try {
    const r = await fetch(`${SERVER}/kenh/suc`, { signal: AbortSignal.timeout(3000) });
    isOnline = r.ok;
  } catch {
    isOnline = false;
  }
  _updateStatus(isOnline);
  return isOnline;
}

function _updateStatus(online) {
  // Update UI status badge nếu có
  const badge = document.getElementById('ndata-status');
  if (badge) {
    badge.textContent = online ? '🟢 GSheets Live' : '🟡 Local Mode';
    badge.style.color = online ? 'var(--green,#3dd68c)' : 'var(--amber,#f0a030)';
  }
  // Dispatch event
  window.dispatchEvent(new CustomEvent('nattos-data-status', { detail: { online } }));
}

// ── READ ──────────────────────────────────────────────────────────────────
async function read(sheetKey, range = 'A1:Z500') {
  if (!isOnline) return _localRead(sheetKey);

  try {
    const r = await fetch(`${SERVER}/api/sheets/${sheetKey}?range=${range}`);
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const data = await r.json();
    // Cache locally
    _localSave(sheetKey, data);
    return data;
  } catch (e) {
    console.warn(`[NattosData] Fallback local: ${e.message}`);
    return _localRead(sheetKey);
  }
}

// ── READ BY SHEET ID ──────────────────────────────────────────────────────
async function readById(sheetId, range = 'A1:Z500') {
  if (!isOnline) return null;
  try {
    const r = await fetch(`${SERVER}/api/read/${sheetId}?range=${range}`);
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return await r.json();
  } catch (e) {
    console.warn(`[NattosData] readById error: ${e.message}`);
    return null;
  }
}

// ── WRITE ─────────────────────────────────────────────────────────────────
async function write(sheetKey, range, values) {
  if (!isOnline) {
    console.warn('[NattosData] Offline — ghi vào local only');
    return { ok: false, offline: true };
  }
  try {
    const r = await fetch(`${SERVER}/api/sheets/${sheetKey}/write`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ range, values }),
    });
    return await r.json();
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

// ── APPEND ────────────────────────────────────────────────────────────────
async function append(sheetKey, range, values) {
  if (!isOnline) {
    // Queue locally — sync khi online lại
    _queueAppend(sheetKey, range, values);
    return { ok: false, queued: true };
  }
  try {
    const r = await fetch(`${SERVER}/api/sheets/${sheetKey}/append`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ range, values }),
    });
    // Flush queue nếu có
    _flushQueue(sheetKey);
    return await r.json();
  } catch (e) {
    _queueAppend(sheetKey, range, values);
    return { ok: false, error: e.message, queued: true };
  }
}


// ── READ BY TAB ───────────────────────────────────────────────────────────
async function readTab(tabName, range = 'A1:Z500') {
  const MASTER = '1d5PQxqOYMOs_kVUcN-cxXSQLuUj97CHpyXC1XaRQECg';
  const fullRange = `${tabName}!${range}`;
  if (!isOnline) return _localRead(`tab_${tabName}`);
  try {
    const r = await fetch(`${SERVER}/api/read/${MASTER}?range=${encodeURIComponent(fullRange)}`);
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const data = await r.json();
    _localSave(`tab_${tabName}`, data);
    return data;
  } catch (e) {
    return _localRead(`tab_${tabName}`);
  }
}

// ── APPEND TO TAB ─────────────────────────────────────────────────────────
async function appendTab(tabName, values) {
  const MASTER = '1d5PQxqOYMOs_kVUcN-cxXSQLuUj97CHpyXC1XaRQECg';
  if (!isOnline) { _queueAppend(`tab_${tabName}`, `${tabName}!A:Z`, values); return { ok: false, queued: true }; }
  try {
    const r = await fetch(`${SERVER}/api/read/${MASTER}/append`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ range: `${tabName}!A:Z`, values }),
    });
    return await r.json();
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

// ── REALTIME POLL ─────────────────────────────────────────────────────────
function onUpdate(sheetKey, callback, intervalMs = 30000) {
  if (!listeners[sheetKey]) listeners[sheetKey] = [];
  listeners[sheetKey].push(callback);

  // Start polling
  if (!pollTimers[sheetKey]) {
    pollTimers[sheetKey] = setInterval(async () => {
      if (!isOnline) return;
      try {
        const data = await read(sheetKey);
        listeners[sheetKey].forEach(cb => cb(data));
      } catch {}
    }, intervalMs);
    // Fire immediately
    read(sheetKey).then(data => {
      if (data) listeners[sheetKey].forEach(cb => cb(data));
    });
  }
}

function offUpdate(sheetKey) {
  clearInterval(pollTimers[sheetKey]);
  delete pollTimers[sheetKey];
  delete listeners[sheetKey];
}

// ── LOCAL STORAGE FALLBACK ────────────────────────────────────────────────
function _localSave(key, data) {
  try {
    localStorage.setItem(`ndata_${key}`, JSON.stringify({ ts: Date.now(), data }));
  } catch {}
}

function _localRead(key) {
  try {
    const raw = localStorage.getItem(`ndata_${key}`);
    if (!raw) return null;
    const { ts, data } = JSON.parse(raw);
    const age = Date.now() - ts;
    if (age > 5 * 60 * 1000) console.warn(`[NattosData] Cache stale: ${key} (${Math.round(age/1000)}s old)`);
    return data;
  } catch { return null; }
}

// ── OFFLINE QUEUE ─────────────────────────────────────────────────────────
function _queueAppend(sheetKey, range, values) {
  const key = `ndata_queue_${sheetKey}`;
  const queue = JSON.parse(localStorage.getItem(key) || '[]');
  queue.push({ range, values, ts: Date.now() });
  localStorage.setItem(key, JSON.stringify(queue));
}

async function _flushQueue(sheetKey) {
  const key = `ndata_queue_${sheetKey}`;
  const queue = JSON.parse(localStorage.getItem(key) || '[]');
  if (!queue.length) return;

  for (const item of queue) {
    try {
      await append(sheetKey, item.range, item.values);
    } catch {}
  }
  localStorage.removeItem(key);
}

// ── SUMMARY ───────────────────────────────────────────────────────────────
async function summary() {
  if (!isOnline) return null;
  try {
    const r = await fetch(`${SERVER}/api/summary`);
    return await r.json();
  } catch { return null; }
}

// ── STATUS BAR INJECTION ──────────────────────────────────────────────────
function injectStatusBar() {
  if (document.getElementById('ndata-statusbar')) return;
  const bar = document.createElement('div');
  bar.id = 'ndata-statusbar';
  bar.style.cssText = `
    position:fixed;bottom:${document.getElementById('nfx-ticker')?'30px':'4px'};right:10px;
    z-index:1000;display:flex;align-items:center;gap:6px;
    background:rgba(8,8,20,.85);border:1px solid rgba(200,146,42,.15);
    border-radius:20px;padding:3px 10px;font-family:'JetBrains Mono',monospace;
    font-size:9px;letter-spacing:.1em;cursor:pointer;
  `;
  bar.innerHTML = `<span id="ndata-status" style="color:#f0a030">🟡 Đang kết nối...</span>`;
  bar.onclick = () => window.open('http://localhost:3001/kenh/suc', '_blank');
  document.body.appendChild(bar);
}

// ── INIT ──────────────────────────────────────────────────────────────────
async function init() {
  // Inject status bar sau khi DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectStatusBar);
  } else {
    injectStatusBar();
  }

  // Check server
  await checkServer();

  // Re-check mỗi 60s
  setInterval(checkServer, 60000);

  // Flush queued writes nếu online
  if (isOnline) {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('ndata_queue_'));
    for (const key of keys) {
      const sheetKey = key.replace('ndata_queue_', '');
      await _flushQueue(sheetKey);
    }
  }

  console.log(`[NattosData] Status: ${isOnline ? '🟢 GSheets Live' : '🟡 Local Mode'}`);
  return isOnline;
}

// Boot
if (typeof window !== 'undefined') {
  window.addEventListener('load', init);
}

return {
  init, read, readById, readTab, appendTab, write, append,
  onUpdate, offUpdate, summary, checkServer,
  get isOnline() { return isOnline; },
};

})();

if (typeof window !== 'undefined') window.NattosData = NattosData;
if (typeof module !== 'undefined') module.exports = NattosData;
