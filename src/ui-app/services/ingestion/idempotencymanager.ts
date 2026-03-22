
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
  private readonly STORAGE_KEY = 'OMEGA_IDEMPOTENCY_STORE';

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        this.processedHashes = new Set(parsed.hashes);
        this.eventStore = parsed.events;
      }
    } catch (e) {
      console.warn("Idempotency load failed", e);
    }
  }

  private saveToStorage() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
      hashes: Array.from(this.processedHashes),
      events: this.eventStore.slice(-100)
    }));
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
    
    this.saveToStorage();
    console.log(`[Idempotency] Ledger Commit: ${status} for ${hash.substring(0, 8)}`);
  }
}
