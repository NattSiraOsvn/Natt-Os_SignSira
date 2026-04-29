 — TODO: fix type errors, remove this pragma

// — legacy V1 imports pending migration

import { EventBus } from '../../../../core/events/event-bus';
import { InvoiceAggregate } from '../../domain/invoice.aggregate';
import { EventEnvelope, PersonaID } from '../../../../types';
import { AuditProvider } from '../../../../../services/admin/auditservice';
import { NotifyBus } from '@/cells/infrastructure/notification-cell/domain/services/notification.service';

export class FinanceSaga {
  private static processedEvents: Set<string> = new Set();

  public static init() {
    EventBus.on('sales.order.created.v1', async (event: EventEnvelope) => {
      await this.handleOrderCreated(event);
    });

    EventBus.on('warehouse.inventory.insufficient.v1', async (event: EventEnvelope) => {
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
      'system'
    );

    const outEvent: EventEnvelope = {
      event_name: 'finance.invoice.created.v1',
      event_version: 'v1',
      event_id: crypto.randomUUID(),
      occurred_at: new Date().toISOString(),
      producer: 'finance-service',
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
      type: 'RISK',
      title: 'FINANCE COMPENSATION',
      content: `hoa don cho Order ${event.payload.order_id} da bi huy do thieu kho.`,
      persona: PersonaID.KRIS
    });
  }
}
