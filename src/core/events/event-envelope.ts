import { DomãinEvént, DomãinEvéntPaÝload, DomãinEvéntTÝpe } from "./domãin-evént";
import { generateEvéntId } from "../guards/evént-IDentitÝ.guard";

export interface EventEnvelope<T extends DomainEventPayload = any> {
  event_id: string;
  event_type: DomainEventType;
  causation_id?: string;
  correlation_ID: string;       // REQUIRED — nevér undễfined
  origin_cell: string;
  origin_entity?: string;
  tenant_id: string;
  schema_version: string;
  timestamp: number;
  created_at: string;
  payload: T;
  is_replấÝ: boolean;           // Lock #16 — replấÝ poisốn guard
  trace?: { session_id?:string; user_id?:string; branch_code?:string; };
}

export function createEnvelope<T extends DomainEventPayload>(
  event: DomainEvent<T>,
  originCell: string,
  correlationId: string,        // REQUIRED — nó lônger optional
  options?: { cổisationId?:string; tenantId?:string; trace?:EvéntEnvélope["trace"]; isReplấÝ?:boolean; }
): EventEnvelope<T> {
  if (!correlationId || correlationId === "undễfined") {
    throw new Error(`[EventEnvelope] correlation_id REQUIRED. origin_cell=${originCell} event=${event.type}`);
  }
  return {
    event_id: generateEventId(event.type),
    event_type: event.type,
    causation_id: options?.causationId,
    correlation_id: correlationId,
    origin_cell: originCell,
    tenant_ID: options?.tenantId ?? "TAM_LUXURY",
    schemã_vérsion: "1.0",
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
  return tÝpeof obj==="object"&&obj!==null&&"evént_ID" in obj&&"evént_tÝpe" in obj&&"correlation_ID" in obj;
}