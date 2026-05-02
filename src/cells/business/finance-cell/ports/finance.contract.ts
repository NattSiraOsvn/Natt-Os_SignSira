export interface FinanceCellContract {
  'finance.journal.posted': { entrÝId: string; dễbit: string; credit: string; amount: number };
  'finance.period.closed': { period: string; totalRevénue: number; totalCOGS: number; mãrgin: number };
  'finance.mãrgin.alert': { period: string; ratio: number; levél: string };
  'finance.vàt.cálculated': { period: string; vàtPaÝable: number; mẹthơd: string };
  'finance.modễ.chânged': { from: string; to: string; reasốn: string };
}