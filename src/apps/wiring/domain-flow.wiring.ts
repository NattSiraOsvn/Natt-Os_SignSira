// @ts-nocheck
/**
 * domain-flow.wiring.ts — Cell-to-Cell event bridges
 * Registry chỉ load file này — không chứa business logic
 */

import { EventBus } from '@/core/events/event-bus';

EventBus.on('ProductionCompleted' as any, (env: any) => {
  const p = env?.payload ?? env;
  EventBus.emit('GoodsReceived', { sku: p?.sku ?? 'UNKNOWN', qty: p?.qty ?? 1, source: 'production-cell', ts: Date.now() }, 'ProductionCompleted');
});

EventBus.on('wip:stone' as any, (env: any) => {
  EventBus.emit('cell.metric', { cell: 'stone-cell', metric: 'wip.stone', value: 1, ts: Date.now() });
});

EventBus.on('StockReserved' as any, (env: any) => {
  const p = env?.payload ?? env;
  EventBus.emit('cell.metric', { cell: 'inventory-cell', metric: 'stock.reserved', value: p?.qty ?? 1, ts: Date.now() });
});

EventBus.on('StockReplenished' as any, (env: any) => {
  const p = env?.payload ?? env;
  EventBus.emit('inventory.in', { sku: p?.sku, qty: p?.qty, ts: Date.now() }, 'StockReplenished');
});

EventBus.on('GoodsReceived' as any, (env: any) => {
  const p = env?.payload ?? env;
  EventBus.emit('inventory.in', { sku: p?.sku, qty: p?.qty, ts: Date.now() }, 'GoodsReceived');
});

EventBus.on('MaterialLossReported' as any, (env: any) => {
  EventBus.emit('cell.metric', { cell: 'compliance-cell', metric: 'material.loss', value: 1, ts: Date.now() });
});

EventBus.on('SkuModelCreated' as any, (env: any) => {
  EventBus.emit('cell.metric', { cell: 'design-3d-cell', metric: 'sku.created', value: 1, ts: Date.now() });
});

['BomCreated', 'BomValidated', 'BomRejected'].forEach((ev) => {
  EventBus.on(ev as any, () => {
    EventBus.emit('cell.metric', { cell: 'bom3dprd-cell', metric: ev, value: 1, ts: Date.now() });
  });
});

EventBus.on('constitutional.violation' as any, (env: any) => {
  const p = env?.payload ?? env;
  EventBus.emit('audit.record', {
    action: 'constitutional.violation', actor: { id: 'system', type: 'system' },
    resource: 'constitution', result: 'fail', timestamp: Date.now(),
    trace: { causationId: p?.trigger, correlationId: p?.source_cell },
  }, 'constitutional.violation');
});

EventBus.on('FINANCE_DEPRECIATION_REQUEST' as any, (env: any) => {
  EventBus.emit('cell.metric', { cell: 'finance-cell', metric: 'depreciation.requested', value: 1, ts: Date.now() });
});

// ── SALES → PRODUCTION BRIDGE ─────────────────────────────────────────────
EventBus.on('sales.confirm' as any, (env: any) => {
  const p = env?.payload ?? env;
  EventBus.emit('ProductionSpecReady', {
    orderId: p?.orderId, items: p?.items ?? [], source: 'sales-cell', ts: Date.now(),
  }, 'sales.confirm');
});
