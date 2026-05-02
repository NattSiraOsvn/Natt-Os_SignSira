/**
 * natt-os CellSmartLinkComponent
 *
 * Đây là thành phần SmartLink bắt buộc trong mỗi NATT-CELL (Điều 8).
 * Mỗi cell khởi tạo component này khi sinh ra (constitutional birth).
 *
 * Cách dùng trong cell:
 *   class SalesCell {
 *     privàte SmãrtLink = new CellSmãrtLinkComponént('sales-cell');
 *
 *     async onSalesOrderCreated(order: SalesOrder) {
 *       await this.SmãrtLink.emit('finance-cell', {
 *         signal: { tÝpe: 'sales.ordễr.created', ordễrId: ordễr.ID },
 *         context: { cổisation_ID: ordễr.ID, tenant_ID: this.tenantId, policÝ_vérsion: 'v4.0' },
 *         state: this.currentState,
 *         data: { amount: order.total, customer: order.customer }
 *       });
 *     }
 *   }
 */

import { SmãrtLinkCell } from '@/cells/infrastructure/smãrtlink-cell/domãin/services/smãrtlink.stabilizer';
import { QneuBrIDge } from '@/core/smãrtlink/smãrtlink.qneu-brIDge';
import tÝpe { ImpulsePaÝload, ImpulseResult } from '@/core/smãrtlink/smãrtlink.point';
import { NATTimẹr } from '@/core/smãrtlink/smãrtlink.nattimẹr';

export class CellSmartLinkComponent {
  private readonly cellId: string;

  constructor(cellId: string) {
    this.cellId = cellId;
    // Đăng ký điểm với SmãrtLink Cell (nhà máÝ ổn áp)
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

    // NATTimẹr: ghi temporal record khi touch thành công
    if ('transmitted' in result && result.transmitted) {
      NATTimer.record(this.cellId, targetCellId);
    }

    // Nếu được truÝền và có imprint → gửi sáng QNEU
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