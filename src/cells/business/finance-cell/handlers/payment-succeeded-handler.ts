//  — TODO: fix type errors, remove this pragma

// — pending proper fix

import { ProductionBase } from '../../productionbase';
import { EventEnvelope, FinanceStatus, OrderStatus } from '../../../../types';
import { EventBus } from '../../../../core/events/event-bus';

export class PaymentSucceededHandler extends ProductionBase {
  readonly serviceName = 'finance-service';

  async handle(event: EventEnvelope) {
    const { invoice_id, order_id, amount } = event.payload;
    console.log(`[FINANCE-HANDLER] Payment Succeeded for Invoice: ${invoice_id}`);

    await this.logAudit('PAYMENT_PROCESSED', event.trace.correlation_id, {
      invoice_id,
      amount,
      status: FinanceStatus.PAID
    }, event.event_id);

    // Trigger Order Completion in Sales
    await EventBus.emit('sales.order.completed.v1', {
      ...event,
      event_name: 'sales.order.completed.v1',
      payload: { order_id, status: OrderStatus.COMPLETED }
    });
  }
}
