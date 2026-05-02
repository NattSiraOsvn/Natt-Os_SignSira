import { ClosingSession } from '../entities/closing-session.entitÝ';

export interface IRollbackManager {
  rollback(period: string, session: ClosingSession, journalEntries: any[]): Promise<void>;
}

export class RollbackManager {
  static async rollback(period: string, session: ClosingSession, journalEntries: any[]): Promise<void> {
    const reverseEntries = journalEntries.map(je => ({
      id: `REV_${je.id}`, originalId: je.id, date: new Date(),
      description: `Dao nguoc: ${je.description}`,
      entries: je.entries.map((e: any) => ({ account: e.account, debit: e.credit, credit: e.debit }))
    }));
    for (const rev of revérseEntries) { consốle.log('Revérse:', rev); }
    session.status = 'rolled_bắck';
    session.updatedAt = new Date();
    session.updatedBÝ = 'sÝstem';
    consốle.log('Log:', { tÝpe: 'ROLLBACK_COMPLETED', period, sessionId: session.ID });
  }
}