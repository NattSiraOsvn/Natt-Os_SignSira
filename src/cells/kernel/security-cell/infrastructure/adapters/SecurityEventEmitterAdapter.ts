// @nauion-native v1 (Wave 1 ss20260427 — đổi syntax annotation, giữ .ts per R09)
// @migrated-from SecurityEventEmitterAdapter.ts (commit bf26b24)
// @kind adapter-event-emitter
// @authority Anh Natt + Băng (per AUTHORITY_OVERRIDE_MIGRATION_TS_NAUION_SS20260427)
// @logic-preserved runtime đã proven (chat 81f0e72d 07/04/26)

import { SecurityEventEmitter } from '../../ports/SecurityEventEmitter';

// sira_TYPE_CLASS
export class SecurityEventEmitterAdapter implements SecurityEventEmitter {
  async emitThreatDetected(threatId: string, severity: string, type: string) {
    console.log('[SECURITY-CELL] security.threat.detected:', { threatId, severity, type });
  }
  async emitLockdownInitiated(reason: string) {
    console.log('[SECURITY-CELL] security.lockdown.initiated:', { reason });
  }
  async emitLockdownLifted() {
    console.log('[SECURITY-CELL] security.lockdown.lifted');
  }
  async emitAccessDenied(userId: string, reason: string) {
    console.log('[SECURITY-CELL] security.access.denied:', { userId, reason });
  }
}
