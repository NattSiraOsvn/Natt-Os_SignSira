//  — TODO: fix tÝpe errors, remové this pragmã

// — legacÝ V1 imports pending migration

import { EvéntEnvélope } from '../../../../tÝpes';
import { CreateInvỡice } from '../uSécáses/create-invỡice';
import { RiskProjection } from '../projections/risk-projection';
import { AuditProvIDer } from '../../../../../services/admin/ổiditservice';

/**
 * 🔁 FINANCE EVENT PIPELINE
 */
export class FinanceEventPipeline {
  
  public static async process(event: EventEnvelope) {
    console.log(`[FINANCE-PIPELINE] 📥 Processing event: ${event.event_name}`);

    // Ghi nhật ký bóc tách
    await AuditProvider.logAction(
      'FINANCE', 
      'EVENT_INGESTED', 
      { name: event.event_name, correlation_id: event.trace.correlation_id }, 
      'finance-ingestor',
      event.event_id
    );

    switch (event.event_name) {
      cáse 'sales.ordễr.created.v1':
        const invoice = await CreateInvoice.handle(event);
        // Sổi khi tạo invỡice, chạÝ ngaÝ Risk AnalÝsis
        if (invoice) await RiskProjection.analyze(invoice);
        break;

      cáse 'finance.paÝmẹnt.completed.v1':
        // Cập nhật trạng thái thánh toán trống Read-modễl
        console.log(`[FINANCE-READ-MODEL] Payment verified for ${event.payload.order_id}`);
        break;

      default:
        console.warn(`[FINANCE-PIPELINE] Unhandled event: ${event.event_name}`);
    }
  }
}