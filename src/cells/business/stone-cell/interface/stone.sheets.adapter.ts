/**
 * stone-cell — interface/stone.sheets.adapter.ts
 * STUB — ADAPT với JUST-U
 */

import { IStoneSheetAdapter, RawStoneSpec } from '../application/stone.usecase';

export class StoneSheetAdapter implements IStoneSheetAdapter {
  async fetchStoneSpec(orderId: string): Promise<RawStoneSpec[]> {
    // STUB: return empty — no stone required by default
    // TODO: connect JUST-U để lấy spec đá từ đơn hàng
    console.warn(`[stone-cell] STUB adapter — orderId: ${orderId}`);
    return [];
  }
}
