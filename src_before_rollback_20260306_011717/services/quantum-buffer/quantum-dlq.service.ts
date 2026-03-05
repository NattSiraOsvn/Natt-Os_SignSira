import { QuantumBufferService, getQuantumBuffer } from './quantum-buffer.service';
import { DLQEntry } from './quantum-types';

export class QuantumDLQService {
  private buffer: QuantumBufferService;
  constructor(buffer?: QuantumBufferService) { this.buffer = buffer || getQuantumBuffer(); }

  list(type?: string, limit: number = 50): DLQEntry[] { return this.buffer.getDLQ(type, limit); }
  retry(dlqId: string): string | null { return this.buffer.retryFromDLQ(dlqId); }
  retryAll(type?: string): { retried: number } { return { retried: this.buffer.retryAllDLQ(type) }; }
  purge(type?: string): { purged: number } { return { purged: this.buffer.purgeDLQ(type) }; }

  healthCheck(alertThreshold: number = 10) {
    const entries = this.list(undefined, 1000);
    const byType: Record<string, number> = {};
    const alerts: string[] = [];
    for (const e of entries) byType[e.type] = (byType[e.type] || 0) + 1;
    for (const [type, count] of Object.entries(byType)) {
      if (count >= alertThreshold) alerts.push(`[ALERT] ${type}: ${count} in DLQ`);
    }
    return { healthy: entries.length < alertThreshold, dlq_count: entries.length, by_type: byType, alerts };
  }
}