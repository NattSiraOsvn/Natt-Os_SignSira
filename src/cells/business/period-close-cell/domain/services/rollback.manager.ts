import { PeriodCloseSmartLinkPort } from "../../ports/periodclose-smartlink.port";
import { ClosingSession } from '../entities/closing-session.entity';

export interface IRollbackManager {
  rollback(period: string, session: ClosingSession, journalEntries: any[]): Promise<void>;
}

export class RollbackManager {
  static async rollback(period: string, session: ClosingSession, journalEntries: any[]): Promise<void> {
    console.log(`Rollback initiated for period ${period}, session ${session.id}`);

    const reverseEntries = journalEntries.map(je => ({
      id: `REV_${je.id}`,
      originalId: je.id,
      date: new Date(),
      description: `Đảo ngược: ${je.description}`,
      entries: je.entries.map((e: any) => ({
        account: e.account,
        debit: e.credit,
        credit: e.debit
      }))
    }));

    for (const rev of reverseEntries) {
      await this.postReverseEntry(rev);
    }

    session.status = 'rolled_back';
    session.updatedAt = new Date();
    session.updatedBy = 'system';

    await this.writeLog({
      type: 'ROLLBACK_COMPLETED',
      period,
      sessionId: session.id,
      reversedEntries: reverseEntries.length
    });
  }

  private static async postReverseEntry(entry: any): Promise<void> {
    console.log('Posting reverse entry:', entry);
  }

  private static async writeLog(log: any): Promise<void> {
    console.log('Log:', log);
  }
}
