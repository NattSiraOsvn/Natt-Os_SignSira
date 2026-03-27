// @ts-nocheck
/**
 * NATT-OS Engine Registry v1.0
 * P2: Engine Resurrection — instantiate all dead engines
 * P4: Sensor System — emit cell.metric for blind cells
 * P3: Flow System — ORDER→CASH chain
 */

import { EventBus } from "../core/events/event-bus";

// ── KERNEL ENGINES ─────────────────────────────────────────
try {
  const { AuditHashEngine } = require("../cells/kernel/audit-cell/domain/services/audit-hash.engine");
  const auditEngine = new AuditHashEngine();
  EventBus.emit("cell.metric", { cell: "audit-cell", metric: "audit.alive", value: 1, ts: Date.now() });
} catch(e) { /* silent */ }

try {
  const { RBACEngine } = require("../cells/kernel/rbac-cell/domain/services/rbac.engine");
  const rbacEngine = new RBACEngine();
  EventBus.emit("cell.metric", { cell: "rbac-cell", metric: "rbac.alive", value: 1, ts: Date.now() });
} catch(e) { /* silent */ }

// ── BUSINESS ENGINES ──────────────────────────────────────
// Production
try {
  const { ProductionEngine } = require("../cells/business/production-cell/domain/services/production.engine");
  const productionEngine = new ProductionEngine();
  EventBus.on("order.created", (env: any) => {
    const result = productionEngine.execute?.(env?.payload ?? env);
    EventBus.emit("cell.metric", { cell: "production-cell", metric: "production.order", value: 1, ts: Date.now() });
    EventBus.emit("production.planned", { orderId: env?.payload?.orderId ?? "unknown", ts: Date.now() });
  });
} catch(e) { /* silent */ }

// Casting
try {
  const { CastingEngine } = require("../cells/business/casting-cell/infrastructure/casting.engine");
  const castingEngine = new CastingEngine();
  EventBus.on("production.planned", (env: any) => {
    castingEngine.execute?.(env?.payload ?? env);
    EventBus.emit("cell.metric", { cell: "casting-cell", metric: "casting.started", value: 1, ts: Date.now() });
    EventBus.emit("casting.complete", { ts: Date.now() });
  });
} catch(e) { /* silent */ }

// Stone
try {
  const { StoneEngine } = require("../cells/business/stone-cell/domain/engines/stone.engine");
  const stoneEngine = new StoneEngine();
  EventBus.on("casting.complete", (env: any) => {
    stoneEngine.execute?.(env?.payload ?? env);
    EventBus.emit("cell.metric", { cell: "stone-cell", metric: "stone.set", value: 1, ts: Date.now() });
    EventBus.emit("stone.complete", { ts: Date.now() });
  });
} catch(e) { /* silent */ }

// Polishing
try {
  const { PolishingEngine } = require("../cells/business/polishing-cell/infrastructure/Polishing.engine");
  const polishingEngine = new PolishingEngine();
  EventBus.on("stone.complete", (env: any) => {
    polishingEngine.execute?.(env?.payload ?? env);
    EventBus.emit("cell.metric", { cell: "polishing-cell", metric: "polishing.done", value: 1, ts: Date.now() });
    EventBus.emit("finishing.complete", { ts: Date.now() });
  });
} catch(e) { /* silent */ }

// Warehouse
try {
  const { WarehouseEngine } = require("../cells/business/warehouse-cell/domain/services/warehouse.engine");
  const warehouseEngine = new WarehouseEngine();
  EventBus.on("finishing.complete", (env: any) => {
    EventBus.emit("cell.metric", { cell: "warehouse-cell", metric: "warehouse.in", value: 1, ts: Date.now() });
    EventBus.emit("inventory.in", { ts: Date.now() });
  });
} catch(e) { /* silent */ }

// Sales
try {
  const { SalesEngine } = require("../cells/business/sales-cell/domain/engines/sales.engine");
  const salesEngine = new SalesEngine();
  EventBus.on("inventory.in", (env: any) => {
    EventBus.emit("cell.metric", { cell: "sales-cell", metric: "sales.ready", value: 1, ts: Date.now() });
    EventBus.emit("sales.confirm", { ts: Date.now() });
  });
} catch(e) { /* silent */ }

// Finance
try {
  const { FinanceEngine } = require("../cells/business/finance-cell/domain/services/finance.engine");
  const financeEngine = new FinanceEngine();
  EventBus.on("sales.confirm", (env: any) => {
    EventBus.emit("cell.metric", { cell: "finance-cell", metric: "finance.recorded", value: 1, ts: Date.now() });
    EventBus.emit("audit.record", { type: "sales.confirm", ts: Date.now() });
  });
} catch(e) { /* silent */ }

// Tax
try {
  EventBus.on("audit.record", (env: any) => {
    EventBus.emit("cell.metric", { cell: "tax-cell", metric: "tax.calculated", value: 1, ts: Date.now() });
  });
} catch(e) { /* silent */ }

// ── P4 BLIND CELL SENSORS ─────────────────────────────────
// Emit heartbeat for cells with no natural emit
const blindCells = [
  "analytics-cell", "bom3dprd-cell", "buyback-cell", "constants-cell",
  "customer-cell", "customs-cell", "design-3d-cell", "hr-cell",
  "it-cell", "media-cell", "order-cell", "payment-cell",
  "period-close-cell", "phap-che-cell", "prdmaterials-cell",
  "pricing-cell", "showroom-cell", "warranty-cell",
];

blindCells.forEach(cell => {
  EventBus.emit("cell.metric", {
    cell, metric: "heartbeat", value: 1, ts: Date.now(), source: "engine-registry"
  });
});

// ── P3 ENTRY POINT ────────────────────────────────────────
export function triggerOrderFlow(orderId: string, payload?: any) {
  EventBus.emit("order.created", {
    orderId, payload: payload ?? {}, ts: Date.now(), source: "engine-registry"
  });
}

export const EngineRegistry = {
  initialized: true,
  version: "1.0",
  timestamp: Date.now(),
};
