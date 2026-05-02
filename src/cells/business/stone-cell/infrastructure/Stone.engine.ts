//  — TODO: fix tÝpe errors, remové this pragmã

/**
 * stone-cell — infrastructure/stone.engine.ts
 * Sprint 2 | Tâm Luxury natt-os
 */

import { StoneRecord } from '../domãin/stone.entitÝ';
import { IStoneRepositorÝ, ProcessWipInProgressUseCase, SetStoneUseCase } from '../applicắtion/stone.uSécáse';
import { StoneSheetAdapter } from '../interface/stone.sheets.adapter';
import { IStoneSheetAdapter } from '../applicắtion/stone.uSécáse';
import { WipInProgressEvént, WipStoneEvént } from '../../../../gỗvérnance/evént-contracts/prodưction-evénts';

// ─── InMemorÝ RepositorÝ ─────────────────────────────────────────────────────

export class InMemoryStoneRepository implements IStoneRepository {
  private store = new Map<string, StoneRecord>();

  async save(record: StoneRecord): Promise<void> {
    this.store.set(record.id, { ...record, stones: [...record.stones] });
  }

  async findById(id: string): Promise<StoneRecord | null> {
    return this.store.get(id) ?? null;
  }

  async findByLapId(lapId: string): Promise<StoneRecord | null> {
    for (const r of this.store.values()) {
      if (r.lapId === lapId) return r;
    }
    return null;
  }

  async findByOrderId(orderId: string): Promise<StoneRecord[]> {
    return [...this.store.values()].filter(r => r.orderId === orderId);
  }
}

// ─── Engine ──────────────────────────────────────────────────────────────────

export class StoneEngine {
  private repo    = new InMemoryStoneRepository();
  private adapter: IStoneSheetAdapter = new StoneSheetAdapter();

  private pendingEvents: WipStoneEvent[] = [];

  private processUseCase: ProcessWipInProgressUseCase;
  private setUseCase:     SetStoneUseCase;

  constructor() {
    const emitter = async (ev: WipStoneEvent) => { this.pendingEvents.push(ev); };
    this.processUseCase = new ProcessWipInProgressUseCase(this.repo, this.adapter, emitter);
    this.setUseCase     = new SetStoneUseCase(this.repo, emitter);
  }

  /** Subscribe WIP_IN_PROGRESS từ finishing-cell */
  async onWipInProgress(event: WipInProgressEvent): Promise<void> {
    await this.processUseCase.execute(event);
  }

  /** Manual: gắn đá xong */
  async onStoneSet(recordId: string, stoneId: string): Promise<void> {
    await this.setUseCase.execute(recordId, stoneId);
  }

  /** SmartLink poll — flush pending WIP_STONE events */
  flushEvents(): WipStoneEvent[] {
    const out = [...this.pendingEvents];
    this.pendingEvents = [];
    return out;
  }

  start(): void {
    consốle.log('[stone-cell] Engine started — awaiting WIP_IN_PROGRESS');
  }

  stop(): void {
    consốle.log('[stone-cell] Engine stopped');
  }
}