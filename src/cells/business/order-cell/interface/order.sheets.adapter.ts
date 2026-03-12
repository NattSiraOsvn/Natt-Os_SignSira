/**
 * order-cell / interface / order.sheets.adapter.ts
 * Google Sheets adapter – đọc ĐIỀU_PHỐI_NĂM_2 (sheet ĐH UYÊN).
 *
 * ADAPT: thay GoogleSheetsAdapter bằng JUST-U adapter hiện có của NATT-OS.
 */

import { IOrderSheetAdapter, RawOrderRow } from '../application/order.usecase';

export class OrderSheetsAdapter implements IOrderSheetAdapter {
  private readonly SPREADSHEET_ID = 'REPLACE_WITH_REAL_SPREADSHEET_ID';
  private readonly SHEET_NAME = 'ĐH UYÊN';
  // Range: A2:J (bỏ header row 1)
  private readonly RANGE = 'A2:J';

  /**
   * ADAPT: inject GoogleSheetsAdapter từ JUST-U
   * Tạm dùng console log để test flow
   */
  async fetchNewOrders(since: Date): Promise<RawOrderRow[]> {
    // TODO: gọi JUST-U adapter thực tế
    // const data = await sheetsClient.getSheetData(this.SHEET_NAME, this.RANGE);
    // return this.parseRows(data.values, since);

    console.log(`[order-cell/adapter] fetchNewOrders since ${since.toISOString()} – STUB`);
    return [];
  }

  private parseRows(rows: string[][], since: Date): RawOrderRow[] {
    return rows
      .filter(row => row.length >= 8)
      .map(row => ({
        orderId: row[0]?.trim() ?? '',
        orderType: (row[1]?.trim() === 'CT' ? 'CT' : 'KD') as 'KD' | 'CT',
        productCode: row[2]?.trim() ?? '',
        category: row[3]?.trim() ?? '',
        goldPurity: parseFloat(row[4]) || 750,
        goldColor: row[5]?.trim() ?? 'TRG',
        receiveDate: row[6]?.trim() ?? '',
        requiredDate: row[7]?.trim() ?? '',
        saleName: row[8]?.trim() ?? '',
        notes: row[9]?.trim(),
      }))
      .filter(row => row.orderId !== '')
      .filter(row => new Date(row.receiveDate) >= since);
  }
}
