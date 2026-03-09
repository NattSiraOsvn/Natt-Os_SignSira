export class ThreatDetectionService {
  private lockdownActive = false;

  analyzeThreat(type: string, source: string): { shouldAlert: boolean; shouldLockdown: boolean } {
    const criticalTypes = ['INJECTION', 'PRIVILEGE_ESCALATION', 'DATA_EXFILTRATION'];
    return {
      shouldAlert: true,
      shouldLockdown: criticalTypes.includes(type),
    };
  }

  isLockdownActive(): boolean { return this.lockdownActive; }
  activateLockdown() { this.lockdownActive = true; }
  deactivateLockdown() { this.lockdownActive = false; }
}

export interface SecurityThreat { id:string; type:string; severity:"LOW"|"MEDIUM"|"HIGH"|"CRITICAL"; source:string; detected:number; resolved:boolean; description:string; details?:string; }
export interface SecurityTHReat extends SecurityThreat {}
export interface SystemHealth { score:number; status:"HEALTHY"|"DEGRADED"|"CRITICAL"; threats:number; lastScan:number; uptime:number; }
export { ThreatDetectionService as default };
