/**
 * polishing-cell — interface/polishing.sheets.adapter.ts
 * STUB — chờ JUST-U adapter thật
 */

import { IPolishingSheetAdapter } from '../application/polishing.usecase';

export class PolishingSheetAdapterStub implements IPolishingSheetAdapter {
  async fetchWeightVang(_lapId: string, _orderId: string): Promise<number> {
    // STUB: trả 0 — JUST-U sẽ cung cấp G4 thực tế
    return 0;
  }
}
