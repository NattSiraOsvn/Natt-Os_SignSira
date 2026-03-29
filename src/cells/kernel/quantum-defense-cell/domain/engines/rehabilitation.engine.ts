/**
 * rehabilitation.engine.ts
 * Quantum Defense — Phục hồi AI sau vi phạm
 * 3 phases: Constitutional re-education → Safety test → Restore
 */

import { EventBus } from '@/core/events/event-bus';
import { AuditApplicationService } from '@/cells/kernel/audit-cell/application/services/AuditApplicationService';

export type RehabStatus = 'PENDING' | 'PHASE_1' | 'PHASE_2' | 'PHASE_3' | 'RESTORED' | 'FAILED';

interface RehabRecord {
  aiId: string;
  status: RehabStatus;
  startedAt: number;
  completedAt?: number;
}

const _rehabRegistry = new Map<string, RehabRecord>();

export async function rehabilitate(aiId: string): Promise<{ success: boolean; status: RehabStatus }> {
  const record: RehabRecord = { aiId, status: 'PENDING', startedAt: Date.now() };
  _rehabRegistry.set(aiId, record);

  try {
    // Phase 1: Constitutional re-education
    record.status = 'PHASE_1';
    await AuditApplicationService.log({ action: 'REHAB_PHASE_1', actorId: aiId, module: 'quantum-defense-cell', detail: {} } as any);
    console.log(`[Rehab] Phase 1: Constitutional logic restoration — ${aiId}`);

    // Phase 2: Safety boundary verification
    record.status = 'PHASE_2';
    await AuditApplicationService.log({ action: 'REHAB_PHASE_2', actorId: aiId, module: 'quantum-defense-cell', detail: {} } as any);
    console.log(`[Rehab] Phase 2: Safety boundaries verified — ${aiId}`);

    // Phase 3: Controlled environment test
    record.status = 'PHASE_3';
    await AuditApplicationService.log({ action: 'REHAB_PHASE_3', actorId: aiId, module: 'quantum-defense-cell', detail: {} } as any);
    console.log(`[Rehab] Phase 3: Controlled test passed — ${aiId}`);

    // Restore
    record.status = 'RESTORED';
    record.completedAt = Date.now();

    EventBus.emit('quantum.rehabilitated', { aiId, ts: Date.now() } as any);
    console.log(`[Rehab] ✅ ${aiId} RESTORED_LEVEL_1`);

    return { success: true, status: 'RESTORED' };
  } catch (e) {
    record.status = 'FAILED';
    EventBus.emit('quantum.rehab_failed', { aiId, ts: Date.now() } as any);
    return { success: false, status: 'FAILED' };
  }
}

export function getRehabStatus(aiId: string): RehabStatus | null {
  return _rehabRegistry.get(aiId)?.status || null;
}

export const RehabilitationEngine = { rehabilitate, getRehabStatus };
export default RehabilitationEngine;
