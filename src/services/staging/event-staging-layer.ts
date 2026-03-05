/**
 * 🛡️ EVENT STAGING LAYER (ESL) - CENTRAL EVENT STORE
 * Source: NATTCELL KERNEL → Rewritten for goldmaster
 * Idempotency Key cấp độ bản ghi (Record Level).
 */
import { ShardingService } from '../blockchainservice';

export interface StagedEvent {
  id: string;
  eventId: string;
  idempotencyKey: string;
  payload: any;
  status: 'STAGED' | 'COMMITTED' | 'FAILED' | 'DUPLICATE_IGNORED';
  timestamp: number;
  metadata?: any;
}

class EventStagingLayerService {
  private static instance: EventStagingLayerService;
  private readonly STORAGE_KEY = 'OMEGA_ESL_LEDGER';
  private processedKeys: Set<string> = new Set();
  private stagingQueue: StagedEvent[] = [];

  private constructor() { this.hydrate(); }

  public static getInstance(): EventStagingLayerService {
    if (!EventStagingLayerService.instance) {
      EventStagingLayerService.instance = new EventStagingLayerService();
    }
    return EventStagingLayerService.instance;
  }

  private hydrate() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (raw) { this.processedKeys = new Set(JSON.parse(raw).keys); }
    } catch (e) { console.warn("[ESL] Failed to hydrate", e); }
  }

  private persist() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
        keys: Array.from(this.processedKeys), timestamp: Date.now()
      }));
    } catch (e) { console.error("[ESL] Persist failed", e); }
  }

  public generateIdempotencyKey(data: any, context: string): string {
    const cleanData = { ...data };
    delete cleanData.timestamp;
    delete cleanData.id;
    const stableString = JSON.stringify(cleanData, Object.keys(cleanData).sort());
    return ShardingService.generateShardHash({ content: stableString, context });
  }

  public isDuplicate(key: string): boolean {
    return this.processedKeys.has(key);
  }

  public stageEvent(payload: any, metadata?: any): StagedEvent {
    const context = metadata?.source || 'UNKNOWN_SOURCE';
    const idempotencyKey = this.generateIdempotencyKey(payload, context);

    if (this.isDuplicate(idempotencyKey)) {
      console.warn(`[ESL] Idempotency Check Failed! Key: ${idempotencyKey}`);
      return {
        id: `EVT-${Date.now()}`,
        eventId: `DUP-${idempotencyKey.substring(0, 8)}`,
        idempotencyKey, payload,
        status: 'DUPLICATE_IGNORED',
        timestamp: Date.now(), metadata
      };
    }

    const event: StagedEvent = {
      id: `EVT-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      eventId: `EID-${Date.now()}`,
      idempotencyKey, payload,
      status: 'STAGED',
      timestamp: Date.now(), metadata
    };
    this.stagingQueue.push(event);
    return event;
  }

  public commitEvent(eventId: string): void {
    const idx = this.stagingQueue.findIndex(e => e.id === eventId);
    if (idx !== -1) {
      const event = this.stagingQueue[idx];
      event.status = 'COMMITTED';
      this.processedKeys.add(event.idempotencyKey);
      this.persist();
      this.stagingQueue.splice(idx, 1);
    }
  }

  public rollbackEvent(eventId: string): void {
    const idx = this.stagingQueue.findIndex(e => e.id === eventId);
    if (idx !== -1) {
      this.stagingQueue[idx].status = 'FAILED';
    }
  }

  public getQueue(): StagedEvent[] { return this.stagingQueue; }
}

export const StagingStore = EventStagingLayerService.getInstance();
