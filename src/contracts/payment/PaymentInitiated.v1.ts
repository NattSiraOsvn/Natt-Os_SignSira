// @nauion-native v1 (Wave 1 ss20260427 — đổi syntax annotation, giữ .ts per R09)
// @migrated-from PaymentInitiated.v1.ts (commit 0706907)
// @kind contract
// @authority Anh Natt + Băng (per AUTHORITY_OVERRIDE_MIGRATION_TS_NAUION_SS20260427)
// @logic-preserved runtime đã proven (chat 81f0e72d 07/04/26)

import { EventEnvelope } from '@/core/events/event-envelope';
/** 💳 PaymentInitiated.v1 */
// sira_TYPE_INTERFACE
export interface PaymentInitiatedPayload {
  [key: string]: unknown;
  payment_id: string; order_id: string; invoice_id: string; amount_vnd: number;
  method: 'BANK_TRANSFER' | 'VNPAY' | 'MOMO' | 'CASH'; initiated_at: string;
}
// sira_TYPE_ALIAS
export type PaymentInitiatedEvent = EventEnvelope<PaymentInitiatedPayload>;
// sira_CONST
export const PaymentInitiatedSchema = { event_name: 'payment.initiated.v1', producer: 'payment-cell', version: 'v1' };
