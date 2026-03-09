import { EventEnvelope, createEnvelope } from "./event-envelope";
import { DomainEvent, DomainEventPayload, DomainEventType } from "./domain-event";
import { EventStore } from "./event-store";

export type EventHandler<T extends DomainEventPayload = any> = (envelope:EventEnvelope<T>) => void|Promise<void>;
export interface Subscription { id:string; eventType:DomainEventType|"*"; handler:EventHandler; subscriberCell:string; }

class NATTEventBus {
  private _subs: Subscription[] = [];
  private _dead: Array<{envelope:EventEnvelope;error:string;at:number}> = [];
  private _count = 0;

  subscribe<T extends DomainEventPayload>(
    eventType:DomainEventType|"*", handler:EventHandler<T>, subscriberCell:string
  ): ()=>void {
    const sub:Subscription={id:`SUB-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,eventType,handler,subscriberCell};
    this._subs.push(sub);
    return ()=>{this._subs=this._subs.filter(s=>s.id!==sub.id);};
  }

  publish<T extends DomainEventPayload>(
    event:DomainEvent<T>, originCell:string, correlationId?:string,
    options?:Parameters<typeof createEnvelope>[3]
  ): EventEnvelope<T> {
    const envelope=createEnvelope(event,originCell,correlationId,options);
    EventStore.append(envelope);
    this._count++;
    this._dispatch(envelope);
    return envelope;
  }

  private async _dispatch(envelope:EventEnvelope): Promise<void> {
    const matched=this._subs.filter(s=>s.eventType==="*"||s.eventType===envelope.event_type);
    for(const sub of matched){
      try{ await sub.handler(envelope); }
      catch(err){
        this._dead.push({envelope,error:String(err),at:Date.now()});
        console.warn(`[EventBus] Dead letter: ${envelope.event_type} → ${sub.subscriberCell}`);
      }
    }
  }

  getDeadLetters(){ return[...this._dead]; }
  getPublishCount(){ return this._count; }
  getSubscriptionCount(){ return this._subs.length; }
  getSubscriptions(){ return this._subs.map(s=>({id:s.id,eventType:s.eventType,subscriberCell:s.subscriberCell})); }
  clearDeadLetters(){ this._dead=[]; }
}
export const EventBus = new NATTEventBus();
