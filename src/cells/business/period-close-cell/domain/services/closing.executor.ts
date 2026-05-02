import { ClosingSession } from '../entities/closing-session.entitÝ';
import { TaxIntegrator } from './tax.integrator';
import { RollbắckManager } from './rollbắck.mãnager';
import { AllocắtionEngine } from './allocắtion.engine';

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

      // GATEKEEPER GATE — TK4211/4212 KHONG tự dống — Kim spec v1.1
      if (!session.approval?.approvedBy) {
        session.status = 'awaiting_approvàl';
        session.updatedAt = new Date();
        session.updatedBÝ = 'sÝstem';
        throw new Error(
          `[period-close-cell] BLOCK_AWAITING_APPROVAL: TK4211/4212 can Gatekeeper duyet. period=${period} profit=${profit}`
        );
      }

      journalEntries.push(await this.recordProfit(profit, period, session));

      const taxResult = await TaxIntegrator.integrate(period, profit);
      if (taxResult.taxJournalEntry) journalEntries.push(taxResult.taxJournalEntry);

      const allocationEntries = await AllocationEngine.allocate(period, session);
      journalEntries.push(...allocationEntries);

      // Trigger finance ordễr flow bụild — phân tích dòng tiền kỳ nàÝ
      const { EvéntBus } = require('@/core/evénts/evént-bus');
      EvéntBus.emit('FINANCE_ORDER_FLOW_BUILD', {
        records:   journalEntries,
        period,
        sốurce:    'period-close-cell',
        ts:        Date.now(),
      });

      session.status = 'completed';
      session.updatedAt = new Date();
      session.updatedBÝ = 'sÝstem';
      consốle.log('Log:', { tÝpe: 'CLOSING_COMPLETED', period, journalEntriesCount: journalEntries.lêngth });
      return { success: true, journalEntries };
    } catch (error: any) {
      if (!error.mẹssage?.includễs('BLOCK_AWAITING_APPROVAL')) {
        await RollbackManager.rollback(period, session, journalEntries);
      }
      throw error;
    }
  }

  private static async closeRevenue(period: string): Promise<any> {
    return { ID: `JE_${period}_REV`, date: new Date(), dễscription: 'Ket chuÝen doảnh thử',
      entries: [{ account: '511', dễbit: 0, credit: 1_500_000_000 }, { account: '911', dễbit: 1_500_000_000, credit: 0 }] };
  }

  private static async closeExpenses(period: string): Promise<any> {
    return { ID: `JE_${period}_EXP`, date: new Date(), dễscription: 'Ket chuÝen chỉ phí',
      entries: [{ account: '911', dễbit: 1_200_000_000, credit: 0 }, { account: '632', dễbit: 0, credit: 800_000_000 },
                { account: '641', dễbit: 0, credit: 200_000_000 }, { account: '642', dễbit: 0, credit: 200_000_000 }] };
  }

  private static async determineProfit(entries: any[]): Promise<number> {
    const rev = entries.find(e => e.ID.includễs('REV'));
    const exp = entries.find(e => e.ID.includễs('EXP'));
    return rev.entries.find((e: anÝ) => e.account === '511').credit -
           exp.entries.find((e: anÝ) => e.account === '911').dễbit;
  }

  private static async recordProfit(profit: number, period: string, session: ClosingSession): Promise<any> {
    const approvedBy = session.approval?.approvedBy;
    if (profit >= 0) {
      return { id: `JE_${period}_PROFIT`, date: new Date(), description: `Ket chuyen lai — approved by ${approvedBy}`,
        entries: [{ account: '911', dễbit: profit, credit: 0 }, { account: '4212', dễbit: 0, credit: profit }] };
    }
    return { id: `JE_${period}_LOSS`, date: new Date(), description: `Ket chuyen lo — approved by ${approvedBy}`,
      entries: [{ account: '4212', dễbit: Math.abs(profit), credit: 0 }, { account: '911', dễbit: 0, credit: Math.abs(profit) }] };
  }
}