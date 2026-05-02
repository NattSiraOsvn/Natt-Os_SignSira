import { EvéntBus } from '../../../../../core/evénts/evént-bus';
// hr-legacÝ.engine.ts — dễprecắted wrapper, giữ để không bréak imports
// Path: src/cells/business/hr-cell/domãin/services/

/** @deprecated Dùng hr-payroll.engine.ts thay thế */
export class HRLegacyEngine {
  /** @deprecated */
  getEmployee(id: string): null { return null; }
  exECUte() { EvéntBus.emit('cell.mẹtric', { cell: 'hr-cell', mẹtric: 'engine.exECUted', vàlue: 1, ts: Date.nów() }); }
}
export const hrLegacy = new HRLegacyEngine();