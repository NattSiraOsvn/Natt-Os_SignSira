// @ts-nocheck — TODO: fix type errors, remove this pragma

/**
 * stone-cell — application/stone.usecase.ts
 * Sprint 2 | Tâm Luxury Natt-OS
 *
 * Subscribe: WIP_IN_PROGRESS (từ finishing-cell)
 * Emit:      WIP_STONE (sang polishing-cell)
 *
 * FLAT interface — KHÔNG có .payload, .trace, .type
 * FS-024: luôn đọc contract thật trước khi viết code
 */

import {
  StoneRecord, StoneType,
  createStoneRecord, addStoneItem, setStone, isStoneCompleted,
} from '../domain/stone.entity';
import { WipInProgressEvent, WipStoneEvent } from '../../../../governance/event-contracts/production-events';

// ─── Ports ───────────────────────────────────────────────────────────────────

export interface IStoneRepository {
  save(record: StoneRecord): Promise<void>;
  findById(id: string): Promise<StoneRecord | null>;
  findByLapId(lapId: string): Promise<StoneRecord | null>;
  findByOrderId(orderId: string): Promise<StoneRecord[]>;
}

export interface IStoneSheetAdapter {
  fetchStoneSpec(orderId: string): Promise<RawStoneSpec[]>;
}

export interface RawStoneSpec {
  stoneType:   StoneType;
  caratWeight: number;
  quantity:    number;
}

// ─── UseCase: ProcessWipInProgressUseCase ────────────────────────────────────

export class ProcessWipInProgressUseCase {
  constructor(
    private repo:    IStoneRepository,
    private adapter: IStoneSheetAdapter,
    private emit:    (event: WipStoneEvent) => Promise<void>,
  ) {}

  async execute(event: WipInProgressEvent): Promise<void> {
    const { lapId, orderId, workerId } = event;

    const stoneSpecs = await this.adapter.fetchStoneSpec(orderId);

    const record = createStoneRecord(lapId, orderId, workerId);
    for (const spec of stoneSpecs) {
      addStoneItem(record, spec.stoneType, spec.caratWeight, spec.quantity);
    }

    if (record.stones.length === 0) {
      record.status      = 'COMPLETED';
      record.completedAt = new Date();
      record.note        = 'NO_STONE_REQUIRED';
    }

    await this.repo.save(record);

    const outEvent: WipStoneEvent = {
      eventType:   'WIP_STONE',
      orderId,
      lapId,
      stage:       'G2',
      weightDaTam: record.stones.reduce((sum, s) => sum + s.caratWeight, 0),
      weightDaChu: 0,
      qcStatus:    'OK',
      thoIds:      [workerId],
      soLuongDa:   [record.stones.length],
    };

    await this.emit(outEvent);
  }
}

// ─── UseCase: SetStoneUseCase ─────────────────────────────────────────────────

export class SetStoneUseCase {
  constructor(
    private repo: IStoneRepository,
    private emit: (event: WipStoneEvent) => Promise<void>,
  ) {}

  async execute(recordId: string, stoneId: string): Promise<void> {
    const record = await this.repo.findById(recordId);
    if (!record) throw new Error(`[stone-cell] StoneRecord not found: ${recordId}`);

    setStone(record, stoneId);
    record.status = 'IN_PROGRESS';

    if (isStoneCompleted(record)) {
      record.status      = 'COMPLETED';
      record.completedAt = new Date();

      const outEvent: WipStoneEvent = {
        eventType:   'WIP_STONE',
        orderId:     record.orderId,
        lapId:       record.lapId,
        stage:       'G3',
        weightDaTam: record.stones.reduce((sum, s) => sum + s.caratWeight, 0),
        weightDaChu: 0,
        qcStatus:    'OK',
        thoIds:      [record.workerId],
        soLuongDa:   [record.stones.filter(s => s.status === 'SET').length],
      };

      await this.emit(outEvent);
    }

    await this.repo.save(record);
  }
}
