// @ts-nocheck
/**
 * NATT-OS Event Identity Guard
 * Locks: #1 correlationId, #2 causation chain, #3 ULID event_id, #16 replay poison
 * ENFORCEMENT: ABSOLUTE
 */

// ── Lock #3: ULID-style time-sortable event_id ──
let _counter = 0;
export function generateEventId(prefix: string): string {
  const ts = Date.now().toString(36).toUpperCase().padStart(8, "0");
  const rnd = Math.random().toString(36).substring(2, 6).toUpperCase();
  const seq = (++_counter % 9999).toString().padStart(4, "0");
  return `${prefix.substring(0,4).toUpperCase()}-${ts}-${rnd}-${seq}`;
}

// ── Lock #1: correlationId REQUIRED ──
export function assertCorrelationId(correlationId: string | undefined, context: string): string {
  if (!correlationId || correlationId.trim() === "" || correlationId === "undefined") {
    throw new Error(
      `[EventIdentityGuard] VIOLATION: correlation_id REQUIRED in ${context}. ` +
      `A correlation_id must be provided by UEI or caller — never auto-generated silently.`
    );
  }
  return correlationId;
}

// ── Lock #2: causation chain propagation ──
export interface CausationContext {
  correlation_id: string;
  parent_event_id?: string;
}

export function buildCausationContext(
  parentEnvelopeOrId: string | { event_id: string; correlation_id: string } | null,
  flowCorrelationId?: string
): CausationContext {
  if (!parentEnvelopeOrId) {
    // Root event — correlationId MUST be provided
    if (!flowCorrelationId) throw new Error("[EventIdentityGuard] Root event requires flowCorrelationId");
    return { correlation_id: flowCorrelationId };
  }
  if (typeof parentEnvelopeOrId === "string") {
    // Parent event_id passed directly
    if (!flowCorrelationId) throw new Error("[EventIdentityGuard] causation requires flowCorrelationId");
    return { correlation_id: flowCorrelationId, parent_event_id: parentEnvelopeOrId };
  }
  return {
    correlation_id: parentEnvelopeOrId.correlation_id,
    parent_event_id: parentEnvelopeOrId.event_id,
  };
}

// ── Lock #16: QNEU replay poison guard ──
export function assertNotReplay(isReplay: boolean, guardName: string): void {
  if (isReplay) {
    throw new Error(
      `[ReplayPoisonGuard] BLOCKED: ${guardName} must not process replayed events. ` +
      `Check envelope.is_replay before calling QNEU imprint.`
    );
  }
}

export const EventIdentityGuard = { generateEventId, assertCorrelationId, buildCausationContext, assertNotReplay };
