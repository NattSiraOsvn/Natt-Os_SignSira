/**
 * NATT-OS Business Graph Guards
 * Lock #13: Shared contracts — semantic consistency
 * Lock #14: Cell boundary enforcement
 * Lock #15: Semantic events only (no technical noise)
 */
import { DomainEventType } from "../events/domain-event";

// ── Lock #13: Shared semantic contracts ──
// Mỗi khái niệm nghiệp vụ phải có 1 định nghĩa duy nhất
export interface SemanticContract {
  concept: string;         // e.g. "SalesOrder"
  canonicalCell: string;   // owner cell
  sharedWith: string[];    // cells allowed to consume
  fields: string[];        // bắt buộc phải có trong payload
}

export const SEMANTIC_CONTRACTS: SemanticContract[] = [
  {
    concept: "SalesOrder",
    canonicalCell: "sales-cell",
    sharedWith: ["finance-cell", "inventory-cell", "analytics-cell", "order-cell"],
    fields: ["orderId", "total"],
  },
  {
    concept: "Payment",
    canonicalCell: "payment-cell",
    sharedWith: ["finance-cell", "analytics-cell", "notification-cell"],
    fields: ["transactionId", "amount", "method"],
  },
  {
    concept: "Invoice",
    canonicalCell: "finance-cell",
    sharedWith: ["analytics-cell"],
    fields: ["invoiceId", "totalAmount", "vatAmount", "grandTotal"],
  },
  {
    concept: "Employee",
    canonicalCell: "hr-cell",
    sharedWith: ["rbac-cell", "finance-cell", "notification-cell"],
    fields: ["employeeId", "fullName", "position"],
  },
  {
    concept: "Stock",
    canonicalCell: "inventory-cell",
    sharedWith: ["warehouse-cell", "order-cell", "analytics-cell"],
    fields: ["itemId", "quantity"],
  },
];

export const SemanticContractGuard = {
  validatePayload(concept: string, payload: Record<string, unknown>): string[] {
    const contract = SEMANTIC_CONTRACTS.find(c => c.concept === concept);
    if (!contract) return [];
    return contract.fields.filter(f => !(f in payload));
  },

  isAuthorizedConsumer(concept: string, consumerCell: string): boolean {
    const contract = SEMANTIC_CONTRACTS.find(c => c.concept === concept);
    if (!contract) return true; // unknown concept = allowed
    return contract.canonicalCell === consumerCell || contract.sharedWith.includes(consumerCell);
  },
};

// ── Lock #14: Cell boundary enforcement ──
// Cell không được gọi engine của cell khác trực tiếp
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
  assertNoCrossImport(fromCell: string, toImportPath: string): void {
    const boundary = CELL_BOUNDARIES[fromCell];
    if (!boundary) return;
    // Check if importing another cell's domain
    const isCrossImport = toImportPath.includes("/cells/business/") &&
      !toImportPath.includes(`/${fromCell}/`);
    if (isCrossImport) {
      throw new Error(
        `[CellBoundaryGuard] VIOLATION: "${fromCell}" cannot import from "${toImportPath}". ` +
        `Use EventBus for cross-cell communication. Direct import = boundary violation.`
      );
    }
  },

  isAllowedImport(fromCell: string, importPath: string): boolean {
    const boundary = CELL_BOUNDARIES[fromCell];
    if (!boundary) return true;
    return boundary.allowedImports.some(allowed => importPath.startsWith(allowed));
  },
};

// ── Lock #15: Semantic events only ──
// Cấm publish technical/infrastructure events vào domain EventBus
const FORBIDDEN_TECHNICAL_PATTERNS = [
  "DB", "Cache", "SQL", "HTTP", "REST", "Refresh", "Sync",
  "Updated", "Deleted", "Inserted", "Fetched", "Cached",
];

export const SemanticEventGuard = {
  assertSemanticEvent(eventType: string): void {
    const isTechnical = FORBIDDEN_TECHNICAL_PATTERNS.some(p =>
      eventType.toUpperCase().includes(p.toUpperCase())
    );
    if (isTechnical) {
      throw new Error(
        `[SemanticEventGuard] VIOLATION: "${eventType}" appears to be a technical/infrastructure event. ` +
        `Only semantic domain events allowed in NATT-OS EventBus. ` +
        `Rename to reflect business meaning (e.g., "DBUpdated" → "InvoiceIssued").`
      );
    }
  },

  isSemanticEvent(eventType: DomainEventType | string): boolean {
    return !FORBIDDEN_TECHNICAL_PATTERNS.some(p =>
      eventType.toUpperCase().includes(p.toUpperCase())
    );
  },
};
