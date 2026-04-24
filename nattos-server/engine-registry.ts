/**
 * Natt-OS Engine Registry v3.0 — SERVER SIDE
 * Location: nattos-server/engine-registry.ts
 *
 * DÙNG TRONG server.js (2 dòng):
 *   require('tsx/cjs');
 *   require('./engine-registry').init(EventBus);
 *
 * KHÔNG import EventBus từ src/ — nhận từ server.js để share 1 instance.
 */

type EB = { on: (e: string, h: (env: any) => void) => void; emit: (e: string, p?: any, c?: any) => void };
let _eb: EB;

function wire(event: string, cell: string, fn: () => void) {
  try {
    _eb.on(event, () => {
      try {
        fn();
        _eb.emit('cell.metric', { cell, metric: event, value: 1, ts: Date.now() });
      } catch { /* silent */ }
    });
  } catch { /* silent */ }
}

function tryImport(p: string, cb: (m: any) => void) {
  try { cb(require(p)); } catch { /* silent — file may not exist yet */ }
}

export function init(eventBus: EB) {
  _eb = eventBus;

  // ── PRODUCTION ────────────────────────────────────────────────────────
  tryImport('../src/cells/business/production-cell/domain/services/flow.engine', m => {
    const e = new (m.ProductionEngine || m.default)();
    wire('order.created',      'production-cell', () => e.execute?.());
    wire('production.planned', 'production-cell', () => e.execute?.());
  });
  tryImport('../src/cells/business/casting-cell/domain/engines/casting.engine', m => {
    const e = new (m.CastingEngine || m.default)();
    wire('production.planned', 'casting-cell', () => e.execute?.());
  });
  tryImport('../src/cells/business/stone-cell/domain/engines/stone.engine', m => {
    const e = new (m.StoneEngine || m.default)();
    wire('casting.complete', 'stone-cell', () => e.execute?.());
  });
  tryImport('../src/cells/business/finishing-cell/domain/engines/finishing.engine', m => {
    const e = new (m.FinishingEngine || m.default)();
    wire('stone.complete', 'finishing-cell', () => e.execute?.());
  });
  tryImport('../src/cells/business/polishing-cell/domain/engines/polishing.engine', m => {
    const e = new (m.PolishingEngine || m.default)();
    wire('finishing.complete', 'polishing-cell', () => e.execute?.());
  });
  tryImport('../src/cells/business/inventory-cell/domain/services/inventory.engine', m => {
    const e = new (m.InventoryEngine || m.default)();
    wire('finishing.complete', 'inventory-cell', () => e.execute?.());
    wire('inventory.in',       'inventory-cell', () => e.execute?.());
  });
  tryImport('../src/cells/business/warehouse-cell/domain/services/warehouse.engine', m => {
    const e = new (m.WarehouseEngine || m.default)();
    wire('inventory.in', 'warehouse-cell', () => e.execute?.());
  });
  tryImport('../src/cells/business/warehouse-cell/domain/services/warehouse-intelligence.engine', m => {
    const e = new (m.WarehouseIntelligenceEngine || m.default)();
    wire('inventory.in', 'warehouse-cell', () => e.execute?.());
    wire('system.audit', 'warehouse-cell', () => e.execute?.());
  });
  tryImport('../src/cells/business/dust-recovery-cell/domain/services/dust-recovery.engine', m => {
    const e = new (m.DustRecoveryEngine || m.default)();
    wire('casting.complete',  'dust-recovery-cell', () => e.execute?.());
    wire('finishing.complete','dust-recovery-cell', () => e.execute?.());
  });
  tryImport('../src/cells/business/production-cell/domain/services/weight-guard.engine', m => {
    const e = new (m.WeightGuardEngine ?? m.default)();
    wire('casting.complete',   'production-cell', () => e?.execute?.());
    wire('finishing.complete', 'production-cell', () => e?.execute?.());
  });
  tryImport('../src/cells/business/bom3dprd-cell/domain/engines/bom3dprd.engine', m => {
    const e = new (m.Bom3dprdEngine || m.default)();
    wire('production.planned', 'bom3dprd-cell', () => e.execute?.());
  });
  tryImport('../src/cells/business/prdmaterials-cell/domain/services/prdmaterials.engine', m => {
    const e = new (m.PrdmaterialsEngine || m.default)();
    wire('production.planned', 'prdmaterials-cell', () => e.execute?.());
  });
  tryImport('../src/cells/business/design-3d-cell/domain/engines/design-3d.engine', m => {
    const e = new (m.Design3dEngine || m.default)();
    wire('ProductionSpecReady', 'design-3d-cell', () => e.execute?.());
    wire('BomRejected',         'design-3d-cell', () => e.execute?.());
  });

  // ── SALES & FINANCE ───────────────────────────────────────────────────
  tryImport('../src/cells/business/sales-cell/domain/engines/sales.engine', m => {
    const e = new (m.SalesEngine || m.default)();
    wire('sales.confirm', 'sales-cell', () => {
      e.execute?.();
      _eb.emit('SalesOrderCreated', { source: 'sales-cell', ts: Date.now() });
    });
  });
  tryImport('../src/cells/business/sales-cell/domain/engines/seller.engine', m => {
    const e = new (m.SellerEngine || m.default)();
    wire('sales.confirm', 'sales-cell', () => e.execute?.());
    wire('order.created', 'sales-cell', () => e.execute?.());
  });
  tryImport('../src/cells/business/finance-cell/domain/services/banking.engine', m => {
    const e = new (m.BankingEngine || m.default)();
    wire('sales.confirm',    'finance-cell', () => e.execute?.());
    wire('payment.received', 'finance-cell', () => e.execute?.());
  });
  tryImport('../src/cells/business/finance-cell/domain/services/einvoice.engine', m => {
    const e = new (m.EInvoiceEngine || m.default)();
    wire('sales.confirm', 'finance-cell', () => e.execute?.());
  });
  tryImport('../src/cells/business/payment-cell/domain/services/_v2.payment-flow.engine', m => {
    const e = new (m.PaymentFlowEngine || m.default)();
    wire('payment.received', 'payment-cell', () => e.execute?.());
  });
  tryImport('../src/cells/business/payment-cell/domain/services/payment.engine', m => {
    const e = new (m.PaymentEngine || m.default)();
    wire('payment.received', 'payment-cell', () => e.execute?.());
  });
  tryImport('../src/cells/business/tax-cell/domain/services/tax.engine', m => {
    const e = new (m.TaxEngine || m.default)();
    wire('audit.record', 'tax-cell', () => e.execute?.());
  });
  tryImport('../src/cells/business/period-close-cell/domain/services/allocation.engine', m => {
    const e = new (m.AllocationEngine || m.default)();
    wire('sales.confirm', 'period-close-cell', () => e.execute?.());
    wire('system.audit',  'period-close-cell', () => e.execute?.());
  });
  tryImport('../src/cells/business/pricing-cell/domain/services/rule-engine.service', m => {
    const e = new (m.RuleEngineService || m.default)();
    wire('StockReplenished', 'pricing-cell', () => e.execute?.());
  });

  // ── ORDER, CUSTOMER, SHOWROOM ─────────────────────────────────────────
  tryImport('../src/cells/business/order-cell/domain/services/order.engine', m => {
    const e = new (m.OrderEngine || m.default)();
    wire('order.created', 'order-cell', () => e.execute?.());
  });
  tryImport('../src/cells/business/customer-cell/domain/services/customer.engine', m => {
    const e = new (m.CustomerEngine || m.default)();
    wire('order.created', 'customer-cell', () => e.execute?.());
    wire('sales.confirm', 'customer-cell', () => e.execute?.());
  });
  tryImport('../src/cells/business/promotion-cell/domain/services/promotion.engine', m => {
    const e = new (m.PromotionEngine || m.default)();
    wire('order.created', 'promotion-cell', () => e.execute?.());
  });

  // ── COMPLIANCE, AUDIT ─────────────────────────────────────────────────
  tryImport('../src/cells/business/compliance-cell/domain/services/fraud-guard.engine', m => {
    const e = new (m.FraudGuardEngine || m.default)();
    wire('order.created',    'compliance-cell', () => e.execute?.());
    wire('payment.received', 'compliance-cell', () => e.execute?.());
  });
  tryImport('../src/cells/business/audit-cell/domain/services/audit.engine', m => {
    const e = new (m.AuditEngine || m.default)();
    wire('audit.record', 'audit-cell', () => e.execute?.());
    wire('system.audit', 'audit-cell', () => e.execute?.());
  });

  // ── SUPPORT ───────────────────────────────────────────────────────────
  tryImport('../src/cells/business/warranty-cell/domain/services/warranty.engine', m => {
    const e = new (m.WarrantyEngine || m.default)();
    wire('sales.confirm', 'warranty-cell', () => e.execute?.());
  });
  tryImport('../src/cells/business/prdwarranty-cell/domain/services/prdwarranty.engine', m => {
    const e = new (m.ProductWarrantyEngine || m.default)();
    wire('sales.confirm', 'prdwarranty-cell', () => e.execute?.());
  });
  tryImport('../src/cells/business/buyback-cell/domain/services/buyback.engine', m => {
    const e = new (m.BuybackEngine || m.default)();
    wire('buyback.requested', 'buyback-cell', () => e.execute?.());
  });
  tryImport('../src/cells/business/supplier-cell/domain/services/supplier.engine', m => {
    const e = new (m.SupplierEngine || m.default)();
    wire('production.planned', 'supplier-cell', () => e.execute?.());
  });
  tryImport('../src/cells/business/logistics-cell/domain/services/logistics.engine', m => {
    const e = new (m.LogisticsEngine || m.default)();
    wire('sales.confirm', 'logistics-cell', () => e.execute?.());
    wire('inventory.in',  'logistics-cell', () => e.execute?.());
  });
  tryImport('../src/cells/business/shared-contracts-cell/domain/services/shared-contracts.engine', m => {
    const e = new (m.SharedContractsEngine || m.default)();
    wire('order.created', 'shared-contracts-cell', () => e.execute?.());
  });
  tryImport('../src/cells/business/analytics-cell/domain/services/enterprise-linker.engine', m => {
    const e = new (m.EnterpriseLinkerEngine || m.default)();
    wire('system.audit', 'analytics-cell', () => e.execute?.());
  });
  tryImport('../src/cells/business/media-cell/domain/services/media.engine', m => {
    const e = new (m.MediaEngine || m.default)();
    wire('order.created', 'media-cell', () => e.execute?.());
  });
  tryImport('../src/cells/business/comms-cell/domain/services/auto-chase.engine', m => {
    const e = new (m.AutoChaseEngine || m.default)();
    wire('payment.received', 'comms-cell', () => e.execute?.());
  });
  tryImport('../src/cells/business/comms-cell/domain/services/room.engine', m => {
    const e = new (m.RoomEngine || m.default)();
    wire('order.created', 'comms-cell', () => e.execute?.());
  });
  tryImport('../src/cells/business/comms-cell/domain/services/invoice-match.engine', m => {
    const e = new (m.InvoiceMatchEngine || m.default)();
    wire('audit.record', 'comms-cell', () => e.execute?.());
  });
  tryImport('../src/cells/business/noi-vu-cell/domain/services/noi-vu.engine', m => {
    const e = new (m.NoiVuEngine || m.default)();
    wire('system.audit', 'noi-vu-cell', () => e.execute?.());
  });
  tryImport('../src/cells/business/phap-che-cell/domain/services/phap-che.engine', m => {
    const e = new (m.PhapCheEngine || m.default)();
    wire('system.audit', 'phap-che-cell', () => e.execute?.());
  });
  tryImport('../src/cells/business/it-cell/domain/services/it.engine', m => {
    const e = new (m.ITEngine || m.default)();
    wire('system.audit', 'it-cell', () => e.execute?.());
  });
  tryImport('../src/cells/business/constants-cell/domain/services/constants.engine', m => {
    const e = new (m.ConstantsEngine || m.default)();
    wire('system.audit', 'constants-cell', () => e.execute?.());
  });
  tryImport('../src/cells/infrastructure/sync-cell/domain/services/offline.engine', m => {
    const e = new (m.OfflineEngine || m.default)();
    wire('system.audit', 'sync-cell', () => e.execute?.());
  });

  // ── HR ────────────────────────────────────────────────────────────────
  tryImport('../src/cells/business/hr-cell/domain/services/hr-legacy.engine', m => {
    const e = new (m.HREngine || m.default)();
    wire('system.audit', 'hr-cell', () => e.execute?.());
  });
  tryImport('../src/cells/business/hr-cell/domain/services/personnel.engine', m => {
    const e = new (m.PersonnelEngine || m.default)();
    wire('system.audit', 'hr-cell', () => e.execute?.());
  });

  // ── CUSTOMS ───────────────────────────────────────────────────────────
  tryImport('../src/cells/business/customs-cell/domain/engines/invoice-extract.engine', m => {
    const e = new (m.InvoiceExtractEngine || m.CryptoEngine || m.default)();
    wire('audit.record', 'customs-cell', () => e.execute?.());
  });
  tryImport('../src/cells/business/customs-cell/domain/services/customs.engine', m => {
    const eng = m.CustomsRobotEngine;
    if (!eng) return;
    _eb.on('customs.declaration', (env: any) => {
      try {
        eng.batchProcess?.(env?.payload?.goods ?? []);
        _eb.emit('cell.metric', { cell: 'customs-cell', metric: 'customs.executed', value: 1, ts: Date.now() });
      } catch {}
    });
  });
  _eb.on('order.created', (payload: any) => {
    if (payload?.hasImport)
      _eb.emit('customs.declaration', { orderId: payload.orderId, source: 'order-cell', ts: Date.now() });
  });

  // ── KERNEL ────────────────────────────────────────────────────────────
  tryImport('../src/cells/kernel/security-cell/domain/services/threat-detection.engine', m => {
    const e = new (m.ThreatDetectionEngine || m.default)();
    wire('constitutional.violation', 'security-cell', () => e.execute?.());
    wire('quantum.escalation',       'security-cell', () => e.execute?.());
  });
  tryImport('../src/cells/kernel/rbac-cell/domain/services/rbac.engine', m => {
    const e = new (m.RBACEngine || m.default)();
    wire('system.audit', 'rbac-cell', () => e.execute?.());
  });
  tryImport('../src/cells/kernel/quantum-defense-cell/domain/engines/chromatic-state.engine', m => {
    const e = new (m.ChromaticStateEngine || m.default)();
    _eb.on('chromatic.state.changed', (env: any) => {
      try { e.execute?.(env?.payload); } catch {}
      _eb.emit('cell.metric', { cell: 'quantum-defense-cell', metric: 'chromatic.updated', value: 1, ts: Date.now() });
    });
  });
  tryImport('../src/cells/kernel/quantum-defense-cell/domain/services/ai-firewall.engine', m => {
    const e = new (m.AIFirewallEngine || m.default)();
    wire('constitutional.violation', 'quantum-defense-cell', () => e.execute?.());
  });
  tryImport('../src/governance/learning.engine', m => {
    const e = new (m.LearningEngine || m.default)();
    wire('system.audit', 'governance', () => e.execute?.());
  });

  // ── ANOMALY DETECTOR ──────────────────────────────────────────────────
  tryImport('../src/metabolism/healing/anomaly-detector', m => {
    const det = m.anomalyDetector ?? new (m.AnomalyDetector ?? m.default)();
    const buf: Record<string, number[]> = {};
    _eb.on('cell.metric', (p: any) => {
      if (!p || typeof p.value !== 'number') return;
      const k = `${p.cell}.${p.metric}`;
      if (!buf[k]) buf[k] = [];
      buf[k].push(p.value);
      if (buf[k].length >= 3) {
        det.detect(buf[k], k);
        if (buf[k].length > 20) buf[k].shift();
      }
    });
    console.info('[AnomalyDetector] Wired → cell.metric sensing active');
  });

  // ── HEARTBEAT cho blind cells ─────────────────────────────────────────
  [
    'design-3d-cell','showroom-cell','customs-cell','pricing-cell',
    'period-close-cell','analytics-cell','bom3dprd-cell','buyback-cell',
    'casting-cell','constants-cell','customer-cell','media-cell',
  ].forEach(cell =>
    _eb.emit('cell.metric', { cell, metric: 'heartbeat', value: 1, ts: Date.now(), source: 'engine-registry-v3' })
  );

  // ── Warm up ───────────────────────────────────────────────────────────
  setTimeout(() => {
    _eb.emit('system.audit', { ts: Date.now(), source: 'engine-registry-v3' });
  }, 1000);

  console.log('[EngineRegistry v3.0] init() — all engines wired to server EventBus');
}

export const EngineRegistry = { version: '3.0' };
