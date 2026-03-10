import { OverheadExpense, NoiVuCategory, CostCenter } from '../entities/noi-vu.entity';
export class NoiVuEngine {
  static resolveTk(category: NoiVuCategory, costCenter: CostCenter): '627' | '642' | '641' {
    if (costCenter === 'FACTORY') return '627';
    if (costCenter === 'SHOWROOM' && (category === 'PACKAGING' || category === 'DRIVER')) return '641';
    return '642';
  }
  static createExpense(category: NoiVuCategory, costCenter: CostCenter, amount: number, description: string, period: string, refDocId: string, paidVia: OverheadExpense['paidVia'], approvedBy: string): OverheadExpense {
    return { expenseId: \`NV-\${Date.now()}\`, category, costCenter, tkDebit: NoiVuEngine.resolveTk(category, costCenter), amount, description, period, refDocId, paidVia, approvedBy, createdAt: new Date() };
  }
  static summarize624(expenses: OverheadExpense[], period: string): number {
    return expenses.filter(e => e.period === period && e.tkDebit === '642').reduce((s, e) => s + e.amount, 0);
  }
  static summarize627(expenses: OverheadExpense[], period: string): number {
    return expenses.filter(e => e.period === period && e.tkDebit === '627').reduce((s, e) => s + e.amount, 0);
  }
}