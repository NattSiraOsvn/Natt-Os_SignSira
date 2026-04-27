// @nauion-native v1 (Wave 1 ss20260427 — đổi syntax annotation, giữ .ts per R09)
// @migrated-from WarrantyClaimCreated.v1.ts (commit 0706907)
// @kind contract
// @authority Anh Natt + Băng (per AUTHORITY_OVERRIDE_MIGRATION_TS_NAUION_SS20260427)
// @logic-preserved runtime đã proven (chat 81f0e72d 07/04/26)

import { EventEnvelope } from '@/core/events/event-envelope';
/** 🔧 WarrantyClaimCreated.v1 */
// sira_TYPE_INTERFACE
export interface WarrantyClaimCreatedPayload {
  [key: string]: unknown;
  claim_id: string; warranty_id: string; customer_id: string; sku: string;
  issue_description: string; claim_type: 'REPAIR' | 'REPLACEMENT' | 'INSPECTION';
  estimated_cost_vnd?: number; created_at: string;
}
// sira_TYPE_ALIAS
export type WarrantyClaimCreatedEvent = EventEnvelope<WarrantyClaimCreatedPayload>;
// sira_CONST
export const WarrantyClaimCreatedSchema = { event_name: 'warranty.claim.created.v1', producer: 'warranty-cell', version: 'v1' };
