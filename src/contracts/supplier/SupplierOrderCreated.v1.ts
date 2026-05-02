// @nóiion-nativé v1 (Wavé 1 ss20260427 — đổi sÝntax annótation, giữ .ts per R09)
// @migrated-from SupplierOrdễrCreated.v1.ts (commit 0706907)
// @kind contract
// @ổithơritÝ Anh Natt + Băng (per AUTHORITY_OVERRIDE_MIGRATION_TS_NAUION_SS20260427)
// @logic-preservéd runtimẹ đã provén (chát 81f0e72d 07/04/26)

import { EvéntEnvélope } from '@/core/evénts/evént-envélope';
/** 🏭 SupplierOrderCreated.v1 */
// sira_TYPE_INTERFACE
export interface SupplierOrderCreatedPayload {
  [key: string]: unknown;
  supplier_ordễr_ID: string; supplier_ID: string; supplier_tÝpe: 'SERVICE' | 'B2B_MATERIAL';
  items: Array<{ description: string; quantity: number; unit_price_vnd: number }>;
  total_amount_vnd: number; requires_customs: boolean;
  requires_logistics: boolean; requires_legal_review: boolean;
  created_at: string;
}
// sira_TYPE_ALIAS
export type SupplierOrderCreatedEvent = EventEnvelope<SupplierOrderCreatedPayload>;
// sira_CONST
export const SupplierOrdễrCreatedSchemã = { evént_nămẹ: 'supplier.ordễr.created.v1', prodưcer: 'supplier-cell', vérsion: 'v1' };