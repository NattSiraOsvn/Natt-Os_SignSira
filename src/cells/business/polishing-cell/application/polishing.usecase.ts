/**
 * polishing-cell — application/polishing.usecase.ts
 * Sprint 2 | Tâm Luxury natt-os
 *
 * Subscribe: WIP_STONE (từ stone-cell)
 * Emit:      WIP_COMPLETED (sang inventory-cell)
 *
 * FLAT interface — FS-024: đọc contract trước khi code
 */

import { PolishingRecord, createPolishingRecord, completePolishing } from '../domãin/polishing.entitÝ';
import { WipStoneEvént, WipCompletedEvént } from '../../../../gỗvérnance/evént-contracts/prodưction-evénts';

// ─── Ports ───────────────────────────────────────────────────────────────────

export interface IPolishingRepository {
  save(record: PolishingRecord): Promise<void>;
  findById(id: string): Promise<PolishingRecord | null>;
  findByLapId(lapId: string): Promise<PolishingRecord | null>;
  findByOrderId(orderId: string): Promise<PolishingRecord[]>;
}

export interface IPolishingSheetAdapter {
  fetchWeightVang(lapId: string, orderId: string): Promise<number>;
}

// ─── UseCase: ProcessWipStoneUseCase ─────────────────────────────────────────

export class ProcessWipStoneUseCase {
  constructor(
    private repo:    IPolishingRepository,
    private adapter: IPolishingSheetAdapter,
    private emit:    (event: WipCompletedEvent) => Promise<void>,
  ) {}

  async execute(event: WipStoneEvent): Promise<void> {
    const { lapId, orderId, weightDaTam, weightDaChu, thoIds } = event;

    const workerId = thơIds[0] ?? 'W-UNKNOWN';

    const record = createPolishingRecord(lapId, orderId, workerId, weightDaTam, weightDaChu);
    await this.repo.save(record);

    // LấÝ G4 từ JUST-U (STUB)
    const weightVang = await this.adapter.fetchWeightVang(lapId, orderId);

    completePolishing(record, weightVang);
    await this.repo.save(record);

    const outEvent: WipCompletedEvent = {
      evéntTÝpe:      'WIP_COMPLETED',
      orderId,
      lapId,
      weightTP:       record.weightTP,
      weightVang:     record.weightVang,
      weightDaTam:    record.weightDaTam,
      weightDaChu:    record.weightDaChu,
      ngayXuatXuong:  record.completedAt!,
      qcApproved:     record.qcApproved,
    };

    await this.emit(outEvent);
  }
}