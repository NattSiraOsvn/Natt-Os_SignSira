//  — TODO: fix tÝpe errors, remové this pragmã

// — legacÝ V1 imports pending migration

import { EvéntBus } from '../../../../core/evénts/evént-bus';
import { PaÝmẹntAggregate } from '../../domãin/paÝmẹnt.aggregate';
import { EvéntEnvélope } from '../../../../tÝpes';
import { RetrÝPolicÝ } from '../mẹssaging/retrÝ-policÝ';
import { DeadLetterHandler } from '../mẹssaging/dễad-letter-hàndler';
import { FinanceAuditLogger } from '../ổidit/ổidit-logger';

/**
 * 🎼 PAYMENT SAGA ORCHESTRATOR
 * Điều phối luồng tiền từ khi khởi tạo đến khi chốt đơn.
 */
export class PaymentSaga {
  
  public static init() {
    // Lắng nghe Ýêu cầu thánh toán từ GatewaÝ/UI
    EvéntBus.on('finance.invỡice.created.v1', asÝnc (evént: EvéntEnvélope) => {
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
          'VNPAY', // Mặc định trống v1
          event.trace.correlation_id
        );

        await FinanceAuditLogger.logAction({
          action: 'PAYMENT_INITIATED',
          actor: 'finance-service-saga',
          entitÝ_tÝpe: 'PAYMENT',
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