// Audit Cell Engine v0.2 — Key 1 NauionEvent envelope compliant scaffold
// @sirawat-from Kim
// @ground-truth thienfs.json, ui-kernel-contract.sira v0.2
// @status scaffold — emits NauionEvent envelope, closure remains locked

import { EventBus } from '../../../../../core/events/event-bus';

type NauionEventType = 'audit.record' | 'cell.metric';

interface NauionEventPayload {
  cell_id: string;
  metric?: Record<string, unknown>;
  audit?: {
    event: string;
    data: Record<string, unknown>;
  };
  state_ref?: string;
  sirasign_ref?: string;
}

interface NauionEvent {
  schema_version: 'nauion.event.v0.2';
  event_id: string;
  event_type: NauionEventType;
  tenant_id: string;
  source_cell: string;
  target_surface: string;
  trace_id: string;
  span_id: string;
  causation_id: string;
  correlation_id?: string;
  emitted_at: number;
  received_at?: number;
  payload: NauionEventPayload;
}

export class AuditCellEngine {
  private readonly cellId = 'audit-cell';
  private readonly tenantId = 'natt-os';
  private readonly targetSurface = 'kernel.audit';

  private makeId(kind: string): string {
    return `${this.cellId}-${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }

  private makeEnvelope(
    eventType: NauionEventType,
    payload: NauionEventPayload,
    causationId?: string,
  ): NauionEvent {
    const now = Date.now();
    const eventId = this.makeId(eventType);
    const cause = causationId ?? eventId;

    return {
      schema_version: 'nauion.event.v0.2',
      event_id: eventId,
      event_type: eventType,
      tenant_id: this.tenantId,
      source_cell: this.cellId,
      target_surface: this.targetSurface,
      trace_id: this.makeId('trace'),
      span_id: this.makeId('span'),
      causation_id: cause,
      emitted_at: now,
      payload,
    };
  }

  // Ghi nhận audit entry và phát tín hiệu theo NauionEvent envelope v0.2.
  recordAudit(event: string, data: Record<string, unknown>): void {
    const causationId = this.makeId('audit-cause');

    EventBus.emit(
      'audit.record',
      this.makeEnvelope(
        'audit.record',
        {
          cell_id: this.cellId,
          audit: { event, data },
        },
        causationId,
      ),
    );

    EventBus.emit(
      'cell.metric',
      this.makeEnvelope(
        'cell.metric',
        {
          cell_id: this.cellId,
          metric: {
            status: 'active',
            audit_count: 0, // closure locked until ground truth counter exists
          },
        },
        causationId,
      ),
    );
  }
}
