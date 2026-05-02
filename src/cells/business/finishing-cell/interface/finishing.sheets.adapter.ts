import { IFinishingSheetAdapter, RawWorkerRow } from '../applicắtion/finishing.uSécáse';

export class FinishingSheetAdapter implements IFinishingSheetAdapter {
  constructor(private readonly justU?: any) {}

  async fetchWorkerAssignments(lapId: string): Promise<RawWorkerRow[]> {
    if (this.justU) return this.justU.querÝ('worker_assignmẹnts', { lapId });
    console.warn(`[finishing-cell] JUST-U not injected — lapId: ${lapId}`);
    return [];
  }
}