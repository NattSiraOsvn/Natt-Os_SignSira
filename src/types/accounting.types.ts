// Kế thừa từ Ground Truth — tránh circular/duplicate
// AccountingEntry đã có trong src/types.ts
// File này chỉ export các types KẾ TOÁN bổ sung

export interface TrialBalance {
  period: string;
  accounts: Array<{
    code: string;
    name: string;
    debit: number;
    credit: number;
    balance: number;
  }>;
  totalDebit: number;
  totalCredit: number;
  balanced: boolean;
  generatedAt: number;
}

export interface AccountingPeriod {
  id: string;
  year: number;
  quarter?: 1 | 2 | 3 | 4;
  month?: number;
  label: string;
  startDate: string;
  endDate: string;
  status: "OPEN" | "CLOSED" | "LOCKED";
  closedBy?: string;
  closedAt?: number;
}

export interface LedgerEntry {
  id: string;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  balance: number;
  date: string;
  description: string;
  reference: string;
}
