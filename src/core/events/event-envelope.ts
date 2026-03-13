// @ts-nocheck
import { DomainEvent, DomainEventPayload, DomainEventType } from "./domain-event";
import { generateEventId } from "../guards/event-identity.guard";

export interface EventEnvelope<T extends DomainEventPayload = any> {
  event_id: string;
  event_type: DomainEventType;
  causation_id?: string;
  correlation_id: string;       // REQUIRED — never undefined
  origin_cell: string;
  origin_entity?: string;
  tenant_id: string;
  schema_version: string;
  timestamp: number;
  created_at: string;
  payload: T;
  is_replay: boolean;           // Lock #16 — replay poison guard
  trace?: { session_id?:string; user_id?:string; branch_code?:string; };
}

export function createEnvelope<T extends DomainEventPayload>(
  event: DomainEvent<T>,
  originCell: string,
  correlationId: string,        // REQUIRED — no longer optional
  options?: { causationId?:string; tenantId?:string; trace?:EventEnvelope["trace"]; isReplay?:boolean; }
): EventEnvelope<T> {
  if (!correlationId || correlationId === "undefined") {
    throw new Error(`[EventEnvelope] correlation_id REQUIRED. origin_cell=${originCell} event=${event.type}`);
  }
  return {
    event_id: generateEventId(event.type),
    event_type: event.type,
    causation_id: options?.causationId,
    correlation_id: correlationId,
    origin_cell: originCell,
    tenant_id: options?.tenantId ?? "TAM_LUXURY",
    schema_version: "1.0",
    timestamp: Date.now(),
    created_at: new Date().toISOString(),
    payload: event.payload,
    is_replay: options?.isReplay ?? false,
    trace: options?.trace,
  };
}

export function createReplayEnvelope(original: EventEnvelope): EventEnvelope {
  return { ...original, is_replay: true };
}

export function isEnvelope(obj: unknown): obj is EventEnvelope {
  return typeof obj==="object"&&obj!==null&&"event_id" in obj&&"event_type" in obj&&"correlation_id" in obj;
}
