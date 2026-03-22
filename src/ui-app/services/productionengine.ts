
import { OrderStatus, WeightTracking, ProductionOrder } from '../types';

export class ProductionEngine {
  // Module 1 & 6: Định mức hao hụt chuẩn Luxury Tam
  private static LOSS_THRESHOLDS: Partial<Record<OrderStatus, number>> = {
    [OrderStatus.CASTING]: 1.5,     // Ngưỡng đúc: 1.5%
    [OrderStatus.COLD_WORK]: 0.8,   // Ngưỡng nguội: 0.8%
    [OrderStatus.STONE_SETTING]: 0.2,
    [OrderStatus.FINISHING]: 0.5
  };

  private static TOTAL_ALLOWED_LOSS = 2.3; // Ngưỡng tổng cực đại cho phép (Module 1 logic)

  /**
   * Cỗ máy tính toán hao hụt thực tế (LossCalculator)
   */
  static calculateLoss(issuedWeight: number, btpWeight: number, recoveryWeight: number, stage: OrderStatus) {
    const loss = issuedWeight - (btpWeight + recoveryWeight);
    const percentage = (loss / issuedWeight) * 100;
    const threshold = this.LOSS_THRESHOLDS[stage] || 1.0;

    return {
      loss,
      percentage,
      threshold,
      isExceeded: percentage > threshold,
      alertLevel: percentage > threshold ? 'CRITICAL' : (percentage > threshold - 0.2 ? 'WARNING' : 'NORMAL')
    };
  }

  /**
   * Động cơ Workflow tự động (WorkflowEngine)
   * CẬP NHẬT: Nếu bị vượt định mức, status bắt buộc chuyển về LOSS_ALERT
   * KHÓA CỨNG: Nếu tổng hao hụt > 2.3%, không cho phép sang STONE_SETTING
   */
  static getNextStage(current: OrderStatus, totalLoss: number = 0, isManagerApproved: boolean = false): OrderStatus {
    // Logic Hard-Lock Module 1
    if (current === OrderStatus.COLD_WORK && totalLoss > this.TOTAL_ALLOWED_LOSS && !isManagerApproved) {
      return OrderStatus.LOSS_ALERT; // Bị nghẽn tại đây để Master duyệt
    }

    const workflowMap: Partial<Record<OrderStatus, OrderStatus>> = {
      [OrderStatus.SALE_ORDER]: OrderStatus.DESIGNING,
      [OrderStatus.DESIGNING]: OrderStatus.WAX_READY,
      [OrderStatus.WAX_READY]: OrderStatus.MATERIAL_ISSUED,
      [OrderStatus.MATERIAL_ISSUED]: OrderStatus.CASTING,
      [OrderStatus.CASTING]: OrderStatus.COLLECTING_BTP,
      [OrderStatus.COLLECTING_BTP]: OrderStatus.COLD_WORK,
      [OrderStatus.COLD_WORK]: OrderStatus.STONE_SETTING,
      [OrderStatus.STONE_SETTING]: OrderStatus.FINISHING,
      [OrderStatus.FINISHING]: OrderStatus.QC_PENDING,
      [OrderStatus.QC_PENDING]: OrderStatus.QC_PASSED,
      [OrderStatus.QC_PASSED]: OrderStatus.COMPLETED
    };

    return workflowMap[current] || current;
  }
}
