// @ts-nocheck
import { IFinishingSheetAdapter, RawWorkerRow } from '../application/finishing.usecase';

export class FinishingSheetAdapter implements IFinishingSheetAdapter {
  constructor(private readonly justU?: any) {}

  async fetchWorkerAssignments(lapId: string): Promise<RawWorkerRow[]> {
    if (this.justU) return this.justU.query('worker_assignments', { lapId });
    console.warn(`[finishing-cell] JUST-U not injected — lapId: ${lapId}`);
    return [];
  }
}
