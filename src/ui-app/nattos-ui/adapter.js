// core/adapter.js — NATT-OS Data Adapter
// Rule: không fetch < 500ms, không spam

const BASE = 'http://localhost:3001';

export async function fetchAudit() {
  const r = await fetch(`${BASE}/api/audit`);
  if (!r.ok) throw new Error(`audit ${r.status}`);
  return await r.json();
}

export async function fetchIntelligence() {
  const r = await fetch(`${BASE}/api/intelligence`);
  if (!r.ok) throw new Error(`intel ${r.status}`);
  return await r.json();
}

export async function fetchHealth() {
  const r = await fetch(`${BASE}/api/health`);
  if (!r.ok) throw new Error(`health ${r.status}`);
  return await r.json();
}
