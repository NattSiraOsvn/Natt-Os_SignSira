/**
 * prdmaterials-cell / interface / prdmaterials.sheets.adapter.ts
 * ADAPT: dùng JUST-U adapter thực tế thay stub bên dưới.
 */

import { IPhieuInfoAdapter, RawPhieuInfo } from '../application/prdmaterials.usecase';

export class PhieuInfoSheetsAdapter implements IPhieuInfoAdapter {
  private readonly SPREADSHEET_ID = 'REPLACE_WITH_REAL_SPREADSHEET_ID';
  private readonly SHEET_NAME = 'GIAO NHẬN INFO';

  async fetchPendingLaps(): Promise<RawPhieuInfo[]> {
    // TODO: gọi JUST-U adapter thực tế
    console.log('[prdmaterials-cell/adapter] fetchPendingLaps – STUB');
    return [];
  }
}
