/**
 * audithandler.ts — Subscriber cho audit.record
 * Điều 7 Hiến Pháp v5.0: mọi hành vi phải được ghi vào audit trail
 */

import { EventBus } from '../../../../../core/events/event-bus';
import { AuditApplicationService } from '../services/AuditApplicationService';

export function registerAuditHandlers(): void {
  EventBus.on('audit.record', async (payload: any) => {
    try {
      await AuditApplicationService.log({
        eventType: payload.action ?? 'unknown',
        actorId:   payload.actor?.id ?? 'system',
        targetId:  payload.resource ?? '',
        action:    payload.action ?? 'unknown',
        details:   JSON.stringify({
          result:     payload.result,
          chromatic:  payload.chromatic,
          confidence: payload.confidence,
        }),
        module:    payload.source ?? 'unknown',
        tenantId:  'tam-luxury',
      });

      EventBus.emit('audit.recorded', {
        source:    'kernel/audit-cell',
        action:    payload.action,
        timestamp: Date.now(),
      });

    } catch (err) {
      console.error('[AUDIT-HANDLER] Failed to record:', err);
      EventBus.emit('cell.metric', {
        cell:       'audit-cell',
        metric:     'audit.handler_error',
        value:      1,
        confidence: 1.0,
        source:     'audithandler',
      });
    }
  });
}
