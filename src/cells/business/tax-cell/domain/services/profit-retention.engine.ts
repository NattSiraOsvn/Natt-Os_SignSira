import { ProfitRetentionPolicy, ProfitAllocation } from '../entities/profit-retention.entity';

export class ProfitRetentionEngine {
  /**
   * Đề xuất tỷ lệ giữ lại dựa trên các yếu tố rủi ro
   */
  static suggestRetentionRate(
    avgGoldVolatility: number,   // độ lệch chuẩn giá vàng 3 năm (%)
    buybackRate: number,         // % doanh thu từ buyback
    cashFlowRisk: 'LOW' | 'MEDIUM' | 'HIGH',
    marketOutlook: 'STABLE' | 'UNCERTAIN' | 'CRISIS'
  ): number {
    let base = 0.5; // 50% mặc định

    if (avgGoldVolatility > 15) base += 0.1;
    else if (avgGoldVolatility > 10) base += 0.05;

    if (buybackRate > 0.3) base += 0.1; // buyback cao cần dự phòng

    if (cashFlowRisk === 'HIGH') base += 0.15;
    else if (cashFlowRisk === 'MEDIUM') base += 0.05;

    if (marketOutlook === 'CRISIS') base += 0.2;
    else if (marketOutlook === 'UNCERTAIN') base += 0.1;

    // Giới hạn trong khoảng 30% - 80%
    return Math.min(0.8, Math.max(0.3, base));
  }

  /**
   * Phân bổ lợi nhuận sau thuế thành 4211 (giữ lại) và 4212 (có thể phân phối)
   */
  static allocateProfit(
    netProfitAfterTax: number,
    retentionRate: number,
    fiscalYear: number
  ): ProfitAllocation {
    const retained = netProfitAfterTax * retentionRate;
    const distributable = netProfitAfterTax - retained;

    return {
      allocationId: `PA-${fiscalYear}-${Date.now()}`,
      fiscalYear,
      netProfitAfterTax,
      retained4211: retained,
      distributable4212: distributable,
      createdAt: new Date(),
    };
  }
}
