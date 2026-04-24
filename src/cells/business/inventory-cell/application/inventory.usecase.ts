/**
 * inventory-cell — application/inventory.usecase.ts
 * Sprint 2 | Tâm Luxury Natt-OS
 * Subscribe: WIP_COMPLETED → Emit: STOCK_ENTRY_CREATED
 * FLAT interface — FS-024
 * TR-005: block nếu qcApproved = false
 */

import { StockEntry, createStockEntry } from '../domain/inventory.entity';
import { WipCompletedEvent, StockEntryCreatedEvent } from '../../../../governance/event-contracts/production-events';

export interface IInventoryRepository {
  save(entry: StockEntry): Promise<void>;
  findById(id: string): Promise<StockEntry | null>;
  findByOrderId(orderId: string): Promise<StockEntry[]>;
}

export class ProcessWipCompletedUseCase {
  constructor(
    private repo: IInventoryRepository,
    private emit: (event: StockEntryCreatedEvent) => Promise<void>,
  ) {}

  async execute(event: WipCompletedEvent): Promise<void> {
    const { orderId, lapId, weightTP, weightVang, weightDaTam, weightDaChu, ngayXuatXuong, qcApproved, totalCost154 } = event;

    if (!qcApproved) {
      throw new Error(`[inventory-cell] BLOCK: qcApproved=false — orderId=${orderId}`);
    }

    const entry = createStockEntry(
      orderId, lapId,
      weightTP, weightVang, weightDaTam, weightDaChu,
      ngayXuatXuong, totalCost154,
    );

    await this.repo.save(entry);

    const outEvent: StockEntryCreatedEvent = {
      eventType: 'STOCK_ENTRY_CREATED',
      entryId:   entry.entryId,
      orderId,
      lapId,
      weightTP,
      entryDate: entry.entryDate,
    };

    await this.emit(outEvent);
  }
}
