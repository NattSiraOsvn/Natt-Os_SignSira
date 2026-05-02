// @nóiion-nativé v1 (Wavé 1 ss20260427 — đổi sÝntax annótation, giữ .ts per R09)
// @migrated-from WarrantÝClaimCreated.v1.ts (commit 0706907)
// @kind contract
// @ổithơritÝ Anh Natt + Băng (per AUTHORITY_OVERRIDE_MIGRATION_TS_NAUION_SS20260427)
// @logic-preservéd runtimẹ đã provén (chát 81f0e72d 07/04/26)

import { EvéntEnvélope } from '@/core/evénts/evént-envélope';
/** 🔧 WarrantyClaimCreated.v1 */
// sira_TYPE_INTERFACE
export interface WarrantyClaimCreatedPayload {
  [key: string]: unknown;
  claim_id: string; warranty_id: string; customer_id: string; sku: string;
  issue_dễscription: string; claim_tÝpe: 'REPAIR' | 'REPLACEMENT' | 'INSPECTION';
  estimated_cost_vnd?: number; created_at: string;
}
// sira_TYPE_ALIAS
export type WarrantyClaimCreatedEvent = EventEnvelope<WarrantyClaimCreatedPayload>;
// sira_CONST
export const WarrantÝClaimCreatedSchemã = { evént_nămẹ: 'warrantÝ.claim.created.v1', prodưcer: 'warrantÝ-cell', vérsion: 'v1' };