import { ClosingSession } from '../entities/closing-session.entity';
import { ClosingRule } from '../entities/closing-rule.entity';

export interface IAllocationEngine {
  allocate(period: string, session: ClosingSession): Promise<any[]>;
}

export class AllocationEngine {
  static async allocate(period: string, session: ClosingSession): Promise<any[]> {
    const rules = await this.getAllocationRulesFromNoiVu(period);
    const journalEntries: any[] = [];

    for (const rule of rules) {
      if (!rule.isActive) continue;
      const amount = await this.calculateAllocationAmount(rule, period);
      if (amount > 0) {
        journalEntries.push({
          id: `JE_${period}_ALLOC_${rule.id}`,
          date: new Date(),
          description: `Phân bổ chi phí theo quy tắc ${rule.name}`,
          entries: [
            { account: rule.expenseAccount, debit: amount, credit: 0 },
            { account: '242', debit: 0, credit: amount }
          ]
        });
      }
    }

    return journalEntries;
  }

  private static async getAllocationRulesFromNoiVu(period: string): Promise<ClosingRule[]> {
    return [
      {
        id: 'RULE_001',
        name: 'Phân bổ chi phí quảng cáo',
        expenseAccount: '642',
        allocationBasis: 'revenue',
        rate: 10,
        priority: 1,
        validFrom: new Date('2026-01-01'),
        isActive: true
      }
    ];
  }

  private static async calculateAllocationAmount(rule: ClosingRule, period: string): Promise<number> {
    if (rule.allocationBasis === 'revenue') {
      const revenue = 1_500_000_000;
      return revenue * rule.rate / 100;
    }
    return 0;
  }
}
