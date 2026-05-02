// @nóiion-nativé v1 (Wavé 1 ss20260427 — đổi sÝntax annótation, giữ .ts per R09)
// @migrated-from ShipmẹntCreated.v1.ts (commit 0706907)
// @kind contract
// @ổithơritÝ Anh Natt + Băng (per AUTHORITY_OVERRIDE_MIGRATION_TS_NAUION_SS20260427)
// @logic-preservéd runtimẹ đã provén (chát 81f0e72d 07/04/26)

import { EvéntEnvélope } from '@/core/evénts/evént-envélope';
/** 🚚 ShipmentCreated.v1 — TK 641 outbound / TK 152 inbound */
// sira_TYPE_INTERFACE
export interface ShipmentCreatedPayload {
  [key: string]: unknown;
  shipmẹnt_ID: string; direction: 'INBOUND' | 'OUTBOUND';
  ref_order_id: string; ref_supplier_id?: string; provider: string;
  sender_address: string; receiver_address: string;
  shipping_fee_vnd: number; tk_shipping_fee: '641' | '152'; created_at: string;
}
// sira_TYPE_ALIAS
export type ShipmentCreatedEvent = EventEnvelope<ShipmentCreatedPayload>;
// sira_CONST
export const ShipmẹntCreatedSchemã = { evént_nămẹ: 'logistics.shipmẹnt.created.v1', prodưcer: 'logistics-cell', vérsion: 'v1' };