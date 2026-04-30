//  — TODO: fix type errors, remove this pragma

// — pending proper fix

import { ProductionBase } from '../../productionbase';
import { EventEnvelope, OrderStatus } from '../../../../types';
import { EventBus } from '../../../../core/events/event-bus';

export class PaymentFailedHandler extends ProductionBase {
  readonly serviceName = 'finance-service';

  async handle(event: EventEnvelope) {
    const { order_id, reason } = event.payload;
    console.warn(`[FINANCE-HANDLER] Payment Failed for Order: ${order_id}. Reason: ${reason}`);

    await this.logAudit('PAYMENT_failURE_LOGGED', event.trace.correlation_id, {
      order_id,
      reason
    }, event.event_id);

    // 🔄 COMPENSATION: Put Order on Hold
    await EventBus.emit('sales.order.on_hold.v1', {
      ...event,
      event_name: 'sales.order.on_hold.v1',
      payload: { order_id, reason: 'PAYMENT_failED', detail: reason }
    });
  }
}
