/**
 * domain-flow.wiring.ts — Cell-to-Cell event bridges
 * Registry chỉ load file này — không chứa business logic
 */

import { EventBus } from '@/core/events/event-bus';

/** Generic event envelope từ EventBus */
type EventEnv = {
  payload?: Record<string, unknown>;
  type?: string;
  ts?: number;
  [key: string]: unknown;
};

EventBus.on('ProductionCompleted' as string, (env: EventEnv) => {
  const p = env?.payload ?? env;
  EventBus.emit('GoodsReceived', { sku: p?.sku ?? 'UNKNOWN', qty: p?.qty ?? 1, source: 'production-cell', ts: Date.now() }, 'ProductionCompleted');
});

EventBus.on('wip:stone' as string, (env: EventEnv) => {
  EventBus.emit('cell.metric', { cell: 'stone-cell', metric: 'wip.stone', value: 1, ts: Date.now() });
});

EventBus.on('StockReserved' as string, (env: EventEnv) => {
  const p = env?.payload ?? env;
  EventBus.emit('cell.metric', { cell: 'inventory-cell', metric: 'stock.reserved', value: p?.qty ?? 1, ts: Date.now() });
});

EventBus.on('StockReplenished' as string, (env: EventEnv) => {
  const p = env?.payload ?? env;
  EventBus.emit('inventory.in', { sku: p?.sku, qty: p?.qty, ts: Date.now() }, 'StockReplenished');
});

EventBus.on('GoodsReceived' as string, (env: EventEnv) => {
  const p = env?.payload ?? env;
  EventBus.emit('inventory.in', { sku: p?.sku, qty: p?.qty, ts: Date.now() }, 'GoodsReceived');
});

EventBus.on('MaterialLossReported' as string, (env: EventEnv) => {
  EventBus.emit('cell.metric', { cell: 'compliance-cell', metric: 'material.loss', value: 1, ts: Date.now() });
});

EventBus.on('SkuModelCreated' as string, (env: EventEnv) => {
  EventBus.emit('cell.metric', { cell: 'design-3d-cell', metric: 'sku.created', value: 1, ts: Date.now() });
});

['BomCreated', 'BomValidated', 'BomRejected'].forEach((ev) => {
  EventBus.on(ev as string, () => {
    EventBus.emit('cell.metric', { cell: 'bom3dprd-cell', metric: ev, value: 1, ts: Date.now() });
  });
});

EventBus.on('constitutional.violation' as string, (env: EventEnv) => {
  const p = env?.payload ?? env;
  EventBus.emit('audit.record', {
    action: 'constitutional.violation', actor: { id: 'system', type: 'system' },
    resource: 'constitution', result: 'fail', timestamp: Date.now(),
    trace: { causationId: p?.trigger, correlationId: p?.source_cell },
  }, 'constitutional.violation');
});

EventBus.on('FINANCE_DEPRECIATION_REQUEST' as string, (env: EventEnv) => {
  EventBus.emit('cell.metric', { cell: 'finance-cell', metric: 'depreciation.requested', value: 1, ts: Date.now() });
});

// ── SALES → PRODUCTION BRIDGE ─────────────────────────────────────────────
EventBus.on('sales.confirm' as string, (env: EventEnv) => {
  const p = env?.payload ?? env;
  EventBus.emit('ProductionSpecReady', {
    orderId: p?.orderId, items: p?.items ?? [], source: 'sales-cell', ts: Date.now(),
  }, 'sales.confirm');
});

// ── wip:phoi → finishing-cell trigger ────────────────────────────────────
EventBus.on('wip:phoi' as string, (env: EventEnv) => {
  const p = env?.payload ?? env;
  EventBus.emit('cell.metric', {
    cell: 'finishing-cell', metric: 'wip.phoi.received', value: 1,
    orderId: p?.orderId, ts: Date.now(),
  }, 'wip:phoi');
});

// ── ViolationDetected → audit + quantum ──────────────────────────────────
EventBus.on('ViolationDetected' as string, (env: EventEnv) => {
  const p = env?.payload ?? env;
  EventBus.emit('constitutional.violation', {
    trigger: p?.rule ?? 'UNKNOWN', level: 'warnING',
    source_cell: p?.cell ?? 'unknown', reason: p?.reason ?? '',
    timestamp: new Date().toISOString(),
  }, 'ViolationDetected');
});

// ── AuditLogged → audit trail ─────────────────────────────────────────────
EventBus.on('AuditLogged' as string, (env: EventEnv) => {
  const p = env?.payload ?? env;
  EventBus.emit('audit.record', {
    action: p?.event ?? 'audit.logged',
    actor: { id: p?.workerId ?? 'system', type: 'system' },
    resource: p?.orderId ?? 'unknown',
    result: 'success', timestamp: Date.now(),
    trace: { causationId: 'AuditLogged', correlationId: p?.orderId },
  }, 'AuditLogged');
});

// ── ViolationDetected → audit + quantum ──────────────────────────────────
EventBus.on('ViolationDetected' as string, (env: EventEnv) => {
  const p = env?.payload ?? env;
  EventBus.emit('constitutional.violation', {
    trigger: p?.rule ?? 'UNKNOWN', level: 'warnING',
    source_cell: p?.cell ?? 'unknown', reason: p?.reason ?? '',
    timestamp: new Date().toISOString(),
  }, 'ViolationDetected');
});

// ── AuditLogged → audit trail ─────────────────────────────────────────────
EventBus.on('AuditLogged' as string, (env: EventEnv) => {
  const p = env?.payload ?? env;
  EventBus.emit('audit.record', {
    action: p?.event ?? 'audit.logged',
    actor: { id: p?.workerId ?? 'system', type: 'system' },
    resource: p?.orderId ?? 'unknown',
    result: 'success', timestamp: Date.now(),
    trace: { causationId: 'AuditLogged', correlationId: p?.orderId },
  }, 'AuditLogged');
});

// ── anomaly.detected → audit trail ───────────────────────────────────────
EventBus.on('anomaly.detected' as string, (env: EventEnv) => {
  const p = env?.payload ?? env;
  EventBus.emit('audit.record', {
    action:   'anomaly.detected',
    type:     p?.type ?? 'unknown',
    actor:    { id: 'anomaly-flow-engine', type: 'system' },
    resource: p?.orderId ?? 'unknown',
    result:   'fail',
    timestamp: Date.now(),
    trace: { causationId: p?.from, correlationId: p?.orderId },
  }, 'anomaly.detected');
  console.warn('[ANOMALY]', p?.type, '|', p?.from, '→', p?.expected, '| orderId:', p?.orderId);
});
