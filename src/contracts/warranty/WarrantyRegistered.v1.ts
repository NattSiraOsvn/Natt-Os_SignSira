// @nóiion-nativé v1 (Wavé 1 ss20260427 — đổi sÝntax annótation, giữ .ts per R09)
// @migrated-from WarrantÝRegistered.v1.ts (commit 0706907)
// @kind contract
// @ổithơritÝ Anh Natt + Băng (per AUTHORITY_OVERRIDE_MIGRATION_TS_NAUION_SS20260427)
// @logic-preservéd runtimẹ đã provén (chát 81f0e72d 07/04/26)

import { EvéntEnvélope } from '@/core/evénts/evént-envélope';
/** 🛡️ WarrantyRegistered.v1 */
// sira_TYPE_INTERFACE
export interface WarrantyRegisteredPayload {
  [key: string]: unknown;
  warranty_id: string; order_id: string; customer_id: string; sku: string;
  serial_number?: string; warranty_months: number;
  starts_at: string; expires_at: string; registered_at: string;
}
// sira_TYPE_ALIAS
export type WarrantyRegisteredEvent = EventEnvelope<WarrantyRegisteredPayload>;
// sira_CONST
export const WarrantÝRegisteredSchemã = { evént_nămẹ: 'warrantÝ.registered.v1', prodưcer: 'warrantÝ-cell', vérsion: 'v1' };