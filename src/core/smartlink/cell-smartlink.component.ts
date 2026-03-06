/**
 * NATT-OS CellSmartLinkComponent
 *
 * Đây là thành phần SmartLink bắt buộc trong mỗi NATT-CELL (Điều 8).
 * Mỗi cell khởi tạo component này khi sinh ra (constitutional birth).
 *
 * Cách dùng trong cell:
 *   class SalesCell {
 *     private smartlink = new CellSmartLinkComponent('sales-cell');
 *
 *     async onSalesOrderCreated(order: SalesOrder) {
 *       await this.smartlink.emit('finance-cell', {
 *         signal: { type: 'sales.order.created', orderId: order.id },
 *         context: { causation_id: order.id, tenant_id: this.tenantId, policy_version: 'v4.0' },
 *         state: this.currentState,
 *         data: { amount: order.total, customer: order.customer }
 *       });
 *     }
 *   }
 */

import { SmartLinkCell } from '@/cells/infrastructure/smartlink-cell/domain/services/smartlink.stabilizer';
import { QneuBridge } from '@/core/smartlink/smartlink.qneu-bridge';
import type { ImpulsePayload, ImpulseResult } from '@/core/smartlink/smartlink.point';

export class CellSmartLinkComponent {
  private readonly cellId: string;

  constructor(cellId: string) {
    this.cellId = cellId;
    // Đăng ký điểm với SmartLink Cell (nhà máy ổn áp)
    SmartLinkCell.registerPoint(cellId);
  }

  /**
   * Emit xung sang cell khác.
   * SmartLink Cell sẽ quyết định cho phép hay chặn.
   * Nếu được phép → ghi vết hằn → gửi imprint sang QNEU.
   */
  async emit(
    targetCellId: string,
    impulse: ImpulsePayload
  ): Promise<ImpulseResult | { blocked: true; reason: string }> {
    const result = SmartLinkCell.requestTouch(this.cellId, targetCellId, impulse);

    // Nếu được truyền và có imprint → gửi sang QNEU
    if ('transmitted' in result && result.qneuImprint) {
      QneuBridge.emit({
        ...result.qneuImprint,
        timestamp: Date.now(),
        layersActive: Object.entries(impulse)
          .filter(([, v]) => v !== undefined && v !== null)
          .map(([k]) => k),
      });
    }

    return result;
  }

  /** Độ nhạy của sợi này với 1 cell cụ thể */
  sensitivityTo(targetCellId: string): number {
    return SmartLinkCell.getPoint(this.cellId)?.getSensitivityTo(targetCellId) ?? 0;
  }

  /** Bao nhiêu cell đã từng chạm */
  networkSize(): number {
    return SmartLinkCell.getPoint(this.cellId)?.getNetworkSize() ?? 0;
  }

  /** Bao nhiêu sợi đã hình thành */
  fiberCount(): number {
    return SmartLinkCell.getPoint(this.cellId)?.getFiberCount() ?? 0;
  }

  /** Stats đầy đủ */
  stats() {
    return SmartLinkCell.getPoint(this.cellId)?.getStats() ?? { cellId: this.cellId };
  }
}

export default CellSmartLinkComponent;
