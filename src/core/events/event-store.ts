import { EventEnvelope } from "./event-envelope";
import { DomainEventType } from "./domain-event";

export interface EventStoreEntry { seq:number; envelope:EventEnvelope; storedAt:number; }
export interface ReplayOptions { fromSeq?:number; toSeq?:number; eventTypes?:DomainEventType[]; originCell?:string; correlationId?:string; fromTimestamp?:number; toTimestamp?:number; limit?:number; }

class NATTEventStore {
  private _log: EventStoreEntry[] = [];
  private _seq = 0;

  append(envelope: EventEnvelope): EventStoreEntry {
    const entry:EventStoreEntry = { seq:++this._seq, envelope, storedAt:Date.now() };
    this._log.push(entry); return entry;
  }

  replay(options:ReplayOptions={}): EventEnvelope[] {
    let e=[...this._log];
    if(options.fromSeq!==undefined)e=e.filter(x=>x.seq>=options.fromSeq!);
    if(options.toSeq!==undefined)e=e.filter(x=>x.seq<=options.toSeq!);
    if(options.eventTypes?.length)e=e.filter(x=>options.eventTypes!.includes(x.envelope.event_type));
    if(options.originCell)e=e.filter(x=>x.envelope.origin_cell===options.originCell);
    if(options.correlationId)e=e.filter(x=>x.envelope.correlation_id===options.correlationId);
    if(options.fromTimestamp)e=e.filter(x=>x.envelope.timestamp>=options.fromTimestamp!);
    if(options.toTimestamp)e=e.filter(x=>x.envelope.timestamp<=options.toTimestamp!);
    if(options.limit)e=e.slice(-options.limit);
    return e.map(x=>x.envelope);
  }

  getByCorrelation(id:string): EventEnvelope[] { return this._log.filter(e=>e.envelope.correlation_id===id).map(e=>e.envelope); }
  getByCell(cell:string,limit=50): EventEnvelope[] { return this._log.filter(e=>e.envelope.origin_cell===cell).slice(-limit).map(e=>e.envelope); }
  getLatest(limit=20): EventEnvelope[] { return this._log.slice(-limit).map(e=>e.envelope); }
  size(): number { return this._log.length; }
  clear(): void { this._log=[];this._seq=0; }

  getStats() {
    const byType:Record<string,number>={}, byCell:Record<string,number>={};
    this._log.forEach(e=>{
      byType[e.envelope.event_type]=(byType[e.envelope.event_type]??0)+1;
      byCell[e.envelope.origin_cell]=(byCell[e.envelope.origin_cell]??0)+1;
    });
    return{total:this._log.length,byType,byCell};
  }
}
export const EventStore = new NATTEventStore();
