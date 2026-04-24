/**
 * Natt-OS Data Layer v2.0
 * ════════════════════════════════════════════════════════════
 * Refactored 2026-04-17 — Layer 2 compliant (Mạch HeyNa)
 *
 * Changes from v1.0:
 *   - fetch() → heyna.request() / heyna.send()  (L2 compliance)
 *   - localStorage → in-memory cache             (HP Điều 7)
 *   - polling → heyna.on() SSE subscription       (realtime)
 *
 * Requires: heyna-client.js loaded before this script
 * Fallback: direct fetch if HeyNa not connected (graceful degrade)
 *
 * LỆNH #001 compliant — zero LLM API
 * ════════════════════════════════════════════════════════════
 */

const NattosData = (() => {
'use strict';

const SERVER = 'http://localhost:3001';
const MASTER = '1d5PQxqOYMOs_kVUcN-cxXSQLuUj97CHpyXC1XaRQECg';

let isOnline  = false;
let listeners = {};
let heyna     = null;

// ── IN-MEMORY CACHE (replaces localStorage — HP Điều 7) ───────────────────
const _cache = new Map();
const _queue = [];

function _cacheSave(key, data) {
  _cache.set(key, { ts: Date.now(), data });
}

function _cacheRead(key) {
  const entry = _cache.get(key);
  if (!entry) return null;
  const age = Date.now() - entry.ts;
  if (age > 5 * 60 * 1000) {
    console.warn('[NattosData] Cache stale: ' + key + ' (' + Math.round(age/1000) + 's old)');
  }
  return entry.data;
}

// ── HEYNA TRANSPORT (replaces fetch — L2 compliance) ──────────────────────

function _getHeyna() {
  if (heyna && heyna.isConnected()) return heyna;
  if (typeof window !== 'undefined' && window.HeyNa && !heyna) {
    heyna = new window.HeyNa();
    heyna.connect();
  }
  return (heyna && heyna.isConnected()) ? heyna : null;
}

/**
 * GET via HeyNa request() or fallback fetch
 */
async function _get(url) {
  var h = _getHeyna();
  if (h) {
    try {
      // Route through HeyNa gateway
      var result = await h.request(
        'data.get',
        { url: url },
        'data.response',
        8000
      );
      return result;
    } catch (e) {
      // Fallback to direct fetch if HeyNa timeout
      console.warn('[NattosData] HeyNa timeout, fallback fetch:', e.message);
    }
  }
  // Direct fetch (fallback until server gateway fully wired)
  var r = await fetch(url);
  if (!r.ok) throw new Error('HTTP ' + r.status);
  return await r.json();
}

/**
 * POST via HeyNa send() or fallback fetch
 */
async function _post(url, body) {
  var h = _getHeyna();
  if (h) {
    try {
      return await h.send('data.post', { url: url, body: body });
    } catch (e) {
      console.warn('[NattosData] HeyNa send failed, fallback fetch:', e.message);
    }
  }
  var r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return await r.json();
}

// ── HEALTH CHECK ──────────────────────────────────────────────────────────
async function checkServer() {
  try {
    await _get(SERVER + '/kenh/suc');
    isOnline = true;
  } catch {
    isOnline = false;
  }
  _updateStatus(isOnline);
  return isOnline;
}

function _updateStatus(online) {
  var badge = document.getElementById('ndata-status');
  if (badge) {
    badge.textContent = online ? '🟢 GSheets Live' : '🟡 Local Mode';
    badge.style.color = online ? 'var(--green,#3dd68c)' : 'var(--amber,#f0a030)';
  }
  window.dispatchEvent(new CustomEvent('nattos-data-status', { detail: { online: online } }));
}

// ── READ ──────────────────────────────────────────────────────────────────
async function read(sheetKey, range) {
  range = range || 'A1:Z500';
  if (!isOnline) return _cacheRead(sheetKey);
  try {
    var data = await _get(SERVER + '/api/sheets/' + sheetKey + '?range=' + range);
    _cacheSave(sheetKey, data);
    return data;
  } catch (e) {
    console.warn('[NattosData] Fallback cache: ' + e.message);
    return _cacheRead(sheetKey);
  }
}

// ── READ BY SHEET ID ──────────────────────────────────────────────────────
async function readById(sheetId, range) {
  range = range || 'A1:Z500';
  if (!isOnline) return null;
  try {
    return await _get(SERVER + '/api/read/' + sheetId + '?range=' + range);
  } catch (e) {
    console.warn('[NattosData] readById error: ' + e.message);
    return null;
  }
}

// ── WRITE ─────────────────────────────────────────────────────────────────
async function write(sheetKey, range, values) {
  if (!isOnline) {
    console.warn('[NattosData] Offline — write cached only');
    return { ok: false, offline: true };
  }
  try {
    return await _post(SERVER + '/api/sheets/' + sheetKey + '/write', { range: range, values: values });
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

// ── APPEND ────────────────────────────────────────────────────────────────
async function append(sheetKey, range, values) {
  if (!isOnline) {
    _queueAppend(sheetKey, range, values);
    return { ok: false, queued: true };
  }
  try {
    var result = await _post(SERVER + '/api/sheets/' + sheetKey + '/append', { range: range, values: values });
    _flushQueue(sheetKey);
    return result;
  } catch (e) {
    _queueAppend(sheetKey, range, values);
    return { ok: false, error: e.message, queued: true };
  }
}

// ── READ BY TAB ───────────────────────────────────────────────────────────
async function readTab(tabName, range) {
  range = range || 'A1:Z500';
  var fullRange = tabName + '!' + range;
  if (!isOnline) return _cacheRead('tab_' + tabName);
  try {
    var data = await _get(SERVER + '/api/read/' + MASTER + '?range=' + encodeURIComponent(fullRange));
    _cacheSave('tab_' + tabName, data);
    return data;
  } catch (e) {
    return _cacheRead('tab_' + tabName);
  }
}

// ── APPEND TO TAB ─────────────────────────────────────────────────────────
async function appendTab(tabName, values) {
  if (!isOnline) {
    _queueAppend('tab_' + tabName, tabName + '!A:Z', values);
    return { ok: false, queued: true };
  }
  try {
    return await _post(SERVER + '/api/read/' + MASTER + '/append', { range: tabName + '!A:Z', values: values });
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

// ── REALTIME via SSE (replaces polling) ───────────────────────────────────
function onUpdate(sheetKey, callback, intervalMs) {
  intervalMs = intervalMs || 30000;
  if (!listeners[sheetKey]) listeners[sheetKey] = [];
  listeners[sheetKey].push(callback);

  // Try SSE via HeyNa first
  var h = _getHeyna();
  if (h) {
    h.on('sheets.' + sheetKey + '.updated', function(data) {
      listeners[sheetKey].forEach(function(cb) { cb(data); });
    });
  }

  // Fallback poll if no SSE
  if (!h) {
    var timer = setInterval(async function() {
      if (!isOnline) return;
      try {
        var data = await read(sheetKey);
        listeners[sheetKey].forEach(function(cb) { cb(data); });
      } catch(e) {}
    }, intervalMs);
    listeners[sheetKey]._timer = timer;
  }

  // Fire immediately
  read(sheetKey).then(function(data) {
    if (data && listeners[sheetKey]) {
      listeners[sheetKey].forEach(function(cb) { cb(data); });
    }
  });
}

function offUpdate(sheetKey) {
  if (listeners[sheetKey] && listeners[sheetKey]._timer) {
    clearInterval(listeners[sheetKey]._timer);
  }
  delete listeners[sheetKey];
}

// ── OFFLINE QUEUE (in-memory, replaces localStorage) ──────────────────────
function _queueAppend(sheetKey, range, values) {
  _queue.push({ sheetKey: sheetKey, range: range, values: values, ts: Date.now() });
}

async function _flushQueue(sheetKey) {
  var pending = _queue.filter(function(q) { return q.sheetKey === sheetKey; });
  if (!pending.length) return;
  for (var i = 0; i < pending.length; i++) {
    try {
      await append(pending[i].sheetKey, pending[i].range, pending[i].values);
    } catch(e) {}
  }
  // Remove flushed items
  for (var j = _queue.length - 1; j >= 0; j--) {
    if (_queue[j].sheetKey === sheetKey) _queue.splice(j, 1);
  }
}

// ── SUMMARY ───────────────────────────────────────────────────────────────
async function summary() {
  if (!isOnline) return null;
  try {
    return await _get(SERVER + '/api/summary');
  } catch { return null; }
}

// ── STATUS BAR INJECTION ──────────────────────────────────────────────────
function injectStatusBar() {
  if (document.getElementById('ndata-statusbar')) return;
  var bar = document.createElement('div');
  bar.id = 'ndata-statusbar';
  bar.style.cssText =
    'position:fixed;bottom:' + (document.getElementById('nfx-ticker') ? '30px' : '4px') + ';right:10px;' +
    'z-index:1000;display:flex;align-items:center;gap:6px;' +
    'background:rgba(8,8,20,.85);border:1px solid rgba(200,146,42,.15);' +
    'border-radius:20px;padding:3px 10px;font-family:"JetBrains Mono",monospace;' +
    'font-size:9px;letter-spacing:.1em;cursor:pointer;';
  bar.innerHTML = '<span id="ndata-status" style="color:#f0a030">🟡 Đang kết nối...</span>';
  bar.onclick = function() { window.open('http://localhost:3001/kenh/suc', '_blank'); };
  document.body.appendChild(bar);
}

// ── INIT ──────────────────────────────────────────────────────────────────
async function init() {
  // Inject status bar
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectStatusBar);
  } else {
    injectStatusBar();
  }

  // Init HeyNa
  _getHeyna();

  // Check server
  await checkServer();

  // Re-check mỗi 60s
  setInterval(checkServer, 60000);

  // Flush queued writes nếu online
  if (isOnline && _queue.length > 0) {
    var keys = [...new Set(_queue.map(function(q) { return q.sheetKey; }))];
    for (var i = 0; i < keys.length; i++) {
      await _flushQueue(keys[i]);
    }
  }

  console.log('[NattosData v2.0] ' + (isOnline ? '🟢 GSheets Live' : '🟡 Local Mode') + ' | HeyNa: ' + (_getHeyna() ? '✅' : '⏳'));
  return isOnline;
}

// Boot
if (typeof window !== 'undefined') {
  window.addEventListener('load', init);
}

return {
  init: init, read: read, readById: readById, readTab: readTab,
  appendTab: appendTab, write: write, append: append,
  onUpdate: onUpdate, offUpdate: offUpdate, summary: summary,
  checkServer: checkServer,
  get isOnline() { return isOnline; },
};

})();

if (typeof window !== 'undefined') window.NattosData = NattosData;
if (typeof module !== 'undefined') module.exports = NattosData;
