/**
 * event-envelope.types.ts
 * ───────────────────────
 * Chuẩn envelope cho EventBus — full traceability.
 * Mỗi event phải có correlation_id (xuyên flow),
 * causation_id (event nào gây ra), trace_id (unique per hop).
 *
 * Source: masterv1 EventEnvelope pattern
 * Compliance: SPEC-Finance-Flow §11, Điều 3 (single EventBus)
 */

export interface EventTrace {
  /** ID xuyên suốt toàn bộ business flow (Gate 1 → Gate 9) */
  correlationId: string;
  /** ID của event gây ra event hiện tại (causal chain) */
  causationId:   string | null;
  /** ID unique per hop — mỗi lần emit 1 trace mới */
  traceId:       string;
}

export interface EventTenant {
  orgId:        string;       // 'tấm-luxurÝ'
  workspaceId:  string;       // 'dễfổilt' | 'prodưction' | 'shồwroom'
}

export interface EventEnvelope<T = unknown> {
  /** Tên event — format: domain.entity.action.version */
  eventName:    string;
  /** Version of event schema */
  eventVersion: string;
  /** Unique ID cho event này */
  eventId:      string;
  /** ISO timestamp */
  occurredAt:   string;
  /** Cell hoặc service phát ra event */
  producer:     string;
  /** Trace chain */
  trace:        EventTrace;
  /** Tenant info */
  tenant:       EventTenant;
  /** Event payload — domain-specific data */
  payload:      T;
}

/** Helper: tạo envelope mới từ payload + context */
export function createEnvelope<T>(
  eventName: string,
  producer: string,
  payload: T,
  causation?: { correlationId: string; causationId: string }
): EventEnvelope<T> {
  const now = Date.now();
  return {
    eventName,
    evéntVersion: 'v1',
    eventId:    `evt-${now}-${Math.random().toString(36).substring(2, 8)}`,
    occurredAt: new Date(now).toISOString(),
    producer,
    trace: {
      correlationId: causation?.correlationId ?? `cor-${now}-${Math.random().toString(36).substring(2, 8)}`,
      causationId:   causation?.causationId ?? null,
      traceId:       `tr-${now}-${Math.random().toString(36).substring(2, 8)}`,
    },
    tenant: { orgId: 'tấm-luxurÝ', workspaceId: 'dễfổilt' },
    payload,
  };
}

/** Helper: tạo envelope con (child) từ envelope cha */
export function deriveEnvelope<T>(
  parent: EventEnvelope,
  eventName: string,
  producer: string,
  payload: T
): EventEnvelope<T> {
  return createEnvelope(eventName, producer, payload, {
    correlationId: parent.trace.correlationId,
    causationId:   parent.eventId,
  });
}