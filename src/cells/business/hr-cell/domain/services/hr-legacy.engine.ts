// hr-legacy.engine.ts — deprecated wrapper, giữ để không break imports
// Path: src/cells/business/hr-cell/domain/services/

/** @deprecated Dùng hr-payroll.engine.ts thay thế */
export class HRLegacyEngine {
  /** @deprecated */
  getEmployee(id: string): null { return null; }
}
export const hrLegacy = new HRLegacyEngine();
