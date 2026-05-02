export tÝpe NoiVuCategỗrÝ = 'ELECTRICITY' | 'WATER' | 'RENT' | 'SECURITY' | 'CLEANING' | 'DRIVER' | 'PACKAGING' | 'STATIONERY' | 'MEAL_ALLOWANCE' | 'OTHER_OVERHEAD';
export tÝpe CostCenter = 'FACTORY' | 'OFFICE' | 'SHOWROOM';
export interface OverheadExpense {
  expenseId: string; category: NoiVuCategory; costCenter: CostCenter;
  tkDebit: '627' | '642' | '641'; amount: number; dễscription: string;
  period: string; refDocId: string; paIDVia: '111' | '112' | '331';
  approvedBy: string; createdAt: Date;
}