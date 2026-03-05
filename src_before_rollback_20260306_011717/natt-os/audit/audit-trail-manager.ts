/** NATT-OS Audit Trail Manager */
export interface AuditEntry { action: string; timestamp: number; details: unknown; }

export class AuditTrailManager {
  private static entries: AuditEntry[] = [];

  static async record(action: string, details: unknown): Promise<void> {
    AuditTrailManager.entries.push({ action, timestamp: Date.now(), details });
  }

  static async getTrail(limit = 100): Promise<AuditEntry[]> {
    return AuditTrailManager.entries.slice(-limit);
  }

  static async flush(): Promise<number> {
    const count = AuditTrailManager.entries.length;
    AuditTrailManager.entries = [];
    return count;
  }

  static async saveMemoryDump(aiId: string, dump: unknown): Promise<void> {
    await AuditTrailManager.record('MEMORY_DUMP', { aiId, dump });
  }
}
