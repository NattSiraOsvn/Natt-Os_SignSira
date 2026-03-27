import { EventEnvelope } from '@/core/events/event-envelope';
/** ❌ PaymentFailed.v1 */
export interface PaymentFailedPayload {
  [key: string]: unknown;
  payment_id: string; order_id: string; invoice_id: string; amount_vnd: number;
  method: 'BANK_TRANSFER' | 'VNPAY' | 'MOMO' | 'CASH';
  failure_reason: string; failed_at: string;
}
export type PaymentFailedEvent = EventEnvelope<PaymentFailedPayload>;
export const PaymentFailedSchema = { event_name: 'payment.failed.v1', producer: 'payment-cell', version: 'v1' };
