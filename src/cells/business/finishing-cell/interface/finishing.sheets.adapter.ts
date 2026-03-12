/**
 * finishing-cell — interface/finishing.sheets.adapter.ts
 * Sprint 2 | STUB — ADAPT với JUST-U thực tế
 */

import { IFinishingSheetAdapter, RawWorkerRow } from '../application/finishing.usecase';

export class FinishingSheetAdapter implements IFinishingSheetAdapter {
  async fetchWorkerAssignments(lapId: string): Promise<RawWorkerRow[]> {
    // STUB: return mock data cho đến khi JUST-U ready
    // TODO: connect Google Sheets / JUST-U API
    console.warn(`[finishing-cell] STUB adapter — lapId: ${lapId}`);
    return [
      {
        workerId:   'W-SX-001',
        workerName: 'Nguyễn Văn A',
        role:       'SX',
        assignedAt: new Date().toISOString(),
      },
    ];
  }
}
