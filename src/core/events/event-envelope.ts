import { DomainEvent, DomainEventPayload, DomainEventType } from "./domain-event";

export interface EventEnvelope<T extends DomainEventPayload = any> {
  event_id: string;
  event_type: DomainEventType;
  causation_id?: string;
  correlation_id: string;
  origin_cell: string;
  origin_entity?: string;
  tenant_id: string;
  schema_version: string;
  timestamp: number;
  created_at: string;
  payload: T;
  trace?: { session_id?:string; user_id?:string; branch_code?:string; };
}

let _seq = 0;
function genId(type: string): string {
  _seq = (_seq + 1) % 999999;
  return `EVT-${type.substring(0,6).toUpperCase()}-${Date.now()}-${String(_seq).padStart(6,"0")}`;
}

export function createEnvelope<T extends DomainEventPayload>(
  event: DomainEvent<T>, originCell: string, correlationId?: string,
  options?: { causationId?:string; tenantId?:string; trace?:EventEnvelope["trace"]; }
): EventEnvelope<T> {
  return {
    event_id: genId(event.type), event_type: event.type,
    causation_id: options?.causationId,
    correlation_id: correlationId ?? genId("CORR"),
    origin_cell: originCell, tenant_id: options?.tenantId ?? "TAM_LUXURY",
    schema_version: "1.0", timestamp: Date.now(), created_at: new Date().toISOString(),
    payload: event.payload, trace: options?.trace,
  };
}

export function isEnvelope(obj: unknown): obj is EventEnvelope {
  return typeof obj==="object"&&obj!==null&&"event_id" in obj&&"event_type" in obj;
}
