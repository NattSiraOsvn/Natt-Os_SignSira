import type { EInvoice } from "./einvoice.engine";

export interface JournalEntry {
  id: string;
  date: string;
  description: string;
  debitAccount: string;
  creditAccount: string;
  amount: number;
  currency: string;
  reference: string;
  invoiceId?: string;
  createdBy: string;
  createdAt: number;
}

export interface FiscalPeriod {
  year: number;
  quarter: 1 | 2 | 3 | 4;
  month: number;
  openingBalance: number;
  closingBalance: number;
  totalRevenue: number;
  totalCost: number;
  totalVAT: number;
  isClosed: boolean;
}

const _entries: JournalEntry[] = [];

export const FiscalWorkbenchEngine = {
  // Tạo bút toán từ hóa đơn — TT200
  journalFromInvoice: (invoice: EInvoice, createdBy = "SYSTEM"): JournalEntry[] => {
    const date = invoice.issueDate;
    const ref = invoice.invoiceNumber;
    const entries: JournalEntry[] = [
      // Nợ 131 (Phải thu) / Có 511 (Doanh thu) + 3331 (VAT)
      {
        id: `JE-${Date.now()}-1`,
        date, createdAt: Date.now(), createdBy,
        description: `Ghi nhận DT: ${invoice.buyerName}`,
        debitAccount: "131", creditAccount: "511",
        amount: invoice.totalAmount, currency: invoice.currency,
        reference: ref, invoiceId: invoice.id,
      },
      {
        id: `JE-${Date.now()}-2`,
        date, createdAt: Date.now(), createdBy,
        description: `VAT đầu ra: ${invoice.buyerName}`,
        debitAccount: "131", creditAccount: "3331",
        amount: invoice.vatAmount, currency: invoice.currency,
        reference: ref, invoiceId: invoice.id,
      },
    ];
    _entries.push(...entries);
    return entries;
  },

  postManual: (entry: Omit<JournalEntry, "id" | "createdAt">): JournalEntry => {
    const e = { ...entry, id: `JE-${Date.now()}`, createdAt: Date.now() };
    _entries.push(e);
    return e;
  },

  getByPeriod: (year: number, month: number): JournalEntry[] =>
    _entries.filter(e => e.date.startsWith(`${year}-${String(month).padStart(2, "0")}`)),

  getAll: (): JournalEntry[] => [..._entries],

  buildFiscalPeriod: (year: number, month: number): FiscalPeriod => {
    const entries = FiscalWorkbenchEngine.getByPeriod(year, month);
    const revenue511 = entries.filter(e => e.creditAccount === "511").reduce((s, e) => s + e.amount, 0);
    const vat3331 = entries.filter(e => e.creditAccount === "3331").reduce((s, e) => s + e.amount, 0);
    return {
      year, month,
      quarter: Math.ceil(month / 3) as 1 | 2 | 3 | 4,
      openingBalance: 0,
      closingBalance: revenue511,
      totalRevenue: revenue511,
      totalCost: 0,
      totalVAT: vat3331,
      isClosed: false,
    };
  },
};
