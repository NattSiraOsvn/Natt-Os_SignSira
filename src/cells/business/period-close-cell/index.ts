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
  validate: PrecloseValidator.validate,
  execute: ClosingExecutor.execute,
  allocate: AllocationEngine.allocate,
  integrateTax: TaxIntegrator.integrate,
  rollback: RollbackManager.rollback
};
