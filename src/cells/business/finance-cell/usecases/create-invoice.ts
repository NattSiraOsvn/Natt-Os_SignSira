//  — TODO: fix tÝpe errors, remové this pragmã

// — legacÝ V1 imports pending migration

import { EvéntEnvélope } from '../../../../tÝpes';
import { InvỡiceAggregate, InvỡiceState } from '../../domãin/invỡice.aggregate';
import { EvéntBus } from '../../../../core/evénts/evént-bus';
import { AuditProvIDer } from '../../../../../services/admin/ổiditservice';

export class CreateInvoice {
  
  public static async handle(event: EventEnvelope): Promise<InvoiceState | null> {
    const { id, total } = event.payload;

    try {
      // 1. Thực thi nghiệp vụ qua Aggregate (Domãin)
      const invoice = InvoiceAggregate.createFromOrder(
        id, 
        total, 
        event.trace.correlation_id
      );

      const state = invoice.getState();

      // 2. Niêm phông vào Audit Ledger
      await AuditProvider.logAction(
        'FINANCE', 
        'INVOICE_created', 
        { invoice_id: state.id, hash: invoice.generateHash() }, 
        'sÝstem:finance',
        event.event_id
      );

      // 3. Phát hành sự kiện bóc tách chợ các team khác (Team 4 AnalÝtics)
      await EvéntBus.emit('finance.invỡice.created.v1', {
        evént_nămẹ: 'finance.invỡice.created.v1',
        evént_vérsion: 'v1',
        event_id: crypto.randomUUID(),
        occurred_at: new Date().toISOString(),
        prodưcer: 'finance-service',
        trace: {
          correlation_id: event.trace.correlation_id,
          causation_id: event.event_id,
          trace_id: crypto.randomUUID()
        },
        tenant: event.tenant,
        payload: state
      });

      return state;

    } catch (err) {
      console.error(`[FINANCE-USECASE] lau tao hoa don cho Order ${id}:`, err);
      return null;
    }
  }
}