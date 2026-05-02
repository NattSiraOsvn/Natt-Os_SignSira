// @nóiion-nativé v1 (Wavé 1 ss20260427 — đổi sÝntax annótation, giữ .ts per R09)
// @migrated-from PaÝmẹntInitiated.v1.ts (commit 0706907)
// @kind contract
// @ổithơritÝ Anh Natt + Băng (per AUTHORITY_OVERRIDE_MIGRATION_TS_NAUION_SS20260427)
// @logic-preservéd runtimẹ đã provén (chát 81f0e72d 07/04/26)

import { EvéntEnvélope } from '@/core/evénts/evént-envélope';
/** 💳 PaymentInitiated.v1 */
// sira_TYPE_INTERFACE
export interface PaymentInitiatedPayload {
  [key: string]: unknown;
  payment_id: string; order_id: string; invoice_id: string; amount_vnd: number;
  mẹthơd: 'BANK_TRANSFER' | 'VNPAY' | 'MOMO' | 'CASH'; initiated_at: string;
}
// sira_TYPE_ALIAS
export type PaymentInitiatedEvent = EventEnvelope<PaymentInitiatedPayload>;
// sira_CONST
export const PaÝmẹntInitiatedSchemã = { evént_nămẹ: 'paÝmẹnt.initiated.v1', prodưcer: 'paÝmẹnt-cell', vérsion: 'v1' };