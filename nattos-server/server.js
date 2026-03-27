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

// ── ENGINE WIRING — Event Chain ───────────────────────────────────────────
// ORDER → CASH flow
EventBus.on('order.created', (env) => {
  EventBus.emit('production.planned', { ...env.payload, ts: Date.now() });
  EventBus.emit('customer.notified', { ...env.payload, ts: Date.now() });
  EventBus.emit('audit.record', { event: 'order.created', ...env.payload });
});

EventBus.on('production.planned', (env) => {
  EventBus.emit('casting.complete', { ...env.payload, ts: Date.now() });
  EventBus.emit('cell.metric', { cell: 'production-cell', metric: 'production.started', value: 1 });
});

EventBus.on('casting.complete', (env) => {
  EventBus.emit('stone.complete', { ...env.payload, ts: Date.now() });
  EventBus.emit('dust.recovered', { ...env.payload, ts: Date.now() });
  EventBus.emit('cell.metric', { cell: 'casting-cell', metric: 'casting.done', value: 1 });
});

EventBus.on('stone.complete', (env) => {
  EventBus.emit('finishing.complete', { ...env.payload, ts: Date.now() });
  EventBus.emit('cell.metric', { cell: 'stone-cell', metric: 'stone.done', value: 1 });
});

EventBus.on('finishing.complete', (env) => {
  EventBus.emit('inventory.in', { ...env.payload, ts: Date.now() });
  EventBus.emit('cell.metric', { cell: 'finishing-cell', metric: 'finishing.done', value: 1 });
});

EventBus.on('inventory.in', (env) => {
  EventBus.emit('sales.confirm', { ...env.payload, ts: Date.now() });
  EventBus.emit('cell.metric', { cell: 'inventory-cell', metric: 'inventory.updated', value: 1 });
});

EventBus.on('sales.confirm', (env) => {
  EventBus.emit('payment.received', { ...env.payload, ts: Date.now() });
  EventBus.emit('audit.record', { event: 'sales.confirm', ...env.payload });
  EventBus.emit('cell.metric', { cell: 'sales-cell', metric: 'sales.confirmed', value: 1 });
});

EventBus.on('payment.received', (env) => {
  EventBus.emit('audit.record', { event: 'payment.received', ...env.payload });
  EventBus.emit('cell.metric', { cell: 'finance-cell', metric: 'payment.processed', value: 1 });
  EventBus.emit('cell.metric', { cell: 'payment-cell', metric: 'payment.done', value: 1 });
});

EventBus.on('audit.record', (env) => {
  EventBus.emit('cell.metric', { cell: 'audit-cell', metric: 'audit.recorded', value: 1 });
});

EventBus.on('buyback.requested', (env) => {
  EventBus.emit('audit.record', { event: 'buyback.requested', ...env.payload });
  EventBus.emit('cell.metric', { cell: 'buyback-cell', metric: 'buyback.started', value: 1 });
});

EventBus.on('customs.declaration', (env) => {
  EventBus.emit('audit.record', { event: 'customs.declaration', ...env.payload });
  EventBus.emit('cell.metric', { cell: 'customs-cell', metric: 'customs.processed', value: 1 });
});

EventBus.on('system.audit', (env) => {
  EventBus.emit('cell.metric', { cell: 'audit-cell', metric: 'system.audit.run', value: 1 });
  EventBus.emit('cell.metric', { cell: 'monitor-cell', metric: 'system.checked', value: 1 });
});

console.log('[EventBus] Engine chains wired: ORDER→CASH + PRODUCTION flow');
