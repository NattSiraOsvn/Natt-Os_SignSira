import { EventBus } from '@/core/events/event-bus';

// src/services/ingestion/IdempotencyManager.ts
import { contentHash } from './utils';

interface EventLog {
  idempotencyKey: string;
  status: string;
  timestamp: number;
}

export class IdempotencyManager {
  private processedHashes: Set<string> = new Set();
  private eventStore: EventLog[] = [];
  // HP Điều 7: no localStorage — in-memory only (2026-04-17)

  constructor() {
    // State lives in-memory — no localStorage (HP Điều 7)
  }

  private persistViaEvent() {
    // Emit audit trail instead of localStorage write
    EventBus.emit('audit.record', {
      type: 'idempotency.snapshot',
      hashCount: this.processedHashes.size,
      eventCount: this.eventStore.length,
      timestamp: Date.now(),
    });
  }

  async generateHash(file: File): Promise<string> {
    const signature = `${file.name}-${file.size}-${file.type}-${file.lastModified}`;
    return await contentHash(signature);
  }

  async isDuplicate(file: File): Promise<boolean> {
    const hash = await this.generateHash(file);
    return this.processedHashes.has(hash);
  }

  /**
   * 🛡️ RECORD EVENT LEDGER
   * Hỗ trợ trạng thái PENDING_STAGED cho Silent Audit.
   */
  async recordEvent(file: File, status: 'processing_started' | 'processing_failed' | 'processing_completed' | 'awaiting_approval' | 'PENDING_STAGED') {
    const hash = await this.generateHash(file);
    
    // Nếu là bắt đầu hoặc đưa vào staging, ta vẫn khóa Hash để tránh race-condition
    if (status === 'processing_started' || status === 'PENDING_STAGED') {
      this.processedHashes.add(hash);
    }
    
    this.eventStore.push({ 
      idempotencyKey: hash, 
      status, 
      timestamp: Date.now() 
    });
    
    this.persistViaEvent();
    console.log(`[Idempotency] Ledger Commit: ${status} for ${hash.substring(0, 8)}`);
  }
}
