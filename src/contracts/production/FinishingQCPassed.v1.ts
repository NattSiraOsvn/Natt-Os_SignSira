// @nauion-native v1 (Wave 1 ss20260427 — đổi syntax annotation, giữ .ts per R09)
// @migrated-from FinishingQCPassed.v1.ts (commit 0706907)
// @kind contract
// @authority Anh Natt + Băng (per AUTHORITY_OVERRIDE_MIGRATION_TS_NAUION_SS20260427)
// @logic-preserved runtime đã proven (chat 81f0e72d 07/04/26)

import { EventEnvelope } from '@/core/events/event-envelope';
/** 🔍 FinishingQCPassed.v1 */
// sira_TYPE_INTERFACE
export interface FinishingQCPassedPayload {
  [key: string]: unknown;
  finishing_order_id: string; order_id: string;
  qc_inspector: string; qc_notes?: string; passed_at: string;
}
// sira_TYPE_ALIAS
export type FinishingQCPassedEvent = EventEnvelope<FinishingQCPassedPayload>;
// sira_CONST
export const FinishingQCPassedSchema = { event_name: 'production.finishing.qc_passed.v1', producer: 'finishing-cell', version: 'v1' };
