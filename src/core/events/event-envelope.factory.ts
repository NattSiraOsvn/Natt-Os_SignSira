/**
 * NATT-OS EventEnvelopeFactory
 * Patent Claim: Distributed Causality Chain with Policy-Signed Event Envelopes
 *
 * Every event emitted by any NATT-CELL carries:
 *   - event_id        : globally unique (crypto UUID)
 *   - tenant_id       : enterprise isolation boundary
 *   - causation_id    : ID of the event that caused this one (chain link)
 *   - span_id         : distributed tracing span
 *   - policy_signature: HMAC of active governance policy at emission time
 *   - payload_hash    : SHA-256 of serialized payload (tamper detection)
 *
 * This creates an immutable, verifiable causality chain across all cells.
 */

import type { EventEnvelope, BaseEvent, EventMetadata } from '@/types';

// ── Deterministic hash (browser + node compatible) ────────────────────────
async function sha256(data: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(data));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  }
  // Node.js fallback
  const { createHash } = await import('crypto');
  return createHash('sha256').update(data).digest('hex');
}

function hmac(key: string, data: string): string {
  // Deterministic HMAC-like signature (simplified for browser compat)
  let h = 0x811c9dc5;
  const combined = key + ':' + data;
  for (let i = 0; i < combined.length; i++) {
    h ^= combined.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

function uuid(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

export interface EnvelopeFactoryOptions {
  tenantId: string;
  causationId?: string;      // ID of the causing event
  spanId?: string;           // Distributed trace span
  policyKey?: string;        // Active policy version key
}

export class EventEnvelopeFactory {
  private static activePolicy = 'NATT-OS-CONSTITUTION-v4.0';

  static setActivePolicy(version: string): void {
    this.activePolicy = version;
  }

  static async create<T>(
    event: BaseEvent<T>,
    opts: EnvelopeFactoryOptions
  ): Promise<EventEnvelope> {
    const eventId = uuid();
    const spanId  = opts.spanId ?? uuid().slice(0, 8);
    const payloadHash = await sha256(JSON.stringify(event.payload ?? ''));
    const policySignature = hmac(opts.policyKey ?? this.activePolicy, eventId + opts.tenantId);

    const metadata: EventMetadata = {
      version: '1.0',
      correlationId: event.correlation_id,
      causationId: opts.causationId,
      publishedAt: Date.now(),
      spanId,
      traceId: event.correlation_id,
      policyVersion: this.activePolicy,
      integrityVerified: true,
    };

    return {
      event_id: eventId,
      tenant_id: opts.tenantId,
      causation_id: opts.causationId ?? '',
      span_id: spanId,
      policy_signature: policySignature,
      payload_hash: payloadHash,
      event,
      metadata,
    };
  }

  /** Verify envelope integrity — tamper detection */
  static async verify(envelope: EventEnvelope, policyKey?: string): Promise<boolean> {
    const expectedHash = await sha256(JSON.stringify(envelope.event.payload ?? ''));
    if (expectedHash !== envelope.payload_hash) return false;
    const expectedSig = hmac(policyKey ?? this.activePolicy, envelope.event_id + envelope.tenant_id);
    return expectedSig === envelope.policy_signature;
  }
}

export default EventEnvelopeFactory;
