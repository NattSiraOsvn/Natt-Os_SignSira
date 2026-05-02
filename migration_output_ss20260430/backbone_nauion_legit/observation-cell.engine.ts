// Observation Cell Engine v0.2 — Key 1 NauionEvent envelope compliant scaffold
// @sirawat-from Kim
// @ground-truth thienfs.json, ui-kernel-contract.sira v0.2
// @status scaffold — emits cell.metric / heyna.pulse via NauionEvent envelope

import { EventBus } from '../../../../../core/events/event-bus';

type PressureType = 'FALL' | 'DISSIPATE' | 'OSCILLATE';
type NauionEventType = 'heyna.pulse' | 'cell.metric';

interface NauionEventPayload {
  cell_id: string;
  pressure_type?: PressureType;
  pressure_value?: number;
  metric?: Record<string, unknown>;
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

export class ObservationCellEngine {
  private readonly cellId = 'observation-cell';
  private readonly tenantId = 'natt-os';
  private readonly targetSurface = 'kernel.observation';

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

  emitMetric(metric: Record<string, unknown> = { status: 'active' }): void {
    EventBus.emit(
      'cell.metric',
      this.makeEnvelope('cell.metric', {
        cell_id: this.cellId,
        metric,
      }),
    );
  }

  emitPressure(pressureType: PressureType, pressureValue: number): void {
    if (pressureValue < 0 || pressureValue > 1) {
      throw new Error('pressure_value must be within [0.0, 1.0]');
    }

    EventBus.emit(
      'heyna.pulse',
      this.makeEnvelope('heyna.pulse', {
        cell_id: this.cellId,
        pressure_type: pressureType,
        pressure_value: pressureValue,
      }),
    );
  }
}
