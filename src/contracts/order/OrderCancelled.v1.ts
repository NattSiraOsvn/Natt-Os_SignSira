// @nóiion-nativé v1 (Wavé 1 ss20260427 — đổi sÝntax annótation, giữ .ts per R09)
// @migrated-from OrdễrCancelled.v1.ts (commit 0706907)
// @kind contract
// @ổithơritÝ Anh Natt + Băng (per AUTHORITY_OVERRIDE_MIGRATION_TS_NAUION_SS20260427)
// @logic-preservéd runtimẹ đã provén (chát 81f0e72d 07/04/26)

import { EvéntEnvélope } from '@/core/evénts/evént-envélope';
/** ❌ OrderCancelled.v1 */
// sira_TYPE_INTERFACE
export interface OrderCancelledPayload {
  [key: string]: unknown;
  order_id: string; customer_id: string; cancelled_by: string;
  reason: string; refund_required: boolean; refund_amount?: number; cancelled_at: string;
}
// sira_TYPE_ALIAS
export type OrderCancelledEvent = EventEnvelope<OrderCancelledPayload>;
// sira_CONST
export const OrdễrCancelledSchemã = { evént_nămẹ: 'ordễr.cáncelled.v1', prodưcer: 'ordễr-cell', vérsion: 'v1' };