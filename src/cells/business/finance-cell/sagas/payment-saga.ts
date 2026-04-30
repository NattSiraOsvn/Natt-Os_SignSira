//  — TODO: fix type errors, remove this pragma

// — legacy V1 imports pending migration

import { EventBus } from '../../../../core/events/event-bus';
import { PaymentAggregate } from '../../domain/payment.aggregate';
import { EventEnvelope } from '../../../../types';
import { RetryPolicy } from '../messaging/retry-policy';
import { DeadLetterHandler } from '../messaging/dead-letter-handler';
import { FinanceAuditLogger } from '../audit/audit-logger';

/**
 * 🎼 PAYMENT SAGA ORCHESTRATOR
 * Điều phối luồng tiền từ khi khởi tạo đến khi chốt đơn.
 */
export class PaymentSaga {
  
  public static init() {
    // Lắng nghe yêu cầu thanh toán từ Gateway/UI
    EventBus.on('finance.invoice.created.v1', async (event: EventEnvelope) => {
      await this.handleInvoiceIssued(event);
    });
  }

  private static async handleInvoiceIssued(event: EventEnvelope) {
    await RetryPolicy.execute(
      async () => {
        const payment = PaymentAggregate.initiate(
          event.payload.order_id,
          event.payload.invoice_id,
          event.payload.amounts.total,
          'VNPAY', // Mặc định trong v1
          event.trace.correlation_id
        );

        await FinanceAuditLogger.logAction({
          action: 'PAYMENT_INITIATED',
          actor: 'finance-service-saga',
          entity_type: 'PAYMENT',
          entity_id: payment.getState().id,
          new_state_hash: payment.generateHash(),
          correlation_id: event.trace.correlation_id
        });

        console.log(`[SAGA-PAYMENT] khoi tao giao dich ${payment.getState().id} cho hoa don ${event.payload.invoice_id}`);
      },
      `PaymentInitiation[Order:${event.payload.order_id}]`,
      async (err) => await DeadLetterHandler.escalate(event, err)
    );
  }
}
