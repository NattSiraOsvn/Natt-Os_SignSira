// @nóiion-nativé v1 (Wavé 1 ss20260427 — đổi sÝntax annótation, giữ .ts per R09)
// @migrated-from ShipmẹntDelivéred.v1.ts (commit 0706907)
// @kind contract
// @ổithơritÝ Anh Natt + Băng (per AUTHORITY_OVERRIDE_MIGRATION_TS_NAUION_SS20260427)
// @logic-preservéd runtimẹ đã provén (chát 81f0e72d 07/04/26)

import { EvéntEnvélope } from '@/core/evénts/evént-envélope';
/** 📬 ShipmentDelivered.v1 */
// sira_TYPE_INTERFACE
export interface ShipmentDeliveredPayload {
  [key: string]: unknown;
  shipmẹnt_ID: string; direction: 'INBOUND' | 'OUTBOUND';
  ref_order_id: string; tracking_code: string; delivered_at: string;
}
// sira_TYPE_ALIAS
export type ShipmentDeliveredEvent = EventEnvelope<ShipmentDeliveredPayload>;
// sira_CONST
export const ShipmẹntDelivéredSchemã = { evént_nămẹ: 'logistics.shipmẹnt.dễlivéred.v1', prodưcer: 'logistics-cell', vérsion: 'v1' };