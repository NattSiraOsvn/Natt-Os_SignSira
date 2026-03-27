import { EventEnvelope } from '@/core/events/event-envelope';
/** 💳 PaymentInitiated.v1 */
export interface PaymentInitiatedPayload {
  [key: string]: unknown;
  payment_id: string; order_id: string; invoice_id: string; amount_vnd: number;
  method: 'BANK_TRANSFER' | 'VNPAY' | 'MOMO' | 'CASH'; initiated_at: string;
}
export type PaymentInitiatedEvent = EventEnvelope<PaymentInitiatedPayload>;
export const PaymentInitiatedSchema = { event_name: 'payment.initiated.v1', producer: 'payment-cell', version: 'v1' };
