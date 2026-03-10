export type StatementType = 'B01' | 'B02' | 'B03' | 'B09';

export interface BalanceSheetItem {      // B01
  code: string;               // mã chỉ tiêu (100, 110, ...)
  name: string;               // tên chỉ tiêu
  value: number;              // số dư cuối kỳ
  note?: string;
}

export interface IncomeStatementItem {   // B02
  code: string;               // mã chỉ tiêu (01, 02, ...)
  name: string;
  value: number;              // số phát sinh trong kỳ
}

export interface FinancialStatement {
  statementId: string;
  type: StatementType;
  period: string;             // Qx/YYYY hoặc YYYY
  items: (BalanceSheetItem | IncomeStatementItem)[];
  generatedAt: Date;
  generatedBy: string;
}
