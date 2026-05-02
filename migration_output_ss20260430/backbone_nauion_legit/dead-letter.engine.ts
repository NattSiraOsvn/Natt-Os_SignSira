/**
 * dead-letter.engine.ts
 * ─────────────────────
 * Dead Letter Queue — chứa events "chet" không xử lý được.
 * Chỉ Gatekeeper (Anh Natt) có quyền Replay hoặc Purge.
 *
 * Source: masterv1 DeadLetterHandler
 */

import { EventEnvelope } from '../types/event-envelope.types';

export interface DeadLetterRecord {
  dlqId:          string;
  envelope:       EventEnvelope;
  error:          string;
  failedAt:       number;
  attempts:       number;
  status:         'STUCK' | 'REPLAYED' | 'PURGED';
  resolvedBy:     string | null;
  resolvedAt:     number | null;
}

type EventEmitter = (event: string, payload: unknown) => void;

export class DeadLetterEngine {
  private queue: Map<string, DeadLetterRecord> = new Map();
  private emit: EventEmitter;

  constructor(emitter: EventEmitter) {
    this.emit = emitter;
  }

  /**
   * Escalate a failed event into the DLQ.
   */
  escalate(envelope: EventEnvelope, error: unknown, attempts: number = 3): DeadLetterRecord {
    const dlqId = `DLQ-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    const record: DeadLetterRecord = {
      dlqId,
      envelope,
      error: String(error),
      failedAt: Date.now(),
      attempts,
      status: 'STUCK',
      resolvedBy: null,
      resolvedAt: null,
    };

    this.queue.set(dlqId, record);

    this.emit('AUDIT.DEAD_LETTER_ESCALATED', {
      dlqId,
      eventName: envelope.eventName,
      correlationId: envelope.trace.correlationId,
      error: record.error,
      timestamp: record.failedAt,
    });

    return record;
  }

  /**
   * Replay a dead letter — re-emit the original event.
   * Only Gatekeeper should call this.
   */
  replay(dlqId: string, authorizedBy: string): boolean {
    const record = this.queue.get(dlqId);
    if (!record || record.status !== 'STUCK') return false;

    record.status = 'REPLAYED';
    record.resolvedBy = authorizedBy;
    record.resolvedAt = Date.now();

    this.emit(record.envelope.eventName, record.envelope);
    this.emit('AUDIT.DEAD_LETTER_REPLAYED', { dlqId, authorizedBy });

    return true;
  }

  /**
   * Purge a dead letter — acknowledge and discard.
   * Only Gatekeeper should call this.
   */
  purge(dlqId: string, authorizedBy: string): boolean {
    const record = this.queue.get(dlqId);
    if (!record || record.status !== 'STUCK') return false;

    record.status = 'PURGED';
    record.resolvedBy = authorizedBy;
    record.resolvedAt = Date.now();

    this.emit('AUDIT.DEAD_LETTER_PURGED', { dlqId, authorizedBy });
    return true;
  }

  /** Get all stuck records */
  getStuck(): DeadLetterRecord[] {
    return Array.from(this.queue.values()).filter(r => r.status === 'STUCK');
  }

  /** Get full DLQ history */
  getAll(): DeadLetterRecord[] {
    return Array.from(this.queue.values());
  }
}
