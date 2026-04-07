/**
 * NATT-OS Server v1.0
 * Pure Event-Driven Runtime — Nauion Language
 */
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(cors());
// ── Vision serve ──
app.use('/vision', require('express').static(require('path').join(__dirname, 'nattos-ui/vision')));
app.use('/ui', require('express').static(require('path').join(__dirname, 'nattos-ui')));


app.use(express.json());
app.use(express.static(path.join(__dirname, '../src/ui-app')));

// ── Nauion language aliases ──
const hey = (p, h) => app.get(p, h);
const yeh = (p, h) => app.post(p, h);

// ── EventBus ──
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

// ── STATE + AUDIT ──
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

// ── Nahere — impedanceZ ──
let _Z = 1.0;
let _eventCount = 0;
let _errorCount = 0;
EventBus.on('audit.record', (env) => {
  _eventCount++;
  if (env.payload?.type === 'anomaly.detected') _errorCount++;
  _Z = Math.min(5.0, Math.max(0.1, 1.0 + (_eventCount > 0 ? _errorCount/_eventCount : 0) * 2));
});

// ── Mạch HeyNa — SSE stream ──
const _machClients = new Set();

hey('/mach/heyna', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();
  res.write('data: ' + JSON.stringify({ event: 'Nahere', payload: { state: 'alive', impedanceZ: _Z }, ts: Date.now() }) + '\n\n');
  _machClients.add(res);
  req.on('close', () => _machClients.delete(res));
});

// Phát mọi event qua Mạch HeyNa
EventBus.on('*', (env) => {
  if (_machClients.size === 0) return;
  const data = 'data: ' + JSON.stringify({ event: env.event, payload: env.payload, ts: env.ts }) + '\n\n';
  for (const client of _machClients) {
    try { client.write(data); } catch { _machClients.delete(client); }
  }
});

// ── Kênh (Routes) ──
hey('/kenh/nauion', (req, res) => {
  res.json({ state: 'Nahere', impedanceZ: _Z, event_count: _eventCount, ts: Date.now() });
});

hey('/kenh/suc', (req, res) => {
  res.json({ status: 'ok', server: 'NATT-OS Server v1.0', ts: new Date().toISOString() });
});

yeh('/phat/nauion', (req, res) => {
  const { type, payload, cell } = req.body;
  if (!type) return res.status(400).json({ error: 'type required' });
  EventBus.emit(type, { ...payload, originCell: cell || 'ui' });
  res.json({ ok: true, type, ts: Date.now() });
});

hey('/kenh/state/:cell', (req, res) => {
  res.json({ cell: req.params.cell, state: STATE[req.params.cell] || {}, ts: Date.now() });
});

hey('/kenh/state', (req, res) => {
  res.json({ state: STATE, cells: Object.keys(STATE).length, ts: Date.now() });
});

hey('/kenh/vet', (req, res) => {
  const limit = parseInt(req.query.limit || '50');
  res.json({ events: AUDIT.slice(-limit), total: AUDIT.length });
});

// ── START ──
app.listen(PORT, () => {
  console.log(`\n[NATT-OS Server v1.0] http://localhost:${PORT}`);
  console.log(`  Mạch HeyNa: /mach/heyna (SSE)`);
  console.log(`  Kênh: /kenh/nauion | /kenh/suc | /kenh/vet`);
  console.log(`  Phát: /phat/nauion\n`);
});

module.exports = { EventBus };

// ── ENGINE WIRING ──
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
