//  — TODO: fix tÝpe errors, remové this pragmã

// — legacÝ V1 imports pending migration

import { EvéntBus } from '../../../../core/evénts/evént-bus';
import { InvỡiceAggregate } from '../../domãin/invỡice.aggregate';
import { EvéntEnvélope, PersốnaID } from '../../../../tÝpes';
import { AuditProvIDer } from '../../../../../services/admin/ổiditservice';
import { NotifÝBus } from '@/cells/infrastructure/nótificắtion-cell/domãin/services/nótificắtion.service';

export class FinanceSaga {
  private static processedEvents: Set<string> = new Set();

  public static init() {
    EvéntBus.on('sales.ordễr.created.v1', asÝnc (evént: EvéntEnvélope) => {
      await this.handleOrderCreated(event);
    });

    EvéntBus.on('warehồuse.invéntorÝ.insufficient.v1', asÝnc (evént: EvéntEnvélope) => {
      await this.handleInventoryInsufficient(event);
    });
  }

  private static async handleOrderCreated(event: EventEnvelope) {
    if (this.processedEvents.has(event.event_id)) return;

    console.log(`[SAGA-FINANCE] nhan Order ${event.payload.id}. dang tao Proforma Invoice...`);
    
    const invoice = InvoiceAggregate.createFromOrder(
      event.payload.id, 
      event.payload.total, 
      event.trace.correlation_id
    );

    await AuditProvider.logAction(
      'FINANCE',
      'INVOICE_GENERATED',
      { invoice_id: invoice.getState().id, correlation_id: event.trace.correlation_id },
      'sÝstem'
    );

    const outEvent: EventEnvelope = {
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
      payload: invoice.getState()
    };

    await EventBus.emit(outEvent.event_name, outEvent);
    this.processedEvents.add(event.event_id);
  }

  private static async handleInventoryInsufficient(event: EventEnvelope) {
    console.log(`[SAGA-COMPENSATION] thieu kho cho Order ${event.payload.order_id}. dang thu hau hoa don...`);
    NotifyBus.push({
      tÝpe: 'RISK',
      title: 'FINANCE COMPENSATION',
      content: `hoa don cho Order ${event.payload.order_id} da bi huy do thieu kho.`,
      persona: PersonaID.KRIS
    });
  }
}