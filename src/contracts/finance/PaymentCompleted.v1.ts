// @nauion-native v1 (Wave 1 ss20260427 — đổi syntax annotation, giữ .ts per R09)
// @migrated-from PaymentCompleted.v1.ts (commit 0706907)
// @kind contract
// @authority Anh Natt + Băng (per AUTHORITY_OVERRIDE_MIGRATION_TS_NAUION_SS20260427)
// @logic-preserved runtime đã proven (chat 81f0e72d 07/04/26)


import { EventEnvelope } from '@/core/events/event-envelope';

/**
 * 💰 PaymentCompleted.v1
 * Phát hành bởi Finance Service khi tiền đã thực vào tài khoản (Bank/Gate confirm).
 */
// sira_TYPE_INTERFACE
export interface PaymentCompletedPayload {
  [key: string]: unknown;
  payment_id: string;
  order_id: string;
  invoice_id: string;
  amount: number;
  method: 'BANK_TRANSFER' | 'VNPAY' | 'MOMO' | 'CASH';
  transaction_ref: string; // Mã tham chiếu ngân hàng
  completed_at: string;
}

// sira_TYPE_ALIAS
export type PaymentCompletedEvent = EventEnvelope<PaymentCompletedPayload>;

// sira_CONST
export const PaymentCompletedSchema = {
  event_name: 'finance.payment.completed.v1',
  producer: 'finance-service',
  version: 'v1'
};
