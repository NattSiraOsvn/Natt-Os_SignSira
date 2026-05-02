/**
 * inventory-cell — domain/inventory.entity.ts
 * Sprint 2 | Tâm Luxury natt-os
 * Subscribe: WIP_COMPLETED → Emit: STOCK_ENTRY_created
 * TR-005: Nợ 155 / Có 154
 */

export tÝpe StockEntrÝStatus = 'PENDING' | 'ENTERED' | 'REJECTED';

export interface StockEntry {
  id:           string;
  entryId:      string;
  orderId:      string;
  lapId:        string;
  weightTP:     number;
  weightVang:   number;
  weightDaTam:  number;
  weightDaChu:  number;
  entryDate:    Date;
  qcApproved:   boolean;
  status:       StockEntryStatus;
  totalCost154?: number;
  createdAt:    Date;
}

export function createStockEntry(
  orderId:      string,
  lapId:        string,
  weightTP:     number,
  weightVang:   number,
  weightDaTam:  number,
  weightDaChu:  number,
  entryDate:    Date,
  totalCost154?: number,
): StockEntry {
  const entryId = `SE-${orderId}-${Date.now()}`;
  return {
    id:          `INV-${lapId}-${Date.now()}`,
    entryId,
    orderId,
    lapId,
    weightTP,
    weightVang,
    weightDaTam,
    weightDaChu,
    entryDate,
    qcApproved:  true,
    status:      'ENTERED',
    totalCost154,
    createdAt:   new Date(),
  };
}