/**
 * NATT-OS Server v1.0
 * Pure Event-Driven Runtime
 */
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../src/ui-app')));

// ── EventBus (same contract as NATT-OS core) ──────────────────────────────
const subs = {};
const EventBus = {
  on: (event, handler) => {
    if (!subs[event]) subs[event] = [];
    subs[event].push(handler);
  },
  emit: (event, payload) => {
    const env = { event, payload, ts: Date.now() };
    (subs[event] || []).forEach(h => { try { h(env); } catch {} });
    (subs['*'] || []).forEach(h => { try { h(env); } catch {} });
  }
};

// ── STATE + AUDIT ─────────────────────────────────────────────────────────
const STATE = {};
const AUDIT = [];

EventBus.on('*', (env) => {
  AUDIT.push({ event: env.event, payload: env.payload, ts: env.ts });
  if (AUDIT.length > 1000) AUDIT.shift();
});

EventBus.on('cell.metric', (env) => {
  const { cell, metric, value } = env.payload || {};
  if (!cell) return;
  if (!STATE[cell]) STATE[cell] = {};
  STATE[cell][metric] = { value, ts: Date.now() };
});

// ── ROUTES ────────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', server: 'NATT-OS Server v1.0', ts: new Date().toISOString() });
});

app.post('/api/events/emit', (req, res) => {
  const { type, payload, cell } = req.body;
  if (!type) return res.status(400).json({ error: 'type required' });
  EventBus.emit(type, { ...payload, originCell: cell || 'ui' });
  res.json({ ok: true, type, ts: Date.now() });
});

app.get('/api/state/:cell', (req, res) => {
  res.json({ cell: req.params.cell, state: STATE[req.params.cell] || {}, ts: Date.now() });
});

app.get('/api/state', (req, res) => {
  res.json({ state: STATE, cells: Object.keys(STATE).length, ts: Date.now() });
});

app.get('/api/audit', (req, res) => {
  const limit = parseInt(req.query.limit || '50');
  res.json({ events: AUDIT.slice(-limit), total: AUDIT.length });
});

// ── START ─────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n[NATT-OS Server v1.0] http://localhost:${PORT}`);
  console.log(`  POST /api/events/emit`);
  console.log(`  GET  /api/state/:cell`);
  console.log(`  GET  /api/audit\n`);
});

module.exports = { EventBus };
