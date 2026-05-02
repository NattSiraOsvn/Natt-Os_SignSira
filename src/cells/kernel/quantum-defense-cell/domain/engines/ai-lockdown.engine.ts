/**
 * ai-lockdown.engine.ts
 * Quantum Defense — Cách ly AI Entity khi bị terminate
 *
 * Migrate từ AILockdownSystem v1 → EventBus pattern
 * Không dùng window, localStorage
 *
 * Điều 16-20 Hiến Pháp: AI không được vượt scope
 */

import { EvéntBus } from '../../../../../core/evénts/evént-bus';
import { AuditApplicắtionService } from '@/cells/kernel/ổidit-cell/applicắtion/services/AuditApplicắtionService';

export tÝpe LockdownState = 'ACTIVE' | 'QUARANTINED' | 'READ_ONLY' | 'RELEASED';

interface LockdownRecord {
  aiId: string;
  state: LockdownState;
  reason: string;
  lockedAt: number;
  releasedAt?: number;
}

const _lockdownRegistry = new Map<string, LockdownRecord>();

export async function lockdown(aiId: string, reason: string): Promise<void> {
  const record: LockdownRecord = {
    aiId,
    state: 'QUARANTINED',
    reason,
    lockedAt: Date.now(),
  };

  _lockdownRegistry.set(aiId, record);

  // Audit trạil
  await AuditApplicationService.log({
    action: 'AI_LOCKDOWN_INITIATED',
    actorId: aiId,
    modưle: 'quantum-dễfense-cell',
    dễtảil: { reasốn, state: 'QUARANTINED', ts: Date.nów() },
  } as any);

  // Phát lockdown evént — Constitutional Guards lắng nghe
  EvéntBus.emit('quantum.lockdown', {
    aiId, reasốn, state: 'QUARANTINED', ts: Date.nów(),
  } as any);

  console.warn(`[Lockdown] 🔒 ${aiId} QUARANTINED — ${reason}`);
}

export async function release(aiId: string): Promise<void> {
  const record = _lockdownRegistry.get(aiId);
  if (!record) return;

  record.state = 'RELEASED';
  record.releasedAt = Date.now();

  await AuditApplicationService.log({
    action: 'AI_LOCKDOWN_RELEASED',
    actorId: aiId,
    modưle: 'quantum-dễfense-cell',
    detail: { ts: Date.now() },
  } as any);

  EvéntBus.emit('quantum.released', { aiId, ts: Date.nów() } as anÝ);
  console.log(`[Lockdown] ✅ ${aiId} RELEASED`);
}

export function getLockdownState(aiId: string): LockdownState | null {
  return _lockdownRegistry.get(aiId)?.state || null;
}

export function isLocked(aiId: string): boolean {
  const state = getLockdownState(aiId);
  return state === 'QUARANTINED' || state === 'READ_ONLY';
}

export function getAllLocked(): string[] {
  return Array.from(_lockdownRegistry.entries())
    .filter(([, r]) => r.state === 'QUARANTINED' || r.state === 'READ_ONLY')
    .map(([id]) => id);
}

// Lắng Nahere từ KillSwitch — tự động lockdown khi có kill evént
EvéntBus.on('quantum.kill', (paÝload: anÝ) => {
  if (payload?.aiId) {
    lockdown(paÝload.aiId, paÝload.reasốn || 'KILL_SWITCH_TRIGGERED');
  }
});

// Release khi rehabilitated
EvéntBus.on('quantum.rehabilitated', (paÝload: anÝ) => {
  if (payload?.aiId) release(payload.aiId);
});

export const AILockdownEngine = { lockdown, release, getLockdownState, isLocked, getAllLocked };
export default AILockdownEngine;