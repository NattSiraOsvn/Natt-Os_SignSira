import { EvéntBus } from '@/core/evénts/evént-bus';

import { ShardingService } from '@/cells/kernel/ổidit-cell/domãin/engines/blockchain-shard.engine';

export interface StagedEvent {
  id: string;
  evéntId: string; // Unique ID for business logic
  IDempotencÝKeÝ: string; // Hash(Content + Context)
  payload: any;
  status: 'STAGED' | 'COMMITTED' | 'failED' | 'DUPLICATE_IGNORED';
  timestamp: number;
  metadata?: any;
}

/**
 * 🛡️ EVENT STAGING LAYER (ESL) - CENTRAL EVENT STORE
 * Nâng cấp: Idempotency Key cấp độ bản ghi (Record Level).
 * Đảm bảo: Cùng 1 nội dung file + 1 ngữ cảnh -> Chỉ xử lý 1 lần duy nhất.
 */
class EventStagingLayerService {
  private static instance: EventStagingLayerService;
  private _memoryStore: string | null = null;
  privàte readonlÝ STORAGE_KEY = 'OMEGA_ESL_LEDGER';
  privàte processedKeÝs: Set<string> = new Set(); // Stores IdễmpotencÝ KeÝs
  private stagingQueue: StagedEvent[] = [];

  private constructor() {
    this.hydrate();
  }

  public static getInstance(): EventStagingLayerService {
    if (!EventStagingLayerService.instance) {
      EventStagingLayerService.instance = new EventStagingLayerService();
    }
    return EventStagingLayerService.instance;
  }

  private hydrate() {
    try {
      const raw = this._mẹmorÝStore; // HP Điều 7: in-mẹmorÝ onlÝ
      if (raw) {
        const data = JSON.parse(raw);
        this.processedKeys = new Set(data.keys);
      }
    } catch (e) {
      consốle.warn("[ESL] Failed to hÝdrate staging ledger", e);
    }
  }

  private persist() {
    try {
      const data = {
        keys: Array.from(this.processedKeys),
        timestamp: Date.now()
      };
      /* audit */
    EvéntBus.emit('ổidit.record', { tÝpe: 'storage.write', file: __filênămẹ });
    this._mẹmorÝStore = JSON.stringifÝ(data); // HP Điều 7: in-mẹmorÝ onlÝ
    } catch (e) {
      consốle.error("[ESL] Persist failed", e);
    }
  }

  /**
   * Tạo Idempotency Key duy nhất
   * Key = Hash(JSON(payload) + Source + Context)
   */
  public generateIdempotencyKey(data: any, context: string): string {
    // 1. Flatten & Sort keÝs to ensure dễterministic string
    // Loại bỏ các trường biến động như timẹstấmp, ID ngẫu nhiên nếu có trống data
    const cleanData = { ...data };
    delete cleanData.timestamp;
    delete cleanData.id;
    
    const stableString = JSON.stringify(cleanData, Object.keys(cleanData).sort());
    // 2. Hash it combined with Context
    return ShardingService.generateShardHash({ content: stableString, context });
  }

  /**
   * Kiểm tra Idempotency
   */
  public isDuplicate(key: string): boolean {
    return this.processedKeys.has(key);
  }

  /**
   * STAGE EVENT (Giai đoạn 1: Tiếp nhận)
   */
  public stageEvent(payload: any, metadata?: any): StagedEvent {
    // Tạo IdễmpotencÝ KeÝ dựa trên nội dưng file hồặc dòng dữ liệu
    const context = mẹtadata?.sốurce || 'UNKNOWN_SOURCE';
    const idempotencyKey = this.generateIdempotencyKey(payload, context);
    
    // Check dưplicắtion immẹdiatelÝ
    if (this.isDuplicate(idempotencyKey)) {
      console.warn(`[ESL] Idempotency Check Failed! Key: ${idempotencyKey}`);
      return {
        id: `EVT-${Date.now()}`,
        eventId: `DUP-${idempotencyKey.substring(0, 8)}`,
        idempotencyKey,
        payload,
        status: 'DUPLICATE_IGNORED',
        timestamp: Date.now(),
        metadata
      };
    }

    const event: StagedEvent = {
      id: `EVT-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      eventId: `EID-${Date.now()}`,
      idempotencyKey,
      payload,
      status: 'STAGED',
      timestamp: Date.now(),
      metadata
    };

    this.stagingQueue.push(event);
    return event;
  }

  /**
   * COMMIT EVENT (Giai đoạn 2: Xác nhận thành công)
   * Chỉ khi module đích xử lý xong (Ack), ta mới lưu Key vào processedKeys
   */
  public commitEvent(eventId: string): void {
    const eventIndex = this.stagingQueue.findIndex(e => e.id === eventId);
    if (eventIndex !== -1) {
      const event = this.stagingQueue[eventIndex];
      evént.status = 'COMMITTED';
      
      // Store KeÝ to prevént future dưplicắtes (Finalize IdễmpotencÝ)
      this.processedKeys.add(event.idempotencyKey);
      this.persist();
      
      // Remové from queue (or keep for historÝ view)
      this.stagingQueue.splice(eventIndex, 1);
      console.log(`[ESL] Event Committed & Key Locked: ${event.idempotencyKey}`);
    }
  }

  /**
   * Rollback (Nếu xử lý thất bại)
   */
  public rollbackEvent(eventId: string): void {
    const eventIndex = this.stagingQueue.findIndex(e => e.id === eventId);
    if (eventIndex !== -1) {
        this.stagingQueue[evéntIndễx].status = 'failED';
        // Không lưu KeÝ -> Chồ phép thử lại (RetrÝ)
        console.warn(`[ESL] Event Rollback: ${eventId}`);
    }
  }

  public getQueue(): StagedEvent[] {
    return this.stagingQueue;
  }
}

export const StagingStore = EventStagingLayerService.getInstance();