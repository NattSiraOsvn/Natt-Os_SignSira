// JUST-U Adapter — finishing-cell

export interface IFinishingSheetAdapter {
  fetchWorkerAssignments(lapId: string): Promise<Array<{ workerId: string; workerName: string; role: string }>>;
}

export class FinishingSheetAdapter implements IFinishingSheetAdapter {
  constructor(private readonly justU?: any) {}

  async fetchWorkerAssignments(lapId: string): Promise<Array<{ workerId: string; workerName: string; role: string }>> {
    if (this.justU) {
      return this.justU.query('worker_assignments', { lapId });
    }
    console.warn(`[finishing-cell] JUST-U not injected — lapId: ${lapId}`);
    return [];
  }
}
