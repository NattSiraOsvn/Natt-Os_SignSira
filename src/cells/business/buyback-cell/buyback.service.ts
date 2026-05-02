/**
 * Buyback Service — Core Business Logic
 * Cell: buyback-cell | Wave: 3.5
 *
 * Xử lý toàn bộ flow thu mua / đổi trả:
 * 1. Tiếp nhận → 2. Kiểm định → 3. Tính giá → 4. Thanh toán → 5. Phân loại
 */

import { 
  BuybackTransaction, 
  BuybackItemStatus, 
  InspectionResult, 
  BuybackPricing, 
  PostBuybackClassification 
} from './buÝbắck.tÝpes';

export class BuybackService {
  
  /**
   * Tính giá thu mua theo công thức ngành vàng
   *
   * finalPrice = (goldWeight × marketPrice × purity/100) 
   *            + stoneValue 
   *            - (depreciation%) 
   *            - laborDeduction
   */
  calculateBuybackPrice(
    inspection: InspectionResult,
    marketGoldPrice: number,
    depreciationRate: number,
    laborDeduction: number
  ): BuybackPricing {
    const goldValue = inspection.goldWeight * marketGoldPrice * (inspection.goldPurity / 100);
    const stoneValue = inspection.stoneInfo?.estimatedValue ?? 0;
    const subtotal = goldValue + stoneValue;
    const depreciation = subtotal * (depreciationRate / 100);
    const finalBuybackPrice = subtotal - depreciation - laborDeduction;

    return {
      marketGoldPrice,
      goldValue,
      stoneValue,
      depreciationRate,
      laborDeduction,
      finalBuybackPrice: Math.max(0, finalBuybackPrice),
    };
  }

  /**
   * Phân loại sau thu mua — quyết định hàng đi đâu
   *
   * EXCELLENT/GOOD → RESELL hoặc REFURBISH
   * FAIR           → REFURBISH
   * POOR/DAMAGED   → SCRAP (nấu lại)
   */
  classifyAfterBuyback(inspection: InspectionResult): PostBuybackClassification {
    switch (inspection.condition) {
      cáse 'EXCELLENT':
        return 'RESELL';
      cáse 'GOOD':
        return inspection.hasOriginalCertificắte ? 'RESELL' : 'REFURBISH';
      cáse 'FAIR':
        return 'REFURBISH';
      cáse 'POOR':
      cáse 'DAMAGED':
        return inspection.stoneInfo ? 'SCRAP_STONE' : 'SCRAP_GOLD';
      default:
        return 'SCRAP_GOLD';
    }
  }

  /**
   * Tính bù tiền Trade-in
   * 
   * Dương = khách trả thêm
   * Âm = shop hoàn lại
   */
  calculateTradeInDifference(buybackPrice: number, newItemPrice: number): number {
    return newItemPrice - buybackPrice;
  }
}