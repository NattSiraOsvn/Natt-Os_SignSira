// @ts-nocheck
/**
 * NATT-OS Server v1.0
 * Pure Event-Driven — no GSheets, no REST CRUD
 * EventBus = NATT-OS core EventBus
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const { EventBus } = require('../core/events/event-bus');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../../src/ui-app')));

// ── STATE STORE ───────────────────────────────────────────────────────────
const STATE = {};
const AUDIT = [];

// ── AUDIT TRAIL ───────────────────────────────────────────────────────────
EventBus.on('*', (env) => {
  AUDIT.push({ event: env?.event?.type || env?.type || '*', payload: env?.payload, ts: Date.now() });
  if (AUDIT.length > 1000) AUDIT.shift();
});

// ── STATE UPDATER ─────────────────────────────────────────────────────────
EventBus.on('cell.metric', (env) => {
  const { cell, metric, value } = env?.payload || {};
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
  try {
    EventBus.emit(type, { type, payload, originCell: cell || 'ui', ts: Date.now() });
    res.json({ ok: true, type, ts: Date.now() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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
  console.log(`[EventBus] NATT-OS core EventBus wired`);
  console.log(`  GET  /api/health`);
  console.log(`  POST /api/events/emit`);
  console.log(`  GET  /api/state/:cell`);
  console.log(`  GET  /api/audit\n`);
});
