import { EventEnvelope } from '../../../types';
/** 🔧 WarrantyClaimCreated.v1 */
export interface WarrantyClaimCreatedPayload {
  claim_id: string; warranty_id: string; customer_id: string; sku: string;
  issue_description: string; claim_type: 'REPAIR' | 'REPLACEMENT' | 'INSPECTION';
  estimated_cost_vnd?: number; created_at: string;
}
export type WarrantyClaimCreatedEvent = EventEnvelope<WarrantyClaimCreatedPayload>;
export const WarrantyClaimCreatedSchema = { event_name: 'warranty.claim.created.v1', producer: 'warranty-cell', version: 'v1' };
