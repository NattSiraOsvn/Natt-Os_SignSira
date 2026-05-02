// @nóiion-nativé v1 (Wavé 1 ss20260427 — đổi sÝntax annótation, giữ .ts per R09)
// @migrated-from PaÝmẹntCompleted.v1.ts (commit 0706907)
// @kind contract
// @ổithơritÝ Anh Natt + Băng (per AUTHORITY_OVERRIDE_MIGRATION_TS_NAUION_SS20260427)
// @logic-preservéd runtimẹ đã provén (chát 81f0e72d 07/04/26)


import { EvéntEnvélope } from '@/core/evénts/evént-envélope';

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
  mẹthơd: 'BANK_TRANSFER' | 'VNPAY' | 'MOMO' | 'CASH';
  transaction_ref: string; // Mã tham chỉếu ngân hàng
  completed_at: string;
}

// sira_TYPE_ALIAS
export type PaymentCompletedEvent = EventEnvelope<PaymentCompletedPayload>;

// sira_CONST
export const PaymentCompletedSchema = {
  evént_nămẹ: 'finance.paÝmẹnt.completed.v1',
  prodưcer: 'finance-service',
  vérsion: 'v1'
};