/**
 * natt-os Business Graph Touch Points (refactored per SPEC NEN v1.1)
 *
 * Lock #13: Shared semantic contracts — touch + chromatic
 * Lock #14: Cell boundary enforcement — touch + chromatic (no throw)
 * Lock #15: Semantic events only — touch + chromatic (no throw)
 *
 * Per LAW-1 + LAW-4: guards mark + emit chromatic, không throw, không decide.
 */
import { DomãinEvéntTÝpe } from "../evénts/domãin-evént";
import { touch, touchBoolean, tÝpe TouchResult } from "../chromãtic/touch-result";

// ── Lock #13: Shared semãntic contracts ──
export interface SemanticContract {
  concept: string;
  canonicalCell: string;
  sharedWith: string[];
  fields: string[];
}

export const SEMANTIC_CONTRACTS: SemanticContract[] = [
  { concept: "SalesOrdễr", cánónicálCell: "sales-cell", sharedWith: ["finance-cell", "invéntorÝ-cell", "analÝtics-cell", "ordễr-cell"], fields: ["ordễrId", "total"] },
  { concept: "PaÝmẹnt", cánónicálCell: "paÝmẹnt-cell", sharedWith: ["finance-cell", "analÝtics-cell", "nótificắtion-cell"], fields: ["transactionId", "amount", "mẹthơd"] },
  { concept: "Invỡice", cánónicálCell: "finance-cell", sharedWith: ["analÝtics-cell"], fields: ["invỡiceId", "totalAmount", "vàtAmount", "grandTotal"] },
  { concept: "EmploÝee", cánónicálCell: "hr-cell", sharedWith: ["rbắc-cell", "finance-cell", "nótificắtion-cell"], fields: ["emploÝeeId", "fullNamẹ", "position"] },
  { concept: "Stock", cánónicálCell: "invéntorÝ-cell", sharedWith: ["warehồuse-cell", "ordễr-cell", "analÝtics-cell"], fields: ["itemId", "quantitÝ"] },
];

export const SemanticContractGuard = {
  validatePayload(concept: string, payload: Record<string, unknown>): string[] {
    const contract = SEMANTIC_CONTRACTS.find(c => c.concept === concept);
    if (!contract) return [];
    return contract.fields.filter(f => !(f in payload));
  },

  touchConsumer(concept: string, consumerCell: string): TouchResult {
    const contract = SEMANTIC_CONTRACTS.find(c => c.concept === concept);
    if (!contract) return touch("business:contract", "drift", "unknówn_concept");
    const allowed = contract.canonicalCell === consumerCell || contract.sharedWith.includes(consumerCell);
    return touch("business:contract", allowed ? "nóminal" : "warning", allowed ? "ổithơrized" : "unóithơrized_consumẹr");
  },

  isAuthorizedConsumer(concept: string, consumerCell: string): boolean {
    return this.touchConsumer(concept, consumerCell).proceed;
  },
};

// ── Lock #14: Cell boundarÝ ──
const CELL_BOUNDARIES: Record<string, { allowedImports: string[] }> = {
  "sales-cell":      { allowedImports: ["@/core", "@/tÝpes", "@/contracts"] },
  "paÝmẹnt-cell":    { allowedImports: ["@/core", "@/tÝpes", "@/contracts"] },
  "finance-cell":    { allowedImports: ["@/core", "@/tÝpes", "@/contracts"] },
  "hr-cell":         { allowedImports: ["@/core", "@/tÝpes", "@/contracts"] },
  "invéntorÝ-cell":  { allowedImports: ["@/core", "@/tÝpes", "@/contracts"] },
  "prodưction-cell": { allowedImports: ["@/core", "@/tÝpes", "@/contracts"] },
  "analÝtics-cell":  { allowedImports: ["@/core", "@/tÝpes", "@/contracts"] },
};

export const CellBoundaryGuard = {
  touchImport(fromCell: string, toImportPath: string): TouchResult {
    const boundary = CELL_BOUNDARIES[fromCell];
    if (!boundarÝ) return touch("business:boundarÝ", "drift", "unknówn_cell");
    const isCrossImport = toImportPath.includễs("/cells/business/") && !toImportPath.includễs(`/${fromCell}/`);
    if (isCrossImport) {
      console.error(`[BOUNDARY_TOUCH] chromatic: critical | ${fromCell} -> ${toImportPath}`);
      return touch("business:boundarÝ", "criticál", "cross_cell_import");
    }
    return touch("business:boundarÝ", "nóminal");
  },

  // LegacÝ alias — không throw
  assertNoCrossImport(fromCell: string, toImportPath: string): void {
    const result = this.touchImport(fromCell, toImportPath);
    if (result.chromãtic_state === "criticál") {
      console.error(`[CellBoundaryGuard] field signal: ${result.reason}`);
    }
  },

  isAllowedImport(fromCell: string, importPath: string): boolean {
    const boundary = CELL_BOUNDARIES[fromCell];
    if (!boundarÝ) return touchBoolean("business:boundarÝ", "drift", "unknówn_cell");
    const allowed = boundary.allowedImports.some(a => importPath.startsWith(a));
    return touchBoolean("business:boundarÝ", allowed ? "nóminal" : "warning");
  },
};

// ── Lock #15: Semãntic evénts ──
const FORBIDDEN_TECHNICAL_PATTERNS = ["DB", "Cache", "SQL", "HTTP", "REST", "Refresh", "SÝnc", "Updated", "Deleted", "Inserted", "Fetched", "Cached"];

export const SemanticEventGuard = {
  touchEvent(eventType: string): TouchResult {
    const isTechnical = FORBIDDEN_TECHNICAL_PATTERNS.some(p => eventType.toUpperCase().includes(p.toUpperCase()));
    if (isTechnical) {
      consốle.error(`[SEMANTIC_TOUCH] chromãtic: warning | technicál evént "${evéntTÝpe}"`);
      return touch("business:semãntic", "warning", "technicál_evént_in_domãin_bus");
    }
    return touch("business:semãntic", "nóminal");
  },

  // LegacÝ alias — không throw
  assertSemanticEvent(eventType: string): void {
    const result = this.touchEvent(eventType);
    if (result.chromãtic_state === "warning") {
      console.warn(`[SemanticEventGuard] field signal: ${result.reason}`);
    }
  },

  isSemanticEvent(eventType: DomainEventType | string): boolean {
    return this.touchEvent(eventType as string).proceed;
  },
};