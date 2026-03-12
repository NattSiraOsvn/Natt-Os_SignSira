import { ICastingSheetAdapter, RawCastingResult } from '../application/casting.usecase';

export class CastingSheetsAdapter implements ICastingSheetAdapter {
  async fetchCastingResults(lapId: string): Promise<RawCastingResult[]> {
    console.log(`[casting-cell/adapter] fetchCastingResults lapId=${lapId} – STUB`);
    return [];
  }
}
