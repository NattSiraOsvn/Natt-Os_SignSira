// @ts-nocheck — legacy V1 imports pending migration

import { InvoiceState } from '../../domain/Invoice.aggregate';
import { EventBridge } from '../../../../../services/eventBridge';
import { NotifyBus } from '../../../../../services/notificationService';
import { PersonaID, AlertLevel } from '../../../../../types';

/**
 * 🚨 RISK PROJECTION (FINANCIAL SHIELD)
 */
export class RiskProjection {
  
  private static readonly HIGH_VALUE_THRESHOLD = 5000000000; // 5 Tỷ VND

  public static async analyze(invoice: InvoiceState) {
    console.log(`[RISK-ENGINE] Phân tích dị thường cho Hóa đơn: ${invoice.id}`);

    // 1. Kiểm tra giá trị cực cao
    if (invoice.amount >= this.HIGH_VALUE_THRESHOLD) {
      this.triggerAnomaly(invoice, 'HIGH_VALUE_INVOICE', 'Giao dịch vượt ngưỡng 5 tỷ VND. Cần Master Natt ký số trực tiếp.');
    }

    // 2. Kiểm tra dấu hiệu rửa tiền (Giả lập logic)
    if (invoice.amount > 1000000000 && !invoice.orderId.includes('ORD')) {
        this.triggerAnomaly(invoice, 'UNIDENTIFIED_SOURCE', 'Dòng tiền lớn không rõ nguồn gốc đơn hàng.', 'CRITICAL');
    }
  }

  private static triggerAnomaly(invoice: InvoiceState, reason: string, details: string, severity: any = 'HIGH') {
    NotifyBus.push({
      type: 'RISK',
      title: `DỊ THƯỜNG TÀI CHÍNH: ${reason}`,
      content: details,
      persona: PersonaID.KRIS,
      priority: severity === 'CRITICAL' ? 'HIGH' : 'MEDIUM',
      metadata: { invoice_id: invoice.id, amount: invoice.amount }
    });

    // Phát sự kiện rủi ro toàn hệ thống
    EventBridge.publish('finance.financial.anomaly.detected.v1', {
      event_name: 'finance.financial.anomaly.detected.v1',
      event_version: 'v1',
      event_id: crypto.randomUUID(),
      occurred_at: new Date().toISOString(),
      producer: 'finance-service:risk',
      trace: {
        correlation_id: invoice.correlationId,
        causation_id: null,
        trace_id: crypto.randomUUID()
      },
      tenant: { org_id: 'tam-luxury', workspace_id: 'default' },
      payload: { reason, invoice_id: invoice.id, severity }
    });
  }
}
