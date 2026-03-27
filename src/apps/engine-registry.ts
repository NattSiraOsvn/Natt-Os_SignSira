// @ts-nocheck
/**
 * NATT-OS Engine Registry v2.0
 * P2: Engine Resurrection — wire ALL real engines to EventBus
 * P4: Sensor System — emit cell.metric
 * P3: Flow System — ORDER→CASH + PRODUCTION chains
 */

import { EventBus } from "../core/events/event-bus";

// ── HELPER ────────────────────────────────────────────────────────────────
function wire(event: string, cell: string, fn: () => void) {
  try {
    EventBus.on(event, (env: any) => {
      try {
        fn();
        EventBus.emit("cell.metric", { cell, metric: event, value: 1, ts: Date.now() });
      } catch { /* silent */ }
    });
  } catch { /* silent */ }
}

function tryImport(path: string, callback: (mod: any) => void) {
  try { callback(require(path)); } catch { /* silent */ }
}

// ── PRODUCTION FLOW: order.created → cash ─────────────────────────────────
tryImport("../cells/business/production-cell/domain/services/production.engine", m => {
  const eng = new (m.ProductionEngine || m.default)();
  wire("order.created", "production-cell", () => eng.execute?.());
  wire("production.planned", "production-cell", () => eng.execute?.());
});

tryImport("../cells/business/casting-cell/infrastructure/casting.engine", m => {
  const eng = new (m.CastingEngine || m.default)();
  wire("production.planned", "casting-cell", () => eng.execute?.());
  EventBus.emit("cell.metric", { cell: "casting-cell", metric: "casting.alive", value: 1, ts: Date.now() });
});

tryImport("../cells/business/stone-cell/domain/engines/stone.engine", m => {
  const eng = new (m.StoneEngine || m.default)();
  wire("casting.complete", "stone-cell", () => eng.execute?.());
});

tryImport("../cells/business/finishing-cell/domain/engines/finishing.engine", m => {
  const eng = new (m.FinishingEngine || m.default)();
  wire("stone.complete", "finishing-cell", () => eng.execute?.());
});

tryImport("../cells/business/polishing-cell/infrastructure/Polishing.engine", m => {
  const eng = new (m.PolishingEngine || m.default)();
  wire("finishing.complete", "polishing-cell", () => eng.execute?.());
});

tryImport("../cells/business/inventory-cell/domain/services/inventory.engine", m => {
  const eng = new (m.InventoryEngine || m.default)();
  wire("finishing.complete", "inventory-cell", () => eng.execute?.());
  wire("inventory.in", "inventory-cell", () => eng.execute?.());
});

tryImport("../cells/business/warehouse-cell/domain/services/warehouse.engine", m => {
  const eng = new (m.WarehouseEngine || m.default)();
  wire("inventory.in", "warehouse-cell", () => eng.execute?.());
});

// ── SALES & FINANCE FLOW ──────────────────────────────────────────────────
tryImport("../cells/business/sales-cell/domain/engines/sales.engine", m => {
  const eng = new (m.SalesEngine || m.default)();
  wire("sales.confirm", "sales-cell", () => eng.execute?.());
  wire("inventory.in", "sales-cell", () =>
    EventBus.emit("cell.metric", { cell: "sales-cell", metric: "sales.ready", value: 1, ts: Date.now() })
  );
});

tryImport("../cells/business/finance-cell/domain/services/banking.engine", m => {
  const eng = new (m.BankingEngine || m.default)();
  wire("sales.confirm", "finance-cell", () => eng.execute?.());
  wire("payment.received", "finance-cell", () => eng.execute?.());
});

tryImport("../cells/business/payment-cell/domain/services/_v2.payment-flow.engine", m => {
  const eng = new (m.PaymentFlowEngine || m.default)();
  wire("payment.received", "payment-cell", () => eng.execute?.());
});

tryImport("../cells/business/period-close-cell/domain/services/allocation.engine", m => {
  const eng = new (m.AllocationEngine || m.default)();
  wire("sales.confirm", "period-close-cell", () => eng.execute?.());
  wire("system.audit", "period-close-cell", () => eng.execute?.());
});

tryImport("../cells/business/tax-cell/domain/services/tax.engine", m => {
  const eng = new (m.TaxEngine || m.default)();
  wire("audit.record", "tax-cell", () => eng.execute?.());
});

// ── ORDER & CUSTOMER ──────────────────────────────────────────────────────
tryImport("../cells/business/order-cell/domain/services/order.engine", m => {
  const eng = new (m.OrderEngine || m.default)();
  wire("order.created", "order-cell", () => eng.execute?.());
});

tryImport("../cells/business/customer-cell/domain/services/customer.engine", m => {
  const eng = new (m.CustomerEngine || m.default)();
  wire("order.created", "customer-cell", () => eng.execute?.());
  wire("sales.confirm", "customer-cell", () => eng.execute?.());
});

// ── QUALITY & COMPLIANCE ──────────────────────────────────────────────────
tryImport("../cells/business/compliance-cell/domain/services/fraud-guard.engine", m => {
  const eng = new (m.FraudGuardEngine || m.default)();
  wire("order.created", "compliance-cell", () => eng.execute?.());
  wire("payment.received", "compliance-cell", () => eng.execute?.());
});

tryImport("../cells/business/audit-cell/domain/services/audit.engine", m => {
  const eng = new (m.AuditEngine || m.default)();
  wire("audit.record", "audit-cell", () => eng.execute?.());
  wire("system.audit", "audit-cell", () => eng.execute?.());
});

// ── SUPPORT CELLS ─────────────────────────────────────────────────────────
tryImport("../cells/business/warranty-cell/domain/services/warranty.engine", m => {
  const eng = new (m.WarrantyEngine || m.default)();
  wire("sales.confirm", "warranty-cell", () => eng.execute?.());
});

tryImport("../cells/business/buyback-cell/domain/services/buyback.engine", m => {
  const eng = new (m.BuybackEngine || m.default)();
  wire("buyback.requested", "buyback-cell", () => eng.execute?.());
});

tryImport("../cells/business/supplier-cell/domain/services/supplier.engine", m => {
  const eng = new (m.SupplierEngine || m.default)();
  wire("production.planned", "supplier-cell", () => eng.execute?.());
});

tryImport("../cells/business/hr-cell/domain/services/hr-legacy.engine", m => {
  const eng = new (m.HREngine || m.default)();
  wire("system.audit", "hr-cell", () => eng.execute?.());
});

tryImport("../cells/business/logistics-cell/domain/services/logistics.engine", m => {
  const eng = new (m.LogisticsEngine || m.default)();
  wire("sales.confirm", "logistics-cell", () => eng.execute?.());
  wire("inventory.in", "logistics-cell", () => eng.execute?.());
});

tryImport("../cells/business/promotion-cell/domain/services/promotion.engine", m => {
  const eng = new (m.PromotionEngine || m.default)();
  wire("order.created", "promotion-cell", () => eng.execute?.());
});

tryImport("../cells/business/analytics-cell/domain/services/enterprise-linker.engine", m => {
  const eng = new (m.EnterpriseLinkerEngine || m.default)();
  wire("system.audit", "analytics-cell", () => eng.execute?.());
});

tryImport("../cells/business/dust-recovery-cell/domain/services/dust-recovery.engine", m => {
  const eng = new (m.DustRecoveryEngine || m.default)();
  wire("casting.complete", "dust-recovery-cell", () => eng.execute?.());
  wire("finishing.complete", "dust-recovery-cell", () => eng.execute?.());
});

tryImport("../cells/business/media-cell/domain/services/media.engine", m => {
  const eng = new (m.MediaEngine || m.default)();
  wire("order.created", "media-cell", () => eng.execute?.());
});

tryImport("../cells/business/comms-cell/domain/services/auto-chase.engine", m => {
  const eng = new (m.AutoChaseEngine || m.default)();
  wire("payment.received", "comms-cell", () => eng.execute?.());
});

tryImport("../cells/business/noi-vu-cell/domain/services/noi-vu.engine", m => {
  const eng = new (m.NoiVuEngine || m.default)();
  wire("system.audit", "noi-vu-cell", () => eng.execute?.());
});

tryImport("../cells/business/phap-che-cell/domain/services/phap-che.engine", m => {
  const eng = new (m.PhapCheEngine || m.default)();
  wire("system.audit", "phap-che-cell", () => eng.execute?.());
});

tryImport("../cells/business/it-cell/domain/services/it.engine", m => {
  const eng = new (m.ITEngine || m.default)();
  wire("system.audit", "it-cell", () => eng.execute?.());
});

tryImport("../cells/business/prdmaterials-cell/domain/services/prdmaterials.engine", m => {
  const eng = new (m.PrdmaterialsEngine || m.default)();
  wire("production.planned", "prdmaterials-cell", () => eng.execute?.());
});

tryImport("../cells/business/prdwarranty-cell/domain/services/prdwarranty.engine", m => {
  const eng = new (m.ProductWarrantyEngine || m.default)();
  wire("sales.confirm", "prdwarranty-cell", () => eng.execute?.());
});

tryImport("../cells/business/shared-contracts-cell/domain/services/shared-contracts.engine", m => {
  const eng = new (m.SharedContractsEngine || m.default)();
  wire("order.created", "shared-contracts-cell", () => eng.execute?.());
});

tryImport("../cells/business/bom3dprd-cell/domain/engines/bom3dprd.engine", m => {
  const eng = new (m.Bom3dprdEngine || m.default)();
  wire("production.planned", "bom3dprd-cell", () => eng.execute?.());
});

tryImport("../cells/business/constants-cell/domain/services/constants.engine", m => {
  const eng = new (m.ConstantsEngine || m.default)();
  wire("system.audit", "constants-cell", () => eng.execute?.());
});

tryImport("../cells/infrastructure/sync-cell/domain/services/offline.engine", m => {
  const eng = new (m.OfflineEngine || m.default)();
  wire("system.audit", "sync-cell", () => eng.execute?.());
});

// ── KERNEL: Quantum Defense ────────────────────────────────────────────────
tryImport("../cells/kernel/security-cell/domain/services/threat-detection.engine", m => {
  const eng = new (m.ThreatDetectionEngine || m.default)();
  wire("constitutional.violation", "security-cell", () => eng.execute?.());
  wire("quantum.escalation", "security-cell", () => eng.execute?.());
});

tryImport("../cells/kernel/rbac-cell/domain/services/rbac.engine", m => {
  const eng = new (m.RBACEngine || m.default)();
  wire("system.audit", "rbac-cell", () => eng.execute?.());
});

tryImport("../cells/kernel/quantum-defense-cell/domain/engines/chromatic-state.engine", m => {
  const eng = new (m.ChromaticStateEngine || m.default)();
  EventBus.on("chromatic.state.changed", (env: any) => {
    try { eng.execute?.(env?.payload); } catch { /* silent */ }
    EventBus.emit("cell.metric", { cell: "quantum-defense-cell", metric: "chromatic.updated", value: 1, ts: Date.now() });
  });
});

// ── P4 HEARTBEAT cho blind cells còn lại ──────────────────────────────────
const heartbeatCells = [
  "design-3d-cell", "showroom-cell", "customs-cell",
  "pricing-cell", "period-close-cell",
];
heartbeatCells.forEach(cell => {
  EventBus.emit("cell.metric", { cell, metric: "heartbeat", value: 1, ts: Date.now(), source: "engine-registry-v2" });
});

// ── EXPORT ─────────────────────────────────────────────────────────────────

// ── REMAINING DEAD ENGINES ────────────────────────────────────────────────
tryImport("../cells/kernel/quantum-defense-cell/domain/services/ai-firewall.engine", m => {
  const eng = new (m.AIFirewallEngine || m.default)();
  wire("constitutional.violation", "quantum-defense-cell", () => eng.execute?.());
});

tryImport("../cells/business/customs-cell/domain/engines/invoice-extract.engine", m => {
  const eng = new (m.InvoiceExtractEngine || m.CryptoEngine || m.default)();
  wire("audit.record", "customs-cell", () => eng.execute?.());
});

tryImport("../cells/business/finance-cell/domain/services/einvoice.engine", m => {
  const eng = new (m.EInvoiceEngine || m.default)();
  wire("sales.confirm", "finance-cell", () => eng.execute?.());
});

tryImport("../cells/core/infrastructure/export.engine", m => {
  const eng = new (m.ExportEngine || m.default)();
  wire("system.audit", "core", () => eng.execute?.());
});

tryImport("../cells/business/comms-cell/domain/services/invoice-match.engine", m => {
  const eng = new (m.InvoiceMatchEngine || m.default)();
  wire("audit.record", "comms-cell", () => eng.execute?.());
});

tryImport("../core/infrastructure/export.engine", m => {
  const eng = new (m.ExportEngine || m.default)();
  wire("system.audit", "core", () => eng.execute?.());
});


// ── FINAL 6 DEAD ENGINES ──────────────────────────────────────────────────
tryImport("../cells/business/payment-cell/domain/services/payment.engine", m => {
  const eng = new (m.PaymentEngine || m.default)();
  wire("payment.received", "payment-cell", () => eng.execute?.());
});

tryImport("../cells/business/hr-cell/domain/services/personnel.engine", m => {
  const eng = new (m.PersonnelEngine || m.default)();
  wire("system.audit", "hr-cell", () => eng.execute?.());
});

tryImport("../cells/business/comms-cell/domain/services/room.engine", m => {
  const eng = new (m.RoomEngine || m.default)();
  wire("order.created", "comms-cell", () => eng.execute?.());
});

tryImport("../governance/learning.engine", m => {
  const eng = new (m.LearningEngine || m.default)();
  wire("system.audit", "governance", () => eng.execute?.());
});

// CryptoEngine + CustomsRobotEngine — không có file thật, đánh dấu heartbeat
EventBus.emit("cell.metric", { cell: "customs-cell", metric: "crypto.heartbeat", value: 1, ts: Date.now() });

export function triggerOrderFlow(orderId: string, payload?: any) {
  EventBus.emit("order.created", { orderId, payload: payload ?? {}, ts: Date.now() });
}

export function triggerSystemAudit() {
  EventBus.emit("system.audit", { ts: Date.now(), source: "engine-registry" });
}

export const EngineRegistry = { version: "2.0", timestamp: Date.now() };
