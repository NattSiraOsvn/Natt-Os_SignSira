// adapter.js — NATT-OS · Kênh kết nối
// Nauion Language: hey = GET, yeh = POST
// Rule: không fetch < 500ms, không spam

const BASE = 'http://localhost:3001';

// ── Kênh Audit ───────────────────────────────────────────
export async function fetchAudit() {
  const r = await fetch(`${BASE}/api/audit`);
  if (!r.ok) throw new Error(`audit ${r.status}`);
  return await r.json();
}

// ── Kênh Intelligence (L4 pattern) ───────────────────────
export async function fetchIntelligence() {
  const r = await fetch(`${BASE}/api/intelligence`);
  if (!r.ok) throw new Error(`intel ${r.status}`);
  return await r.json();
}

// ── Kênh Sức Khoẻ ────────────────────────────────────────
export async function fetchHealth() {
  const r = await fetch(`${BASE}/api/health`);
  if (!r.ok) throw new Error(`health ${r.status}`);
  return await r.json();
}

// ── Kênh Trạng Thái Cell ─────────────────────────────────
export async function fetchState(cell) {
  const url = cell ? `${BASE}/api/state/${cell}` : `${BASE}/api/state`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`state ${r.status}`);
  return await r.json();
}

// ── Kênh Nauion ───────────────────────────────────────────
export async function fetchNauion() {
  const r = await fetch(`${BASE}/api/nauion`);
  if (!r.ok) throw new Error(`nauion ${r.status}`);
  return await r.json();
}

// ── Phát Nauion vào hệ ───────────────────────────────────
export async function phatNauion(type, payload, cell) {
  const r = await fetch(`${BASE}/api/events/emit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, payload, cell: cell || 'ui' }),
  });
  if (!r.ok) throw new Error(`emit ${r.status}`);
  return await r.json();
}

// ── Mạch HeyNa — SSE stream (thay poll) ──────────────────
export function machHeyna(onEvent, onError) {
  const mach = new EventSource(`${BASE}/mach/heyna`);
  
  mach.onopen = () => console.log('[Mạch HeyNa] Nahere — mạch sống');
  
  mach.onmessage = (e) => {
    try {
      const data = JSON.parse(e.data);
      onEvent(data);
    } catch {}
  };
  
  mach.onerror = () => {
    if (onError) onError();
    console.warn('[Mạch HeyNa] Mạch đứt — Whao fallback');
  };
  
  // Trả về hàm đóng mạch
  return () => mach.close();
}
