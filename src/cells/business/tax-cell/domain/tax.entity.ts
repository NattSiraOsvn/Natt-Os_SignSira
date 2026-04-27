/**
 * tax-cell — domain/tax.entity.ts
 * Sprint 3 | Tâm Luxury natt-os
 *
 * Tích lũy chi phí TK154 theo orderId
 * TR-001: TK154 WIP > 0 khi xưởng đang SX
 * TR-002: TK622 zero balance sau kết chuyển
 * TR-005: Bụi thu hồi Nợ 152-PHAN-KIM / Có 154
 */

export type JournalEntryType =
  | 'TK154_LABOR'       // Nợ 154 / Có 622 — nhân công
  | 'TK154_MATERIAL'    // Nợ 154 / Có 152 — vật tư
  | 'TK154_OVERHEAD'    // Nợ 154 / Có 627 — chi phí chung
  | 'TK154_DUST'        // Nợ 152-PHAN-KIM / Có 154 — bụi thu hồi
  | 'TK155_ENTRY'       // Nợ 155 / Có 154 — nhập kho TP
  | 'TK632_COGS'        // Nợ 632 / Có 155 — giá vốn (chỉ khi bán)
  | 'TK811_LOSS';       // Nợ 811 / Có 154 — hao hụt ngoài định mức

export interface JournalEntry {
  id:          string;
  orderId:     string;
  lapId:       string;
  entryType:   JournalEntryType;
  debit:       string;   // TK nợ
  credit:      string;   // TK có
  amountVND:   number;
  description: string;
  periodId:    string;   // YYYY-MM
  createdAt:   Date;
  approvedBy?: string;   // Gatekeeper — bắt buộc với TK811
}

export interface CostAccumulation {
  orderId:      string;
  lapId:        string;
  periodId:     string;
  tk154Balance: number;  // tổng TK154 tích lũy (VND) — TR-001: > 0 khi SX
  tk622Balance: number;  // phải = 0 sau kết chuyển — TR-002
  entries:      JournalEntry[];
  closedAt?:    Date;
}

export function createCostAccumulation(
  orderId:  string,
  lapId:    string,
  periodId: string,
): CostAccumulation {
  return {
    orderId,
    lapId,
    periodId,
    tk154Balance: 0,
    tk622Balance: 0,
    entries:      [],
  };
}

export function addJournalEntry(
  acc:     CostAccumulation,
  entry:   Omit<JournalEntry, 'id' | 'createdAt'>,
): JournalEntry {
  const je: JournalEntry = {
    ...entry,
    id:        `JE-${acc.orderId}-${Date.now()}`,
    createdAt: new Date(),
  };
  acc.entries.push(je);

  // Cập nhật balance
  if (je.debit.startsWith('154')) acc.tk154Balance += je.amountVND;
  if (je.credit.startsWith('154')) acc.tk154Balance -= je.amountVND;
  if (je.debit.startsWith('622')) acc.tk622Balance += je.amountVND;
  if (je.credit.startsWith('622')) acc.tk622Balance -= je.amountVND;

  return je;
}
