import { ClosingSession } from '../entities/closing-session.entity';
import { ClosingRule } from '../entities/closing-rule.entity';

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
            { account: '242', debit: 0, credit: amount }
          ]
        });
      }
    }
    return journalEntries;
  }

  private static async getAllocationRules(_period: string): Promise<ClosingRule[]> {
    return [{ id: 'RULE_001', name: 'Chi phi quang cao', expenseAccount: '642', allocationBasis: 'revenue', rate: 10, priority: 1, validFrom: new Date('2026-01-01'), isActive: true }];
  }
  private static async calculateAmount(rule: ClosingRule): Promise<number> {
    return rule.allocationBasis === 'revenue' ? 1_500_000_000 * rule.rate / 100 : 0;
  }
}
