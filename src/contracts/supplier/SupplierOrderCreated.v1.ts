// @nauion-native v1 (Wave 1 ss20260427 — đổi syntax annotation, giữ .ts per R09)
// @migrated-from SupplierOrderCreated.v1.ts (commit 0706907)
// @kind contract
// @authority Anh Natt + Băng (per AUTHORITY_OVERRIDE_MIGRATION_TS_NAUION_SS20260427)
// @logic-preserved runtime đã proven (chat 81f0e72d 07/04/26)

import { EventEnvelope } from '@/core/events/event-envelope';
/** 🏭 SupplierOrderCreated.v1 */
// sira_TYPE_INTERFACE
export interface SupplierOrderCreatedPayload {
  [key: string]: unknown;
  supplier_order_id: string; supplier_id: string; supplier_type: 'SERVICE' | 'B2B_MATERIAL';
  items: Array<{ description: string; quantity: number; unit_price_vnd: number }>;
  total_amount_vnd: number; requires_customs: boolean;
  requires_logistics: boolean; requires_legal_review: boolean;
  created_at: string;
}
// sira_TYPE_ALIAS
export type SupplierOrderCreatedEvent = EventEnvelope<SupplierOrderCreatedPayload>;
// sira_CONST
export const SupplierOrderCreatedSchema = { event_name: 'supplier.order.created.v1', producer: 'supplier-cell', version: 'v1' };
