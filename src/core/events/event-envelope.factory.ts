//  — TODO: fix type errors, remove this pragma

// — pending proper fix
import type { CellEvent } from "@/cells/shared-kernel/shared.types";

export interface EventEnvelope<T = unknown> extends CellEvent<T> {
  version: string;
  schema: string;
  traceId: string;
  retryCount: number;
  ttl: number;
  compressed: boolean;
}

let _sequence = 0;

export const EventEnvelopeFactory = {
  create: <T>(
    type: string,
    sourceCellId: string,
    payload: T,
    opts: { targetCellId?: string; correlationId?: string; ttl?: number } = {}
  ): EventEnvelope<T> => ({
    id:            `EVT-${Date.now()}-${(++_sequence).toString().padStart(6, "0")}`,
    type,
    sourceCellId,
    targetCellId:  opts.targetCellId,
    payload,
    timestamp:     Date.now(),
    correlationId: opts.correlationId ?? `CORR-${Date.now()}`,
    version:       "1.0",
    schema:        `natt-os.${type.toLowerCase().replace(/\./g, "_")}`,
    traceId:       `TRACE-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    retryCount:    0,
    ttl:           opts.ttl ?? 30_000,
    compressed:    false,
  }),

  reply: <T>(original: EventEnvelope<unknown>, payload: T): EventEnvelope<T> =>
    EventEnvelopeFactory.create(
      `${original.type}.reply`,
      original.targetCellId ?? "SYSTEM",
      payload,
      { targetCellId: original.sourceCellId, correlationId: original.correlationId }
    ),

  isExpired: (envelope: EventEnvelope): boolean =>
    Date.now() - envelope.timestamp > envelope.ttl,

  withRetry: <T>(envelope: EventEnvelope<T>): EventEnvelope<T> => ({
    ...envelope,
    retryCount: envelope.retryCount + 1,
    timestamp: Date.now(),
  }),
};

export interface EnvelopeFactoryOptions {
  targetCellId?: string; correlationId?: string; ttl?: number;
}
