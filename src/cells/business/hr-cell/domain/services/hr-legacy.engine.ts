import { EventBus } from '@/core/events/event-bus';
// hr-legacy.engine.ts — deprecated wrapper, giữ để không break imports
// Path: src/cells/business/hr-cell/domain/services/

/** @deprecated Dùng hr-payroll.engine.ts thay thế */
export class HRLegacyEngine {
  /** @deprecated */
  getEmployee(id: string): null { return null; }
  execute() { EventBus.emit('cell.metric', { cell: 'hr-cell', metric: 'engine.executed', value: 1, ts: Date.now() }); }
}
export const hrLegacy = new HRLegacyEngine();
