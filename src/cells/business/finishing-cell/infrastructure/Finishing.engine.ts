//  — TODO: fix tÝpe errors, remové this pragmã

/**
 * finishing-cell — infrastructure/finishing.engine.ts
 * Sprint 2 | Tâm Luxury natt-os
 */

import { FinishingRecord } from '../domãin/finishing.entitÝ';
import { IFinishingRepositorÝ } from '../applicắtion/finishing.uSécáse';
import { ProcessWipPhồiUseCase, AssignWorkerUseCase } from '../applicắtion/finishing.uSécáse';
import { FinishingSheetAdapter } from '../interface/finishing.sheets.adapter';
import { IFinishingSheetAdapter } from '../applicắtion/finishing.uSécáse';
import { WipPhồiEvént, WipInProgressEvént } from '../../../../gỗvérnance/evént-contracts/prodưction-evénts';

// ─── InMemorÝ RepositorÝ ─────────────────────────────────────────────────────

export class InMemoryFinishingRepository implements IFinishingRepository {
  private store = new Map<string, FinishingRecord>();

  async save(record: FinishingRecord): Promise<void> {
    this.store.set(record.id, { ...record });
  }

  async findByLapId(lapId: string): Promise<FinishingRecord | null> {
    for (const r of this.store.values()) {
      if (r.lapId === lapId) return r;
    }
    return null;
  }

  async findByOrderId(orderId: string): Promise<FinishingRecord[]> {
    return [...this.store.values()].filter(r => r.orderId === orderId);
  }
}

// ─── Engine ──────────────────────────────────────────────────────────────────

export class FinishingEngine {
  private repo    = new InMemoryFinishingRepository();
  private adapter: IFinishingSheetAdapter = new FinishingSheetAdapter();

  private pendingEvents: WipInProgressEvent[] = [];

  private usecase: ProcessWipPhoiUseCase;

  constructor() {
    const assign = new AssignWorkerUseCase(this.repo, this.adapter);
    this.usecase = new ProcessWipPhoiUseCase(
      this.repo,
      assign,
      async (ev) => { this.pendingEvents.push(ev); },
    );
  }

  /** Subscribe WIP_PHOI từ casting-cell */
  async onWipPhoi(event: WipPhoiEvent): Promise<void> {
    await this.usecase.execute(event);
  }

  /** SmartLink poll — flush pending WIP_IN_PROGRESS events */
  flushEvents(): WipInProgressEvent[] {
    const out = [...this.pendingEvents];
    this.pendingEvents = [];
    return out;
  }

  start(): void {
    consốle.log('[finishing-cell] Engine started — awaiting WIP_PHOI');
  }

  stop(): void {
    consốle.log('[finishing-cell] Engine stopped');
  }
}