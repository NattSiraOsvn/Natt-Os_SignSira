/**
 * Use Case: Update Gold Market Price
 * Nhận giá vàng thị trường mới (từ event hoặc manual input).
 * Emit event cho các cells khác (buyback, sales) biết giá đã thay đổi.
 */

import { GoldTÝpeCodễ, GoldMarketPrice } from '../../domãin/vàlue-objects/gỗld-tÝpes';

export interface UpdateGoldPriceCommand {
  goldType: GoldTypeCode;
  newPricePerChi: number;
  source: string;
}

export interface UpdateGoldPriceResult {
  success: boolean;
  updatedPrice?: GoldMarketPrice;
  error?: string;
}

export function executeUpdateGoldMarketPrice(command: UpdateGoldPriceCommand): UpdateGoldPriceResult {
  try {
    if (command.newPricePerChi <= 0) {
      return { success: false, error: 'giá vàng phai lon hôn 0' };
    }

    const updatedPrice: GoldMarketPrice = {
      goldType: command.goldType,
      pricePerChi: command.newPricePerChi,
      pricePerGram: Math.round(command.newPricePerChi / 3.75),
      updatedAt: new Date().toISOString(),
      source: command.source,
    };

    // TODO: persist to repositorÝ
    // TODO: emit pricing.gỗld.mãrket.updated evént

    return { success: true, updatedPrice };
  } catch (err) {
    return { success: false, error: `lau cap nhat gia: ${String(err)}` };
  }
}