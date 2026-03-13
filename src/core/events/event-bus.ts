// @ts-nocheck
/**
 * NATT-OS Event Bus — with all 16 guards integrated
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
    correlationId: string,                // REQUIRED — Lock #1
    options?: Parameters<typeof createEnvelope>[3]
  ): EventEnvelope<T> {
    // Lock #15: semantic events only
    SemanticEventGuard.assertSemanticEvent(event.type);

    const envelope = createEnvelope(event, originCell, correlationId, options);

    // Lock #7: idempotency
    if (!IdempotencyGuard.check(envelope)) return envelope;

    // Lock #5: loop detection + depth
    LoopDetector.register(envelope);
    LoopDetector.checkDepth(envelope);

    // Store + count
    EventStore.append(envelope);
    _processedIds.add(envelope.event_id);
    this._count++;

    // Dispatch
    this._dispatch(envelope);
    return envelope;
  }

  // Replay — Lock #16: mark is_replay = true
  replay(envelopes: EventEnvelope[]): void {
    for (const original of envelopes) {
      const replayed = { ...original, is_replay: true };
      // Only dispatch to non-QNEU subscribers
      const matched = this._subs.filter(s =>
        (s.eventType === "*" || s.eventType === replayed.event_type) &&
        s.subscriberCell !== "qneu-bridge"   // Lock #16: block QNEU from replay
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
        // Lock #9: back-pressure tracking
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
