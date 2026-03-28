/**
 * self-healing.engine.ts — L2 Intelligence
 * Khi anomaly.detected → tự retry event đã gãy
 *
 * Nguyên tắc:
 * - KHÔNG retry vô hạn — max 3 lần
 * - KHÔNG retry CRITICAL ngay — escalate trước
 * - Mỗi retry phải được audit
 * - Guard: retry key theo orderId + from
 */

import { EventBus } from '@/core/events/event-bus';
import { typedEmit } from '@/core/events/typed-eventbus';

const _retryCount: Map<string, number> = new Map();
const MAX_RETRY = 3;
const RETRY_DELAY_MS = 2000;

export function bootstrapSelfHealingEngine(): void {
  EventBus.on('anomaly.detected' as any, (env: any) => {
    const p = env?.payload ?? env;
    if (p?.type !== 'FLOW_BREAK') return;

    const key = `${p.from}:${p.orderId}`;
    const count = _retryCount.get(key) ?? 0;

    // CRITICAL — escalate thay vì retry
    if (p.severity === 'CRITICAL') {
      typedEmit('audit.record', {
        action:   'self-healing.escalated',
        actor:    { id: 'self-healing-engine', type: 'system' },
        resource: p.orderId,
        result:   'escalated',
        timestamp: Date.now(),
        trace:    { causationId: 'anomaly.detected', correlationId: p.orderId },
      }, 'self-healing');
      return;
    }

    // L3.5 DECISION — No subscriber → escalate ngay, không retry vô ích
    if (!EventBus.hasSubscriber(p.expected)) {
      console.warn(`[SelfHealing] No subscriber for '${p.expected}' — skip retry, escalate`);
      typedEmit('audit.record', {
        action:   'self-healing.escalated',
        actor:    { id: 'self-healing-engine', type: 'system' },
        resource: p.orderId,
        result:   'no-subscriber',
        timestamp: Date.now(),
        trace:    { causationId: 'anomaly.detected', correlationId: p.orderId, reason: 'NO_SUBSCRIBER' },
      }, 'self-healing');
      return;
    }

    // Duplicate guard — chỉ retry 1 lần tại 1 thời điểm
    if (_retryCount.has(key)) return;

    // Max retry guard
    if (count >= MAX_RETRY) {
      console.warn(`[SelfHealing] MAX RETRY reached for ${key} — giving up`);
      typedEmit('audit.record', {
        action:   'self-healing.exhausted',
        actor:    { id: 'self-healing-engine', type: 'system' },
        resource: p.orderId,
        result:   'fail',
        timestamp: Date.now(),
        trace:    { causationId: 'anomaly.detected', correlationId: p.orderId },
      }, 'self-healing');
      _retryCount.delete(key);
      return;
    }

    // Success cleanup — khi expected event đến, reset count
    const successUnsub = EventBus.on(p.expected as any, (env2: any) => {
      const ep = env2?.payload ?? env2;
      if (ep?.orderId === p.orderId || ep?.originCell === p.orderId) {
        _retryCount.delete(key);
        successUnsub();
      }
    });

    // Retry
    _retryCount.set(key, count + 1);
    console.info(`[SelfHealing] Retry ${count + 1}/${MAX_RETRY} — re-emit: ${p.from} | orderId: ${p.orderId}`);

    setTimeout(() => {
      // Audit retry
      typedEmit('audit.record', {
        action:   'self-healing.retry',
        actor:    { id: 'self-healing-engine', type: 'system' },
        resource: p.orderId,
        result:   'retry',
        timestamp: Date.now(),
        trace:    { causationId: 'anomaly.detected', correlationId: p.orderId },
      }, 'self-healing');

      // Re-emit event gãy
      EventBus.emit(p.from, {
        orderId:  p.orderId,
        retry:    true,
        retryCount: count + 1,
        source:   'self-healing-engine',
        ts:       Date.now(),
      }, 'self-healing');
    }, RETRY_DELAY_MS * (count + 1)); // Exponential backoff nhẹ
  });

  console.info('[SelfHealingEngine] L2 Intelligence active — max retry: ' + MAX_RETRY);
}
