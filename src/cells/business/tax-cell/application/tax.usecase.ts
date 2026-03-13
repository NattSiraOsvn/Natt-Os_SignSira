// @ts-nocheck
/**
 * tax-cell — application/tax.usecase.ts
 * Sprint 3 | Tâm Luxury NATT-OS
 *
 * Enforce: TR-001, TR-002, TR-005
 * FLAT interface — FS-024
 */

import { CostAccumulation, JournalEntry, createCostAccumulation, addJournalEntry } from '../domain/tax.entity';
import { WipCompletedEvent, DustRecoveredEvent, StockEntryCreatedEvent } from '../../../../governance/event-contracts/production-events';

export interface ITaxRepository {
  save(acc: CostAccumulation): Promise<void>;
  findByOrderId(orderId: string): Promise<CostAccumulation | null>;
  findByPeriod(periodId: string): Promise<CostAccumulation[]>;
}

// ─── UseCase: AccumulateLaborCostUseCase ──────────────────────────────────────
// TR-001: ghi nhận nhân công vào TK154

export class AccumulateLaborCostUseCase {
  constructor(private repo: ITaxRepository) {}

  async execute(
    orderId:     string,
    lapId:       string,
    periodId:    string,
    amountVND:   number,
    description: string,
  ): Promise<void> {
    let acc = await this.repo.findByOrderId(orderId);
    if (!acc) acc = createCostAccumulation(orderId, lapId, periodId);

    addJournalEntry(acc, {
      orderId, lapId, periodId,
      entryType:   'TK154_LABOR',
      debit:       '154',
      credit:      '622',
      amountVND,
      description,
    });

    // TR-002: kết chuyển 622 → 154 ngay
    acc.tk622Balance = 0;

    await this.repo.save(acc);
  }
}

// ─── UseCase: RecordDustRecoveryUseCase ───────────────────────────────────────
// TR-005: Bụi thu hồi Nợ 152-PHAN-KIM / Có 154

export class RecordDustRecoveryUseCase {
  constructor(private repo: ITaxRepository) {}

  async execute(event: DustRecoveredEvent): Promise<void> {
    const { workerId, periodId, totalVND } = event;

    // Dust recovery không gắn 1 orderId cụ thể — ghi vào periodId level
    const orderId = `DUST-${workerId}-${periodId}`;
    const lapId   = `DUST-LAP-${periodId}`;

    let acc = await this.repo.findByOrderId(orderId);
    if (!acc) acc = createCostAccumulation(orderId, lapId, periodId);

    // TR-005: Nợ 152-PHAN-KIM / Có 154
    addJournalEntry(acc, {
      orderId, lapId, periodId,
      entryType:   'TK154_DUST',
      debit:       '152-PHAN-KIM',
      credit:      '154',
      amountVND:   totalVND,
      description: `Bụi thu hồi — workerId=${workerId} period=${periodId}`,
    });

    await this.repo.save(acc);
  }
}

// ─── UseCase: CloseToInventoryUseCase ─────────────────────────────────────────
// Khi nhận STOCK_ENTRY_CREATED: kết chuyển TK154 → TK155

export class CloseToInventoryUseCase {
  constructor(private repo: ITaxRepository) {}

  async execute(event: StockEntryCreatedEvent): Promise<void> {
    const { orderId, lapId, weightTP } = event;
    const periodId = new Date().toISOString().slice(0, 7); // YYYY-MM

    const acc = await this.repo.findByOrderId(orderId);
    if (!acc) return; // Không có cost → skip

    // Nợ 155 / Có 154
    addJournalEntry(acc, {
      orderId, lapId, periodId,
      entryType:   'TK155_ENTRY',
      debit:       '155',
      credit:      '154',
      amountVND:   acc.tk154Balance,
      description: `Nhập kho TP — weightTP=${weightTP}chỉ`,
    });

    // TR-001 check: sau nhập kho TK154 = 0 là đúng (đã chuyển sang 155)
    acc.closedAt = new Date();
    await this.repo.save(acc);
  }
}
