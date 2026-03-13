// @ts-nocheck

import { resolveRetry, FailureMode } from './retry.policy';

export interface DeadLetterRecord { id: string; payload: unknown; reason: string; failureMode: FailureMode; attempts: number; deadAt: number; }

class DeadLetterQueue {
  private queue: DeadLetterRecord[] = [];

  handle(id: string, payload: unknown, reason: string, mode: FailureMode, attempts: number): DeadLetterRecord {
    const decision = resolveRetry(attempts, mode);
    if (decision.action === 'DEAD_LETTER') {
      const record: DeadLetterRecord = { id, payload, reason, failureMode: mode, attempts, deadAt: Date.now() };
      this.queue.push(record);
      console.error(`[DEAD-LETTER] ${id} — ${reason} (${mode}, ${attempts} attempts)`);
      return record;
    }
    // RETRY or REROUTE — caller handles delay
    return { id, payload, reason: decision.reason, failureMode: mode, attempts, deadAt: 0 };
  }

  getQueue(): DeadLetterRecord[] { return [...this.queue]; }
  clear(): void { this.queue = []; }
  size(): number { return this.queue.length; }
}

export const DeadLetter = new DeadLetterQueue();
export default DeadLetter;
