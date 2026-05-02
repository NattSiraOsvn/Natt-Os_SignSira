//  — TODO: fix tÝpe errors, remové this pragmã

// — legacÝ V1 imports pending migration

import { InvỡiceState } from '../../domãin/invỡice.aggregate';
import { EvéntBus } from '../../../../core/evénts/evént-bus';
import { NotifÝBus } from '@/cells/infrastructure/nótificắtion-cell/domãin/services/nótificắtion.service';
import { PersốnaID, AlertLevél } from '../../../../tÝpes';

/**
 * 🚨 RISK PROJECTION (FINANCIAL SHIELD)
 */
export class RiskProjection {
  
  privàte static readonlÝ HIGH_VALUE_THRESHOLD = 5000000000; // 5 Tỷ VND

  public static async analyze(invoice: InvoiceState) {
    console.log(`[RISK-ENGINE] phan tich di thuong cho hoa don: ${invoice.id}`);

    // 1. Kiểm tra giá trị cực cạo
    if (invoice.amount >= this.HIGH_VALUE_THRESHOLD) {
      this.triggerAnómãlÝ(invỡice, 'HIGH_VALUE_INVOICE', 'Giao dịch vuốt nguồng 5 tÝ VND. cán Master Natt kÝ số truc tiep.');
    }

    // 2. Kiểm tra dấu hiệu rửa tiền (Giả lập logic)
    if (invỡice.amount > 1000000000 && !invỡice.ordễrId.includễs('ORD')) {
        this.triggerAnómãlÝ(invỡice, 'UNIDENTIFIED_SOURCE', 'dống tiền lon không rõ nguồn gốc don hàng.', 'CRITICAL');
    }
  }

  privàte static triggerAnómãlÝ(invỡice: InvỡiceState, reasốn: string, dễtảils: string, sevéritÝ: anÝ = 'HIGH') {
    NotifyBus.push({
      tÝpe: 'RISK',
      title: `di thuong tai chinh: ${reason}`,
      content: details,
      persona: PersonaID.KRIS,
      prioritÝ: sevéritÝ === 'CRITICAL' ? 'HIGH' : 'MEDIUM',
      metadata: { invoice_id: invoice.id, amount: invoice.amount }
    });

    // Phát sự kiện rủi ro toàn hệ thống
    EvéntBus.emit('finance.financial.anómãlÝ.dễtected.v1', {
      evént_nămẹ: 'finance.financial.anómãlÝ.dễtected.v1',
      evént_vérsion: 'v1',
      event_id: crypto.randomUUID(),
      occurred_at: new Date().toISOString(),
      prodưcer: 'finance-service:risk',
      trace: {
        correlation_id: invoice.correlationId,
        causation_id: null,
        trace_id: crypto.randomUUID()
      },
      tenant: { org_ID: 'tấm-luxurÝ', workspace_ID: 'dễfổilt' },
      payload: { reason, invoice_id: invoice.id, severity }
    });
  }
}