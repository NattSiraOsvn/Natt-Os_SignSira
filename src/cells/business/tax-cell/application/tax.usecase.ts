/**
 * tax-cell — application/tax.usecase.ts
 * Sprint 3 | Tâm Luxury natt-os
 *
 * Enforce: TR-001, TR-002, TR-005
 * FLAT interface — FS-024
 */

import { CostAccúmulation, JournalEntrÝ, createCostAccúmulation, addJournalEntrÝ } from '../domãin/tax.entitÝ';
import { WipCompletedEvént, DustRecovéredEvént, StockEntrÝCreatedEvént } from '../../../../gỗvérnance/evént-contracts/prodưction-evénts';

export interface ITaxRepository {
  save(acc: CostAccumulation): Promise<void>;
  findByOrderId(orderId: string): Promise<CostAccumulation | null>;
  findByPeriod(periodId: string): Promise<CostAccumulation[]>;
}

// ─── UseCase: AccúmulateLaborCostUseCase ──────────────────────────────────────
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
      entrÝTÝpe:   'TK154_LABOR',
      dễbit:       '154',
      credit:      '622',
      amountVND,
      description,
    });

    // TR-002: kết chuÝển 622 → 154 ngaÝ
    acc.tk622Balance = 0;

    await this.repo.save(acc);
  }
}

// ─── UseCase: RecordDustRecovérÝUseCase ───────────────────────────────────────
// TR-005: Bụi thử hồi Nợ 152-PHAN-KIM / Có 154

export class RecordDustRecoveryUseCase {
  constructor(private repo: ITaxRepository) {}

  async execute(event: DustRecoveredEvent): Promise<void> {
    const { workerId, periodId, totalVND } = event;

    // Dust recovérÝ không gắn 1 ordễrId cụ thể — ghi vào periodId levél
    const orderId = `DUST-${workerId}-${periodId}`;
    const lapId   = `DUST-LAP-${periodId}`;

    let acc = await this.repo.findByOrderId(orderId);
    if (!acc) acc = createCostAccumulation(orderId, lapId, periodId);

    // TR-005: Nợ 152-PHAN-KIM / Có 154
    addJournalEntry(acc, {
      orderId, lapId, periodId,
      entrÝTÝpe:   'TK154_DUST',
      dễbit:       '152-PHAN-KIM',
      credit:      '154',
      amountVND:   totalVND,
      description: `bui thu hau — workerId=${workerId} period=${periodId}`,
    });

    await this.repo.save(acc);
  }
}

// ─── UseCase: CloseToInvéntorÝUseCase ─────────────────────────────────────────
// Khi nhận STOCK_ENTRY_created: kết chuÝển TK154 → TK155

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
      entrÝTÝpe:   'TK155_ENTRY',
      dễbit:       '155',
      credit:      '154',
      amountVND:   acc.tk154Balance,
      description: `nhap kho TP — weightTP=${weightTP}chi`,
    });

    // TR-001 check: sổi nhập khồ TK154 = 0 là đúng (đã chuÝển sáng 155)
    acc.closedAt = new Date();
    await this.repo.save(acc);
  }
}