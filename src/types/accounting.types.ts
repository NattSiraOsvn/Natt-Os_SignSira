// Kế toán types — TT200 compliant
export interface AccountingEntry {
  id: string;
  date: string;
  description: string;
  debitAccount: string;
  creditAccount: string;
  amount: number;
  currency: string;
  reference: string;
  createdBy: string;
  module?: string;
  verified?: boolean;
}

export interface TrialBalance {
  account: string;
  accountName: string;
  debitBalance: number;
  creditBalance: number;
  period: string;
}

export interface AccountingPeriod {
  year: number;
  month: number;
  isClosed: boolean;
  closedAt?: number;
  closedBy?: string;
}
