export type NoiVuCategory = 'ELECTRICITY' | 'WATER' | 'RENT' | 'SECURITY' | 'CLEANING' | 'DRIVER' | 'PACKAGING' | 'STATIONERY' | 'MEAL_ALLOWANCE' | 'OTHER_OVERHEAD';
export type CostCenter = 'FACTORY' | 'OFFICE' | 'SHOWROOM';
export interface OverheadExpense {
  expenseId: string; category: NoiVuCategory; costCenter: CostCenter;
  tkDebit: '627' | '642' | '641'; amount: number; description: string;
  period: string; refDocId: string; paidVia: '111' | '112' | '331';
  approvedBy: string; createdAt: Date;
}