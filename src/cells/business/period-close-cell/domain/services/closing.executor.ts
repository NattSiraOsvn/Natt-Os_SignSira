import { PeriodCloseSmartLinkPort } from "../../ports/periodclose-smartlink.port";
import { ClosingSession } from '../entities/closing-session.entity';
import { TaxIntegrator } from './tax.integrator';
import { RollbackManager } from './rollback.manager';
import { AllocationEngine } from './allocation.engine';

export interface IClosingExecutor {
  execute(period: string, session: ClosingSession): Promise<{ success: boolean; journalEntries: any[] }>;
}

export class ClosingExecutor {
  static async execute(period: string, session: ClosingSession): Promise<{ success: boolean; journalEntries: any[] }> {
    const journalEntries: any[] = [];

    try {
      const revenueJE = await this.closeRevenue(period);
      journalEntries.push(revenueJE);

      const expenseJE = await this.closeExpenses(period);
      journalEntries.push(expenseJE);

      const profit = await this.determineProfit(period, journalEntries);
      const profitJE = await this.recordProfit(profit, period, session);
      journalEntries.push(profitJE);

      if (session.type === 'yearly' && session.approval?.required && !session.approval.approvedBy) {
        throw new Error('Year-end close requires gatekeeper approval.');
      }

      const taxResult = await TaxIntegrator.integrate(period, profit);
      if (taxResult.taxJournalEntry) {
        journalEntries.push(taxResult.taxJournalEntry);
      }

      const allocationEntries = await AllocationEngine.allocate(period, session);
      journalEntries.push(...allocationEntries);

      session.status = 'completed';
      session.updatedAt = new Date();
      session.updatedBy = 'system';

      await this.writeLog({
        type: 'CLOSING_COMPLETED',
        period,
        sessionId: session.id,
        journalEntriesCount: journalEntries.length
      });

      return { success: true, journalEntries };
    } catch (error: any) {
      await RollbackManager.rollback(period, session, journalEntries);
      throw error;
    }
  }

  private static async closeRevenue(period: string): Promise<any> {
    const totalRevenue = 1_500_000_000;
    return {
      id: `JE_${period}_REV`,
      date: new Date(),
      description: 'Kết chuyển doanh thu bán hàng',
      entries: [
        { account: '511', debit: 0, credit: totalRevenue },
        { account: '911', debit: totalRevenue, credit: 0 }
      ]
    };
  }

  private static async closeExpenses(period: string): Promise<any> {
    const totalExpenses = 1_200_000_000;
    return {
      id: `JE_${period}_EXP`,
      date: new Date(),
      description: 'Kết chuyển chi phí',
      entries: [
        { account: '911', debit: totalExpenses, credit: 0 },
        { account: '632', debit: 0, credit: 800_000_000 },
        { account: '641', debit: 0, credit: 200_000_000 },
        { account: '642', debit: 0, credit: 200_000_000 }
      ]
    };
  }

  private static async determineProfit(period: string, entries: any[]): Promise<number> {
    const revenueJE = entries.find(e => e.id.includes('REV'));
    const expenseJE = entries.find(e => e.id.includes('EXP'));
    const revenue = revenueJE.entries.find((e: any) => e.account === '511').credit;
    const expenses = expenseJE.entries.find((e: any) => e.account === '911').debit;
    return revenue - expenses;
  }

  private static async recordProfit(profit: number, period: string, session: ClosingSession): Promise<any> {
    if (profit >= 0) {
      return {
        id: `JE_${period}_PROFIT`,
        date: new Date(),
        description: 'Kết chuyển lãi',
        entries: [
          { account: '911', debit: profit, credit: 0 },
          { account: '4212', debit: 0, credit: profit }
        ]
      };
    } else {
      return {
        id: `JE_${period}_LOSS`,
        date: new Date(),
        description: 'Kết chuyển lỗ',
        entries: [
          { account: '4212', debit: Math.abs(profit), credit: 0 },
          { account: '911', debit: 0, credit: Math.abs(profit) }
        ]
      };
    }
  }

  private static async writeLog(log: any): Promise<void> {
    console.log('Log:', log);
  }
}
