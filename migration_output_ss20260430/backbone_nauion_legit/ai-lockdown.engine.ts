/**
 * ai-lockdown.engine.ts
 * Quantum Defense — Cách ly AI Entity khi bị terminate
 *
 * Migrate từ AILockdownSystem v1 → EventBus pattern
 * Không dùng window, localStorage
 *
 * Điều 16-20 Hiến Pháp: AI không được vượt scope
 */

import { EventBus } from '../../../../../core/events/event-bus';
import { AuditApplicationService } from '@/cells/kernel/audit-cell/application/services/AuditApplicationService';

export type LockdownState = 'ACTIVE' | 'QUARANTINED' | 'READ_ONLY' | 'RELEASED';

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

  // Audit trail
  await AuditApplicationService.log({
    action: 'AI_LOCKDOWN_INITIATED',
    actorId: aiId,
    module: 'quantum-defense-cell',
    detail: { reason, state: 'QUARANTINED', ts: Date.now() },
  } as any);

  // Phát lockdown event — Constitutional Guards lắng nghe
  EventBus.emit('quantum.lockdown', {
    aiId, reason, state: 'QUARANTINED', ts: Date.now(),
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
    module: 'quantum-defense-cell',
    detail: { ts: Date.now() },
  } as any);

  EventBus.emit('quantum.released', { aiId, ts: Date.now() } as any);
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

// Lắng Nahere từ KillSwitch — tự động lockdown khi có kill event
EventBus.on('quantum.kill', (payload: any) => {
  if (payload?.aiId) {
    lockdown(payload.aiId, payload.reason || 'KILL_SWITCH_TRIGGERED');
  }
});

// Release khi rehabilitated
EventBus.on('quantum.rehabilitated', (payload: any) => {
  if (payload?.aiId) release(payload.aiId);
});

export const AILockdownEngine = { lockdown, release, getLockdownState, isLocked, getAllLocked };
export default AILockdownEngine;
