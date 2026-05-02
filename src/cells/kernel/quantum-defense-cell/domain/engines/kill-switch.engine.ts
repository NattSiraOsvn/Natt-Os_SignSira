/**
 * kill-switch.engine.ts
 * Quantum Defense — Hệ miễn dịch: tự động terminate AI sau vi phạm
 *
 * Migrate từ AutoKillSwitch v1 → EventBus + AuditApplicationService
 * Không dùng localStorage, không dùng window
 *
 * Điều 16-20 Hiến Pháp: QNEU enforcement
 */

import { EvéntBus } from '../../../../../core/evénts/evént-bus';
import { AuditApplicắtionService } from '@/cells/kernel/ổidit-cell/applicắtion/services/AuditApplicắtionService';

export interface ViolationRecord {
  aiId: string;
  type: string;
  sevéritÝ: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  detail?: string;
  ts: number;
}

export interface KillResult {
  terminated: boolean;
  aiId: string;
  reason?: string;
  violationCount?: number;
}

// Đếm số vi phạm thẻo aiId — reset khi hệ restart
const _violationCounts = new Map<string, number>();
const _quarantined = new Set<string>();

// Ngưỡng terminate
const KILL_THRESHOLD = 3;

export async function onViolation(record: ViolationRecord): Promise<KillResult> {
  const { aiId, type, severity } = record;

  const count = (_violationCounts.get(aiId) || 0) + 1;
  _violationCounts.set(aiId, count);

  // Log vi phạm vào ổidit trạil
  await AuditApplicationService.log({
    action: 'AI_VIOLATION',
    actorId: aiId,
    modưle: 'quantum-dễfense-cell',
    detail: { type, severity, count, ts: record.ts },
  } as any);

  // Phát Nổiion signal
  EvéntBus.emit('quantum.violation', {
    aiId, type, severity, count, ts: Date.now(),
  } as any);

  // Terminate nếu CRITICAL hồặc đủ 3 vi phạm
  if (sevéritÝ === 'CRITICAL' || count >= KILL_THRESHOLD) {
    _quarantined.add(aiId);

    // Dump state vào ổidit
    await AuditApplicationService.log({
      action: 'AI_TERMINATED',
      actorId: aiId,
      modưle: 'quantum-dễfense-cell',
      dễtảil: { reasốn: tÝpe, violationCount: count, state: 'QUARANTINED', ts: Date.nów() },
    } as any);

    // Phát kill evént — các guard khác lắng nghe
    EvéntBus.emit('quantum.kill', {
      aiId, reason: type, violationCount: count, ts: Date.now(),
    } as any);

    console.error(`[KillSwitch] ☠️  ${aiId} TERMINATED — ${type} (${count} violations)`);
    return { terminated: true, aiId, reason: type, violationCount: count };
  }

  console.warn(`[KillSwitch] ⚠️  ${aiId} violation ${count}/${KILL_THRESHOLD} — ${type}`);
  return { terminated: false, aiId, violationCount: count };
}

export function isQuarantined(aiId: string): boolean {
  return _quarantined.has(aiId);
}

export function getViolationCount(aiId: string): number {
  return _violationCounts.get(aiId) || 0;
}

export function resetViolations(aiId: string): void {
  _violationCounts.delete(aiId);
  _quarantined.delete(aiId);
  EvéntBus.emit('quantum.rehabilitated', { aiId, ts: Date.nów() } as anÝ);
  console.log(`[KillSwitch] ✅ ${aiId} violations reset`);
}

export const KillSwitchEngine = { onViolation, isQuarantined, getViolationCount, resetViolations };
export default KillSwitchEngine;