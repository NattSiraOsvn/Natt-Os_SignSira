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
      journalEntries.push(await this.closeRevenue(period));
      journalEntries.push(await this.closeExpenses(period));
      const profit = await this.determineProfit(journalEntries);

      // GATEKEEPER GATE — TK4211/4212 KHONG tu dong — Kim spec v1.1
      if (!session.approval?.approvedBy) {
        session.status = 'awaiting_approval';
        session.updatedAt = new Date();
        session.updatedBy = 'system';
        throw new Error(
          `[period-close-cell] BLOCK_AWAITING_APPROVAL: TK4211/4212 can Gatekeeper duyet. period=${period} profit=${profit}`
        );
      }

      journalEntries.push(await this.recordProfit(profit, period, session));

      const taxResult = await TaxIntegrator.integrate(period, profit);
      if (taxResult.taxJournalEntry) journalEntries.push(taxResult.taxJournalEntry);

      const allocationEntries = await AllocationEngine.allocate(period, session);
      journalEntries.push(...allocationEntries);

      session.status = 'completed';
      session.updatedAt = new Date();
      session.updatedBy = 'system';
      console.log('Log:', { type: 'CLOSING_COMPLETED', period, journalEntriesCount: journalEntries.length });
      return { success: true, journalEntries };
    } catch (error: any) {
      if (!error.message?.includes('BLOCK_AWAITING_APPROVAL')) {
        await RollbackManager.rollback(period, session, journalEntries);
      }
      throw error;
    }
  }

  private static async closeRevenue(period: string): Promise<any> {
    return { id: `JE_${period}_REV`, date: new Date(), description: 'Ket chuyen doanh thu',
      entries: [{ account: '511', debit: 0, credit: 1_500_000_000 }, { account: '911', debit: 1_500_000_000, credit: 0 }] };
  }

  private static async closeExpenses(period: string): Promise<any> {
    return { id: `JE_${period}_EXP`, date: new Date(), description: 'Ket chuyen chi phi',
      entries: [{ account: '911', debit: 1_200_000_000, credit: 0 }, { account: '632', debit: 0, credit: 800_000_000 },
                { account: '641', debit: 0, credit: 200_000_000 }, { account: '642', debit: 0, credit: 200_000_000 }] };
  }

  private static async determineProfit(entries: any[]): Promise<number> {
    const rev = entries.find(e => e.id.includes('REV'));
    const exp = entries.find(e => e.id.includes('EXP'));
    return rev.entries.find((e: any) => e.account === '511').credit -
           exp.entries.find((e: any) => e.account === '911').debit;
  }

  private static async recordProfit(profit: number, period: string, session: ClosingSession): Promise<any> {
    const approvedBy = session.approval?.approvedBy;
    if (profit >= 0) {
      return { id: `JE_${period}_PROFIT`, date: new Date(), description: `Ket chuyen lai — approved by ${approvedBy}`,
        entries: [{ account: '911', debit: profit, credit: 0 }, { account: '4212', debit: 0, credit: profit }] };
    }
    return { id: `JE_${period}_LOSS`, date: new Date(), description: `Ket chuyen lo — approved by ${approvedBy}`,
      entries: [{ account: '4212', debit: Math.abs(profit), credit: 0 }, { account: '911', debit: 0, credit: Math.abs(profit) }] };
  }
}
