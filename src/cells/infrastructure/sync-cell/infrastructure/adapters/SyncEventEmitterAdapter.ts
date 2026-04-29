// @nauion-native v1 (Wave 1 ss20260427 — đổi syntax annotation, giữ .ts per R09)
// @migrated-from SyncEventEmitterAdapter.ts (commit bf26b24)
// @kind adapter-event-emitter
// @authority Anh Natt + Băng (per AUTHORITY_OVERRIDE_MIGRATION_TS_NAUION_SS20260427)
// @logic-preserved runtime đã proven (chat 81f0e72d 07/04/26)

import { SyncEventEmitter } from '../../ports/synceventemitter';

// sira_TYPE_CLASS
export class SyncEventEmitterAdapter implements SyncEventEmitter {
  async emitSyncStarted(jobId: string, source: string, target: string) {
    console.log('[SYNC-CELL] sync.started:', { jobId, source, target });
  }
  async emitSyncCompleted(jobId: string, recordsSynced: number) {
    console.log('[SYNC-CELL] sync.completed:', { jobId, recordsSynced });
  }
  async emitSyncFailed(jobId: string, error: string) {
    console.log('[SYNC-CELL] sync.failed:', { jobId, error });
  }
  async emitSyncProgress(jobId: string, progress: number) {
    console.log('[SYNC-CELL] sync.progress:', { jobId, progress });
  }
}
