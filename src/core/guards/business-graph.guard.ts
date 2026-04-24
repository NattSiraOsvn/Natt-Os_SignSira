/**
 * Natt-OS Business Graph Touch Points (refactored per SPEC NEN v1.1)
 *
 * Lock #13: Shared semantic contracts — touch + chromatic
 * Lock #14: Cell boundary enforcement — touch + chromatic (no throw)
 * Lock #15: Semantic events only — touch + chromatic (no throw)
 *
 * Per LAW-1 + LAW-4: guards mark + emit chromatic, không throw, không decide.
 */
import { DomainEventType } from "../events/domain-event";
import { touch, touchBoolean, type TouchResult } from "../chromatic/touch-result";

// ── Lock #13: Shared semantic contracts ──
export interface SemanticContract {
  concept: string;
  canonicalCell: string;
  sharedWith: string[];
  fields: string[];
}

export const SEMANTIC_CONTRACTS: SemanticContract[] = [
  { concept: "SalesOrder", canonicalCell: "sales-cell", sharedWith: ["finance-cell", "inventory-cell", "analytics-cell", "order-cell"], fields: ["orderId", "total"] },
  { concept: "Payment", canonicalCell: "payment-cell", sharedWith: ["finance-cell", "analytics-cell", "notification-cell"], fields: ["transactionId", "amount", "method"] },
  { concept: "Invoice", canonicalCell: "finance-cell", sharedWith: ["analytics-cell"], fields: ["invoiceId", "totalAmount", "vatAmount", "grandTotal"] },
  { concept: "Employee", canonicalCell: "hr-cell", sharedWith: ["rbac-cell", "finance-cell", "notification-cell"], fields: ["employeeId", "fullName", "position"] },
  { concept: "Stock", canonicalCell: "inventory-cell", sharedWith: ["warehouse-cell", "order-cell", "analytics-cell"], fields: ["itemId", "quantity"] },
];

export const SemanticContractGuard = {
  validatePayload(concept: string, payload: Record<string, unknown>): string[] {
    const contract = SEMANTIC_CONTRACTS.find(c => c.concept === concept);
    if (!contract) return [];
    return contract.fields.filter(f => !(f in payload));
  },

  touchConsumer(concept: string, consumerCell: string): TouchResult {
    const contract = SEMANTIC_CONTRACTS.find(c => c.concept === concept);
    if (!contract) return touch("business:contract", "drift", "unknown_concept");
    const allowed = contract.canonicalCell === consumerCell || contract.sharedWith.includes(consumerCell);
    return touch("business:contract", allowed ? "nominal" : "warning", allowed ? "authorized" : "unauthorized_consumer");
  },

  isAuthorizedConsumer(concept: string, consumerCell: string): boolean {
    return this.touchConsumer(concept, consumerCell).proceed;
  },
};

// ── Lock #14: Cell boundary ──
const CELL_BOUNDARIES: Record<string, { allowedImports: string[] }> = {
  "sales-cell":      { allowedImports: ["@/core", "@/types", "@/contracts"] },
  "payment-cell":    { allowedImports: ["@/core", "@/types", "@/contracts"] },
  "finance-cell":    { allowedImports: ["@/core", "@/types", "@/contracts"] },
  "hr-cell":         { allowedImports: ["@/core", "@/types", "@/contracts"] },
  "inventory-cell":  { allowedImports: ["@/core", "@/types", "@/contracts"] },
  "production-cell": { allowedImports: ["@/core", "@/types", "@/contracts"] },
  "analytics-cell":  { allowedImports: ["@/core", "@/types", "@/contracts"] },
};

export const CellBoundaryGuard = {
  touchImport(fromCell: string, toImportPath: string): TouchResult {
    const boundary = CELL_BOUNDARIES[fromCell];
    if (!boundary) return touch("business:boundary", "drift", "unknown_cell");
    const isCrossImport = toImportPath.includes("/cells/business/") && !toImportPath.includes(`/${fromCell}/`);
    if (isCrossImport) {
      console.error(`[BOUNDARY_TOUCH] chromatic: critical | ${fromCell} -> ${toImportPath}`);
      return touch("business:boundary", "critical", "cross_cell_import");
    }
    return touch("business:boundary", "nominal");
  },

  // Legacy alias — không throw
  assertNoCrossImport(fromCell: string, toImportPath: string): void {
    const result = this.touchImport(fromCell, toImportPath);
    if (result.chromatic_state === "critical") {
      console.error(`[CellBoundaryGuard] field signal: ${result.reason}`);
    }
  },

  isAllowedImport(fromCell: string, importPath: string): boolean {
    const boundary = CELL_BOUNDARIES[fromCell];
    if (!boundary) return touchBoolean("business:boundary", "drift", "unknown_cell");
    const allowed = boundary.allowedImports.some(a => importPath.startsWith(a));
    return touchBoolean("business:boundary", allowed ? "nominal" : "warning");
  },
};

// ── Lock #15: Semantic events ──
const FORBIDDEN_TECHNICAL_PATTERNS = ["DB", "Cache", "SQL", "HTTP", "REST", "Refresh", "Sync", "Updated", "Deleted", "Inserted", "Fetched", "Cached"];

export const SemanticEventGuard = {
  touchEvent(eventType: string): TouchResult {
    const isTechnical = FORBIDDEN_TECHNICAL_PATTERNS.some(p => eventType.toUpperCase().includes(p.toUpperCase()));
    if (isTechnical) {
      console.error(`[SEMANTIC_TOUCH] chromatic: warning | technical event "${eventType}"`);
      return touch("business:semantic", "warning", "technical_event_in_domain_bus");
    }
    return touch("business:semantic", "nominal");
  },

  // Legacy alias — không throw
  assertSemanticEvent(eventType: string): void {
    const result = this.touchEvent(eventType);
    if (result.chromatic_state === "warning") {
      console.warn(`[SemanticEventGuard] field signal: ${result.reason}`);
    }
  },

  isSemanticEvent(eventType: DomainEventType | string): boolean {
    return this.touchEvent(eventType as string).proceed;
  },
};
