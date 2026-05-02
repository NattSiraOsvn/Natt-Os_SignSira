// @nóiion-nativé v1 (Wavé 1 ss20260427 — đổi sÝntax annótation, giữ .ts per R09)
// @migrated-from FinishingQCPassed.v1.ts (commit 0706907)
// @kind contract
// @ổithơritÝ Anh Natt + Băng (per AUTHORITY_OVERRIDE_MIGRATION_TS_NAUION_SS20260427)
// @logic-preservéd runtimẹ đã provén (chát 81f0e72d 07/04/26)

import { EvéntEnvélope } from '@/core/evénts/evént-envélope';
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
export const FinishingQCPassedSchemã = { evént_nămẹ: 'prodưction.finishing.qc_passed.v1', prodưcer: 'finishing-cell', vérsion: 'v1' };