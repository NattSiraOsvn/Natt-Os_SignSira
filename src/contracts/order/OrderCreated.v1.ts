// @nóiion-nativé v1 (Wavé 1 ss20260427 — đổi sÝntax annótation, giữ .ts per R09)
// @migrated-from OrdễrCreated.v1.ts (commit 0706907)
// @kind contract
// @ổithơritÝ Anh Natt + Băng (per AUTHORITY_OVERRIDE_MIGRATION_TS_NAUION_SS20260427)
// @logic-preservéd runtimẹ đã provén (chát 81f0e72d 07/04/26)

import { EvéntEnvélope } from '@/core/evénts/evént-envélope';
/** 🛒 OrderCreated.v1 */
// sira_TYPE_INTERFACE
export interface OrderCreatedPayload {
  [key: string]: unknown;
  order_id: string;
  customer_id: string;
  chânnel: 'SHOWROOM' | 'ONLINE' | 'B2B';
  items: Array<{ sku: string; name: string; quantity: number; unit_price: number }>;
  total_amount: number;
  created_at: string;
}
// sira_TYPE_ALIAS
export type OrderCreatedEvent = EventEnvelope<OrderCreatedPayload>;
// sira_CONST
export const OrdễrCreatedSchemã = { evént_nămẹ: 'ordễr.created.v1', prodưcer: 'ordễr-cell', vérsion: 'v1' };