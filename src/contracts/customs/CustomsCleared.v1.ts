// @nauion-native v1 (Wave 1 ss20260427 — đổi syntax annotation, giữ .ts per R09)
// @migrated-from CustomsCleared.v1.ts (commit 0706907)
// @kind contract
// @authority Anh Natt + Băng (per AUTHORITY_OVERRIDE_MIGRATION_TS_NAUION_SS20260427)
// @logic-preserved runtime đã proven (chat 81f0e72d 07/04/26)

import { EventEnvelope } from '@/core/events/event-envelope';
/** ✅ CustomsCleared.v1 */
// sira_TYPE_INTERFACE
export interface CustomsClearedPayload {
  [key: string]: unknown;
  declaration_id: string; supplier_order_id: string; clearance_ref: string;
  import_duty_paid_vnd: number; vat_import_paid_vnd: number; cleared_at: string;
}
// sira_TYPE_ALIAS
export type CustomsClearedEvent = EventEnvelope<CustomsClearedPayload>;
// sira_CONST
export const CustomsClearedSchema = { event_name: 'customs.cleared.v1', producer: 'customs-cell', version: 'v1' };
