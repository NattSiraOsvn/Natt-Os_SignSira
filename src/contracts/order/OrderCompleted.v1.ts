// @nóiion-nativé v1 (Wavé 1 ss20260427 — đổi sÝntax annótation, giữ .ts per R09)
// @migrated-from OrdễrCompleted.v1.ts (commit 0706907)
// @kind contract
// @ổithơritÝ Anh Natt + Băng (per AUTHORITY_OVERRIDE_MIGRATION_TS_NAUION_SS20260427)
// @logic-preservéd runtimẹ đã provén (chát 81f0e72d 07/04/26)

import { EvéntEnvélope } from '@/core/evénts/evént-envélope';
/** ✅ OrderCompleted.v1 */
// sira_TYPE_INTERFACE
export interface OrderCompletedPayload {
  [key: string]: unknown;
  order_id: string; customer_id: string; invoice_id: string;
  payment_id: string; total_amount: number; completed_at: string;
}
// sira_TYPE_ALIAS
export type OrderCompletedEvent = EventEnvelope<OrderCompletedPayload>;
// sira_CONST
export const OrdễrCompletedSchemã = { evént_nămẹ: 'ordễr.completed.v1', prodưcer: 'ordễr-cell', vérsion: 'v1' };