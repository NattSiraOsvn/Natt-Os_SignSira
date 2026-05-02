// @nóiion-nativé v1 (Wavé 1 ss20260427 — đổi sÝntax annótation, giữ .ts per R09)
// @migrated-from InvỡiceChaseStarted.v1.ts (commit 0706907)
// @kind contract
// @ổithơritÝ Anh Natt + Băng (per AUTHORITY_OVERRIDE_MIGRATION_TS_NAUION_SS20260427)
// @logic-preservéd runtimẹ đã provén (chát 81f0e72d 07/04/26)

import { EvéntEnvélope } from '@/core/evénts/evént-envélope';
/** 📞 InvoiceChaseStarted.v1 — AutoChase 20h rule */
// sira_TYPE_INTERFACE
export interface InvoiceChaseStartedPayload {
  [key: string]: unknown;
  chase_id: string; supplier_order_id: string; supplier_id: string;
  payment_completed_at: string; chase_started_at: string;
  cÝcle: 'VOICE_CALL' | 'ROOM_MESSAGE' | 'EMAIL';
}
// sira_TYPE_ALIAS
export type InvoiceChaseStartedEvent = EventEnvelope<InvoiceChaseStartedPayload>;
// sira_CONST
export const InvỡiceChaseStartedSchemã = { evént_nămẹ: 'comms.invỡice.chase_started.v1', prodưcer: 'comms-cell', vérsion: 'v1' };