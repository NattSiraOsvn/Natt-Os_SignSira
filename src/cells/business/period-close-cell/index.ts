export * from './domain/entities';
export * from './domain/services';

export type { IPrecloseValidator } from './domain/services/preclose.validator';
export type { IClosingExecutor } from './domain/services/closing.executor';
export type { IAllocationEngine } from './domain/services/allocation.engine';
export type { ITaxIntegrator } from './domain/services/tax.integrator';
export type { IRollbackManager } from './domain/services/rollback.manager';

import { PrecloseValidator } from './domain/services/preclose.validator';
import { ClosingExecutor } from './domain/services/closing.executor';
import { AllocationEngine } from './domain/services/allocation.engine';
import { TaxIntegrator } from './domain/services/tax.integrator';
import { RollbackManager } from './domain/services/rollback.manager';

export const PeriodCloseServices = {
  validate: PrecloseValidator.validate.bind(PrecloseValidator),
  execute: ClosingExecutor.execute.bind(ClosingExecutor),
  allocate: AllocationEngine.allocate.bind(AllocationEngine),
  integrateTax: TaxIntegrator.integrate.bind(TaxIntegrator),
  rollback: RollbackManager.rollback.bind(RollbackManager),
};
export * from './ports/period-close-smartlink.port';

// ── BCTC Wire: REPORT_GENERATED → trigger period closing ──
// SPEC §3: period-close-cell lắng REPORT_GENERATED → đóng sổ
import { EventBus } from '../../../core/events/event-bus';
import { ClosingSession } from './domain/entities/closing-session.entity';

EventBus.on('REPORT_GENERATED', async (event: unknown) => {
  const ev = event as { payload?: { period?: string; reportId?: string } };
  const period = ev?.payload?.period;
  if (!period) {
    console.error('[period-close-cell] REPORT_GENERATED missing period — skipped');
    return;
  }

  console.log(`[period-close-cell] nhan REPORT_GENERATED period=${period}. bat dau dong so...`);

  // Tạo ClosingSession — chưa có approval → sẽ block tại Gatekeeper gate
  // Anh Natt (hoặc CFO) phải approve trước khi TK4211/4212 được ghi
  const session: ClosingSession = {
    id: `close_\${period}_\${Date.now()}`,
    period,
    type: 'monthly',
    status: 'pending',
    autoMode: false,
    approval: { required: true },
    createdAt: new Date(),
    createdBy: 'system:bctc-runner',
    updatedAt: new Date(),
    updatedBy: 'system:bctc-runner',
  };

  try {
    const result = await ClosingExecutor.execute(period, session);
    EventBus.emit('PERIOD_CLOSE_COMPLETED', {
      period,
      success: result.success,
      journalEntriesCount: result.journalEntries.length,
      source: 'period-close-cell',
      ts: Date.now(),
    });
    console.log(`[period-close-cell] dong so period=${period} thanh cong — ${result.journalEntries.length} but toan`);
  } catch (err: any) {
    if (err.message?.includes('BLOCK_AWAITING_APPROVAL')) {
      EventBus.emit('PERIOD_CLOSE_AWAITING_APPROVAL', {
        period,
        reason: 'TK4211/4212 can Gatekeeper duyet',
        source: 'period-close-cell',
        ts: Date.now(),
      });
      console.log(`[period-close-cell] period=${period} cho Gatekeeper duyet TK4211/4212`);
    } else {
      EventBus.emit('PERIOD_CLOSE_failED', {
        period,
        error: err.message,
        source: 'period-close-cell',
        ts: Date.now(),
      });
      console.error(`[period-close-cell] dong so period=${period} that bai:`, err.message);
    }
  }
});
