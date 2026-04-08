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

// ── Giá Vàng Store ───────────────────────────────────────────
const _giaVang = {
  sjc_buy:  78500000,
  sjc_sell: 80500000,
  gold9999: 64200000,
  avgPuritySX: 75.4417,
  get gold18k() { return Math.round(this.gold9999 * (this.avgPuritySX / 100)); },
  updatedAt: Date.now()
};

hey('/kenh/gia-vang', (req, res) => {
  res.json({ sjc_buy: _giaVang.sjc_buy, sjc_sell: _giaVang.sjc_sell,
    gold9999: _giaVang.gold9999, gold18k: _giaVang.gold18k,
    avgPuritySX: _giaVang.avgPuritySX, updatedAt: _giaVang.updatedAt, ts: Date.now() });
});

yeh('/phat/gia-vang', (req, res) => {
  const { sjc_buy, sjc_sell, gold9999 } = req.body;
  if (sjc_buy)  _giaVang.sjc_buy  = sjc_buy;
  if (sjc_sell) _giaVang.sjc_sell = sjc_sell;
  if (gold9999) _giaVang.gold9999 = gold9999;
  _giaVang.updatedAt = Date.now();
  EventBus.emit('gia-vang.updated', { sjc_buy: _giaVang.sjc_buy, sjc_sell: _giaVang.sjc_sell,
    gold9999: _giaVang.gold9999, gold18k: _giaVang.gold18k, ts: Date.now() });
  res.json({ ok: true, gold18k: _giaVang.gold18k });
});

// ── Approval Store ──────────────────────────────────────────
const _approvalTickets = [
  { id: 'TICKET-001', request: { recordType: 'TRANSACTION', changeType: 'UPDATE',
    proposedData: { amount: 150000000, note: 'Điều chỉnh giá vốn lô kim cương' },
    priority: 'HIGH', reason: 'Sai lệch tỷ giá nhập khẩu', requestedBy: 'USR-ACC-01' },
    status: 'PENDING', requestedAt: Date.now() - 3600000, workflowStep: 1, totalSteps: 2 },
  { id: 'TICKET-002', request: { recordType: 'DICTIONARY', changeType: 'CREATE',
    proposedData: { term: 'SKU_JADE_2026', desc: 'Mã Ngọc Bích Mới' },
    priority: 'LOW', reason: 'Thêm mã mới cho BST Mùa Xuân', requestedBy: 'USR-PROD-05' },
    status: 'APPROVED', requestedAt: Date.now() - 86400000,
    approvedBy: 'MASTER_NATT', approvedAt: Date.now() - 43200000,
    workflowStep: 1, totalSteps: 1 }
];

function getApprovalStats() {
  const todayStart = new Date().setHours(0,0,0,0);
  return {
    pending: _approvalTickets.filter(t => t.status === 'PENDING').length,
    approvedToday: _approvalTickets.filter(t => t.status === 'APPROVED' && (t.approvedAt||0) > todayStart).length,
    rejectedToday: _approvalTickets.filter(t => t.status === 'REJECTED' && (t.approvedAt||0) > todayStart).length,
    avgResponseTime: '1.5 giờ'
  };
}

hey('/kenh/approval', (req, res) => {
  const { status } = req.query;
  const tickets = status && status !== 'ALL'
    ? _approvalTickets.filter(t => t.status === status) : _approvalTickets;
  res.json({ tickets, stats: getApprovalStats(), ts: Date.now() });
});

yeh('/phat/approval/approve', (req, res) => {
  const { ticketId, approverId } = req.body;
  const ticket = _approvalTickets.find(t => t.id === ticketId);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
  ticket.status = 'APPROVED'; ticket.approvedBy = approverId || 'MASTER_NATT'; ticket.approvedAt = Date.now();
  EventBus.emit('approval.updated', { ticketId, status: 'APPROVED', ts: Date.now() });
  EventBus.emit('audit.record', { type: 'approval.approved', payload: { ticketId, approverId } });
  res.json({ ok: true, ticket });
});

yeh('/phat/approval/reject', (req, res) => {
  const { ticketId, approverId, reason } = req.body;
  const ticket = _approvalTickets.find(t => t.id === ticketId);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
  ticket.status = 'REJECTED'; ticket.rejectionReason = reason || '';
  ticket.approvedBy = approverId || 'MASTER_NATT'; ticket.approvedAt = Date.now();
  EventBus.emit('approval.updated', { ticketId, status: 'REJECTED', reason, ts: Date.now() });
  EventBus.emit('audit.record', { type: 'approval.rejected', payload: { ticketId, approverId, reason } });
  res.json({ ok: true, ticket });
});

// ── Production Store ─────────────────────────────────────────
const _productionStages = [
  { stage: 'DESIGNING',     count: 8,  color: 'blue' },
  { stage: 'CASTING',       count: 12, color: 'orange' },
  { stage: 'COLD_WORK',     count: 10, color: 'yellow' },
  { stage: 'STONE_SETTING', count: 6,  color: 'purple' },
  { stage: 'FINISHING',     count: 5,  color: 'pink' },
  { stage: 'QC_PENDING',    count: 3,  color: 'teal' },
  { stage: 'COMPLETED',     count: 15, color: 'green' },
];

const _productionMetrics = {
  oee: 86.5, onTime: 94.2,
  avgLoss: 24.5583,
  avgPuritySX: 75.4417,
  avgPuritySC: 66.96,
  avgPurityAll: 72.9471,
  dailyOutput: 12,
  repairCount: 5,
  workers: 12,
  labelDist: {"18k": 15, "10k": 1, "14k": 1},
  dataSource: 'april-2025.json'
};

EventBus.on('casting.complete',   () => { _productionStages[1].count++; _productionStages[2].count++; });
EventBus.on('finishing.complete', () => { _productionStages[4].count = Math.max(0,_productionStages[4].count-1); _productionStages[5].count++; });
EventBus.on('polishing.complete', () => { _productionStages[5].count = Math.max(0,_productionStages[5].count-1); _productionStages[6].count++; _productionMetrics.dailyOutput++; });

hey('/kenh/production', (req, res) => {
  res.json({ stages: _productionStages, metrics: _productionMetrics, ts: Date.now() });
});

// ── SiraSign Verify — /kenh/sirasign/verify ─────────────────
yeh('/kenh/sirasign/verify', (req, res) => {
  const { fsp_hash, lsp_hash, nonce, timestamp } = req.body ?? {};
  if (!fsp_hash || !lsp_hash || !nonce || !timestamp)
    return res.status(400).json({ valid: false, reason: 'missing_fields' });
  const age = Math.abs(Date.now() - Number(timestamp));
  if (age > 5 * 60 * 1000)
    return res.status(401).json({ valid: false, reason: 'timestamp_expired' });
  EventBus.emit('audit.record', {
    type: 'sirasign.verify',
    payload: { nonce, timestamp, result: 'verified' },
    causationId: nonce, actor: 'sirasign-endpoint',
  });
  res.json({ valid: true, level: 'VERIFIED', ts: Date.now() });
});

// ── Sensor Pulse Bridge — iseu.sensor.pulse → SmartLink ──────
// SPEC Phase 5 Step 4: physical sensor → SmartLink feedback
EventBus.on('iseu.sensor.pulse', (payload) => {
  const { deviceId, intensity, sensorType, source, ts } = payload ?? {};
  if (!deviceId || intensity === undefined) return;

  // Emit audit trail
  EventBus.emit('audit.record', {
    type: 'sensor.pulse.received',
    payload: { deviceId, intensity, sensorType, source },
    actor: 'resonance-protocol',
    ts: ts ?? Date.now(),
  });

  // Update impedanceZ qua nauion.state
  // ΔZ = -intensity * 0.1 (pulse tích cực → giảm Z về baseline)
  EventBus.emit('nauion.state', {
    state: intensity > 0.6 ? 'lệch' : 'nauion',
    from: 'sensor-bridge',
    deviceId,
    sensorType,
    intensity,
    ts: ts ?? Date.now(),
  });
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
  const { execSync } = require('child_process');
  let commits = '—', hash = '—';
  try {
    commits = execSync('git log --oneline | wc -l', { cwd: __dirname + '/..' }).toString().trim().replace(/\s/g,'');
    hash = execSync('git log --oneline -1', { cwd: __dirname + '/..' }).toString().trim().split(' ')[0];
  } catch {}
  res.json({ status: 'ok', server: 'NATT-OS Server v1.0', commits, hash, ts: new Date().toISOString() });
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
try { require('tsx/cjs'); } catch {}
try { require('./engine-registry').init(EventBus); } catch (e) { console.warn('[EngineRegistry] Skip:', e.message); }



app.use('/nauion/icon', require('express').static(require('path').join(__dirname, 'nauion/icon')));
app.use("/apps/tam-luxury", express.static(path.join(__dirname, "apps/tam-luxury")));
