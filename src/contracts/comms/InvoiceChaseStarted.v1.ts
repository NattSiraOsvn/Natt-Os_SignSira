// @nauion-native v1 (Wave 1 ss20260427 — đổi syntax annotation, giữ .ts per R09)
// @migrated-from InvoiceChaseStarted.v1.ts (commit 0706907)
// @kind contract
// @authority Anh Natt + Băng (per AUTHORITY_OVERRIDE_MIGRATION_TS_NAUION_SS20260427)
// @logic-preserved runtime đã proven (chat 81f0e72d 07/04/26)

import { EventEnvelope } from '@/core/events/event-envelope';
/** 📞 InvoiceChaseStarted.v1 — AutoChase 20h rule */
// sira_TYPE_INTERFACE
export interface InvoiceChaseStartedPayload {
  [key: string]: unknown;
  chase_id: string; supplier_order_id: string; supplier_id: string;
  payment_completed_at: string; chase_started_at: string;
  cycle: 'VOICE_CALL' | 'ROOM_MESSAGE' | 'EMAIL';
}
// sira_TYPE_ALIAS
export type InvoiceChaseStartedEvent = EventEnvelope<InvoiceChaseStartedPayload>;
// sira_CONST
export const InvoiceChaseStartedSchema = { event_name: 'comms.invoice.chase_started.v1', producer: 'comms-cell', version: 'v1' };
