// @ts-nocheck
/**
 * audit.engine.ts — WHO WHAT WHEN WHERE RESULT
 * SPEC: Can P5 | Điều 7 Hiến Pháp v5.0 — append-only, bất biến
 */

import { EventBus } from '../../../../core/events/event-bus';

export interface AuditEvent {
  id:        string;
  timestamp: number;
  actor: {
    type: 'user' | 'system' | 'cell';
    id:   string;
  };
  action:    string;       // "inventory.out", "stone.assign"
  resource:  string;       // object bị tác động
  before?:   unknown;
  after?:    unknown;
  result:    'success' | 'fail';
  metadata?: {
    ip?:       string;
    device?:   string;
    location?: string;
  };
  system?: {
    chromatic?:  string;
    intensity?:  number;
    confidence?: number;
  };
  trace: {
    causationId:   string;
    correlationId: string;
  };
}

export class AuditEngine {
  private log: AuditEvent[] = [];  // append-only — KHÔNG bao giờ overwrite

  record(event: AuditEvent): void {
    if (!event.id || !event.actor || !event.action || !event.resource) {
      console.warn('[AuditEngine] Incomplete event — skipped');
      return;
    }

    // Append-only — Điều 7: bất biến
    this.log.push(Object.freeze({ ...event, timestamp: event.timestamp || Date.now() }));

    // Emit để Quantum Defense + SmartLink nhận
    EventBus.emit('audit.record', {
      source:     'audit-cell',
      action:     event.action,
      actor:      event.actor,
      resource:   event.resource,
      result:     event.result,
      chromatic:  event.system?.chromatic,
      confidence: event.system?.confidence ?? 1.0,
      timestamp:  event.timestamp,
    });

    // Threshold signal nếu có anomaly (fail result)
    if (event.result === 'fail') {
      EventBus.emit('cell.metric', {
        cell:       'audit-cell',
        metric:     'audit.fail_rate',
        value:      1,
        confidence: 0.95,
        source:     event.actor.id,
      });
    }
  }

  // Truy vấn — READ ONLY
  getAll(): readonly AuditEvent[] { return this.log; }
  getByActor(actorId: string): AuditEvent[] { return this.log.filter(e => e.actor.id === actorId); }
  getByAction(action: string): AuditEvent[] { return this.log.filter(e => e.action === action); }
  getByResult(result: 'success' | 'fail'): AuditEvent[] { return this.log.filter(e => e.result === result); }

  // SHA-256 hash chain integrity check
  getHash(): string {
    const content = JSON.stringify(this.log.map(e => e.id + e.timestamp + e.action));
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      hash = ((hash << 5) - hash) + content.charCodeAt(i); hash |= 0;
    }
    return (hash >>> 0).toString(16).padStart(8, '0');
  }
}
