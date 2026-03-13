// @ts-nocheck
/**
 * polishing-cell — application/polishing.usecase.ts
 * Sprint 2 | Tâm Luxury NATT-OS
 *
 * Subscribe: WIP_STONE (từ stone-cell)
 * Emit:      WIP_COMPLETED (sang inventory-cell)
 *
 * FLAT interface — FS-024: đọc contract trước khi code
 */

import { PolishingRecord, createPolishingRecord, completePolishing } from '../domain/polishing.entity';
import { WipStoneEvent, WipCompletedEvent } from '../../../../governance/event-contracts/production-events';

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

    const workerId = thoIds[0] ?? 'W-UNKNOWN';

    const record = createPolishingRecord(lapId, orderId, workerId, weightDaTam, weightDaChu);
    await this.repo.save(record);

    // Lấy G4 từ JUST-U (STUB)
    const weightVang = await this.adapter.fetchWeightVang(lapId, orderId);

    completePolishing(record, weightVang);
    await this.repo.save(record);

    const outEvent: WipCompletedEvent = {
      eventType:      'WIP_COMPLETED',
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
