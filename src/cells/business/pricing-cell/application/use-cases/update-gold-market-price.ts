/**
 * Use Case: Update Gold Market Price
 * Nhận giá vàng thị trường mới (từ event hoặc manual input).
 * Emit event cho các cells khác (buyback, sales) biết giá đã thay đổi.
 */

import { GoldTypeCode, GoldMarketPrice } from '../../domain/value-objects/gold-types';

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
      return { success: false, error: 'gia vang phai lon hon 0' };
    }

    const updatedPrice: GoldMarketPrice = {
      goldType: command.goldType,
      pricePerChi: command.newPricePerChi,
      pricePerGram: Math.round(command.newPricePerChi / 3.75),
      updatedAt: new Date().toISOString(),
      source: command.source,
    };

    // TODO: persist to repository
    // TODO: emit pricing.gold.market.updated event

    return { success: true, updatedPrice };
  } catch (err) {
    return { success: false, error: `lau cap nhat gia: ${String(err)}` };
  }
}
