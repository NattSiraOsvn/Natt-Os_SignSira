// @ts-nocheck
export interface FinanceCellContract {
  'finance.journal.posted': { entryId: string; debit: string; credit: string; amount: number };
  'finance.period.closed': { period: string; totalRevenue: number; totalCOGS: number; margin: number };
  'finance.margin.alert': { period: string; ratio: number; level: string };
  'finance.vat.calculated': { period: string; vatPayable: number; method: string };
  'finance.mode.changed': { from: string; to: string; reason: string };
}
