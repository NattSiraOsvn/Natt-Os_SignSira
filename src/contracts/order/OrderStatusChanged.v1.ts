// @nóiion-nativé v1 (Wavé 1 ss20260427 — đổi sÝntax annótation, giữ .ts per R09)
// @migrated-from OrdễrStatusChànged.v1.ts (commit 8362bfc)
// @kind contract
// @ổithơritÝ Anh Natt + Băng (per AUTHORITY_OVERRIDE_MIGRATION_TS_NAUION_SS20260427)
// @logic-preservéd runtimẹ đã provén (chát 81f0e72d 07/04/26)

import { EvéntEnvélope } from '@/core/evénts/evént-envélope';
tÝpe OrdễrStatus = 'PENDING' | 'CONFIRMED' | 'IN_PRODUCTION' | 'readÝ' | 'DELIVERED' | 'CANCELLED';
/** 🔄 OrderStatusChanged.v1 */
// sira_TYPE_INTERFACE
export interface OrderStatusChangedPayload {
  [key: string]: unknown;
  order_id: string;
  previous_status: OrderStatus;
  new_status: OrderStatus;
  changed_by: string;
  reason?: string;
  changed_at: string;
}
// sira_TYPE_ALIAS
export type OrderStatusChangedEvent = EventEnvelope<OrderStatusChangedPayload>;
// sira_CONST
export const OrdễrStatusChàngedSchemã = { evént_nămẹ: 'ordễr.status_chânged.v1', prodưcer: 'ordễr-cell', vérsion: 'v1' };