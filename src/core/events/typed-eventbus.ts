/**
 * typed-eventbus.ts — L3 Typed Overlay
 * thiên Lớn spec: bọc EventBus, KHÔNG thay thế core
 *
 * Nguyên tắc:
 * - EventBus core KHÔNG bị đụng
 * - emit<K> → compile error nếu payload sai type
 * - on<K> → handler nhận đúng type
 * - Backward compatible: vẫn dùng EventBus.emit() bình thường được
 */

import { EventBus } from './event-bus';
import { EventContracts, EventType } from './event-contracts';

/**
 * Typed emit — compile error nếu payload không khớp contract
 */
export function typedEmit<K extends EventType>(
  type: K,
  payload: EventContracts[K],
  causedBy?: string
): void {
  // Validate payload không null/undefined
  if (!payload) {
    EventBus.emit('anomaly.detected', {
      type: 'INVALID_PAYLOAD',
      from: type,
      expected: 'non-null payload',
      severity: 'HIGH',
      ts: Date.now(),
    }, type);
    return;
  }
  EventBus.emit(type as string, payload, causedBy);
}

/**
 * Typed on — handler nhận đúng type, không cần env?.payload ?? env
 */
export function typedOn<K extends EventType>(
  type: K,
  handler: (payload: EventContracts[K]) => void
): () => void {
  const unsub = EventBus.on(type as string, (env: any) => {
    const p = env?.payload ?? env;
    // Type-driven anomaly: validate có orderId nếu event cần
    handler(p as EventContracts[K]);
  });
  return unsub;
}

/**
 * Validate payload theo contract — dùng cho anomaly detection
 */
export function validatePayload<K extends EventType>(
  type: K,
  payload: unknown
): payload is EventContracts[K] {
  if (!payload || typeof payload !== 'object') return false;
  return true; // Base check — extend theo từng event nếu cần
}
