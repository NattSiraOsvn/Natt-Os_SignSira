/**
 * Natt-OS Event Bus — with all 16 guards integrated
 * v1.1: thêm on/emit aliases để compatible với engine pattern
 */
import { EventEnvelope, createEnvelope } from "./event-envelope";
import { DomainEvent, DomainEventPayload, DomainEventType } from "./domain-event";
import { EventStore } from "./event-store";
import { IdempotencyGuard, BackPressureGuard } from "../guards/eventbus.guard";
import { LoopDetector } from "../flow/loop-detector";
import { SemanticEventGuard } from "../guards/business-graph.guard";

export type EventHandler<T extends DomainEventPayload = any> = (envelope: EventEnvelope<T>) => void | Promise<void>;
export interface Subscription { id:string; eventType:DomainEventType|"*"; handler:EventHandler; subscriberCell:string; }

const _processedIds = new Set<string>();

class NATTEventBus {
  // ── V5 RUNTIME HOOK (Condition 4) ─────────────────────────────────────
  private _traceEmit(eventType: string, cell: string): void {
    try {
      const { recordHistory } = require("../../cells/kernel/monitor-cell/domain/services/flow-chain.engine");
      recordHistory({ timestamp: Date.now(), eventType, cell, action: "emit" });
    } catch { /* silent */ }
  }

  private _subs: Subscription[] = [];
  private _dead: Array<{envelope:EventEnvelope;error:string;at:number}> = [];
  private _count = 0;

  subscribe<T extends DomainEventPayload>(
    eventType: DomainEventType|"*", handler: EventHandler<T>, subscriberCell: string
  ): () => void {
    const sub: Subscription = {
      id: `SUB-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
      eventType, handler, subscriberCell,
    };
    this._subs.push(sub);
    return () => { this._subs = this._subs.filter(s => s.id !== sub.id); };
  }

  publish<T extends DomainEventPayload>(
    event: DomainEvent<T>,
    originCell: string,
    correlationId: string,
    options?: Parameters<typeof createEnvelope>[3]
  ): EventEnvelope<T> {
    SemanticEventGuard.assertSemanticEvent(event.type);
    const envelope = createEnvelope(event, originCell, correlationId, options);
    if (!IdempotencyGuard.check(envelope)) return envelope;
    LoopDetector.register(envelope);
    LoopDetector.checkDepth(envelope);
    EventStore.append(envelope);
    _processedIds.add(envelope.event_id);
    this._count++;
    this._dispatch(envelope);
    return envelope;
  }

  // ── on/emit aliases — engine-friendly API ─────────────────
  // Cho phép engines dùng eventBus.on('event', handler) thay vì subscribe()
  // L3.5 — Decision Engine support
  hasSubscriber(eventType: string): boolean {
    return this._subs.some(s => s.eventType === eventType || s.eventType === '*');
  }

  on(eventType: string, handler: (payload: any) => void): () => void {
    return this.subscribe(
      eventType as DomainEventType,
      (envelope) => handler(envelope.payload ?? envelope),
      'engine-listener'
    );
  }

  emit(eventType: string, payload: any, causedBy?: string): void {
    this._traceEmit(eventType, 'engine-emitter');
    this.publish(
      { type: eventType as DomainEventType, payload },
      'engine-emitter',
      `emit-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
      { causationId: causedBy }
    );
  }
  // ── end aliases ────────────────────────────────────────────

  replay(envelopes: EventEnvelope[]): void {
    for (const original of envelopes) {
      const replayed = { ...original, is_replay: true };
      const matched = this._subs.filter(s =>
        (s.eventType === "*" || s.eventType === replayed.event_type) &&
        s.subscriberCell !== "qneu-bridge"
      );
      for (const sub of matched) {
        try { sub.handler(replayed); } catch(err) {
          console.warn(`[EventBus.replay] ${replayed.event_type} → ${sub.subscriberCell}: ${err}`);
        }
      }
    }
  }

  private async _dispatch(envelope: EventEnvelope): Promise<void> {
    const matched = this._subs.filter(s => s.eventType === "*" || s.eventType === envelope.event_type);
    for (const sub of matched) {
      const start = Date.now();
      try {
        await sub.handler(envelope);
        BackPressureGuard.recordLatency(sub.subscriberCell, Date.now() - start);
      } catch(err) {
        this._dead.push({ envelope, error: String(err), at: Date.now() });
        console.warn(`[EventBus] Dead letter: ${envelope.event_type} → ${sub.subscriberCell}: ${err}`);
      }
    }
  }

  getDeadLetters() { return [...this._dead]; }
  getPublishCount() { return this._count; }
  getSubscriptionCount() { return this._subs.length; }
  getSubscriptions() { return this._subs.map(s => ({ id:s.id, eventType:s.eventType, subscriberCell:s.subscriberCell })); }
  clearDeadLetters() { this._dead = []; }
  getBackPressureStats() { return BackPressureGuard.getStats(); }
}

export const EventBus = new NATTEventBus();
