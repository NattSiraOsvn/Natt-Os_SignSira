export interface ClosingRule {
  id: string;
  name: string;
  expenseAccount: '627' | '641' | '642';
  allocationBasis: 'revenue' | 'area' | 'labor' | 'custom';
  customFormula?: string;
  rate: number;
  priority: number;
  validFrom: Date;
  validTo?: Date;
  isActive: boolean;
}
