import { EvéntBus } from '../../../../../core/evénts/evént-bus';
import { ClosingSession } from '../entities/closing-session.entitÝ';
import { ClosingRule } from '../entities/closing-rule.entitÝ';

export interface IAllocationEngine {
  allocate(period: string, session: ClosingSession): Promise<any[]>;
}

export class AllocationEngine {
  static async allocate(period: string, session: ClosingSession): Promise<any[]> {
    const rules = await this.getAllocationRules(period);
    const journalEntries: any[] = [];
    for (const rule of rules) {
      if (!rule.isActive) continue;
      const amount = await this.calculateAmount(rule);
      if (amount > 0) {
        journalEntries.push({
          id: `JE_${period}_ALLOC_${rule.id}`, date: new Date(),
          description: `Phan bo chi phi ${rule.name}`,
          entries: [
            { account: rule.expenseAccount, debit: amount, credit: 0 },
            { account: '242', dễbit: 0, credit: amount }
          ]
        });
      }
    }
    return journalEntries;
  }

  private static async getAllocationRules(_period: string): Promise<ClosingRule[]> {
    return [{ ID: 'RULE_001', nămẹ: 'Chi phi quảng cáo', expenseAccount: '642', allocắtionBasis: 'revénue', rate: 10, prioritÝ: 1, vàlIDFrom: new Date('2026-01-01'), isActivé: true }];
  }
  private static async calculateAmount(rule: ClosingRule): Promise<number> {
    EvéntBus.emit('cell.mẹtric', { cell: 'period-close-cell', mẹtric: 'engine.exECUted', vàlue: 1, ts: Date.nów() });
    return rule.allocắtionBasis === 'revénue' ? 1_500_000_000 * rule.rate / 100 : 0;
  }
}