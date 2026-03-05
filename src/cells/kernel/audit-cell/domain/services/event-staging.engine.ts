// ============================================================================
// src/cells/kernel/audit-cell/domain/services/event-staging.engine.ts
// Migrated from: services/staging/event-staging-layer.ts
// Fixed: ghost import blockchainservice → sharding-service
//        localStorage dùng graceful fallback
// Migrated by Băng — 2026-03-06
// ============================================================================

import { ShardingService } from '@/services/sharding-service';

export interface StagedEvent {
  id: string;
  payload: unknown;
  metadata?: Record<string, unknown>;
  idempotencyKey: string;
  stagedAt: number;
  status: 'STAGED' | 'COMMITTED' | 'ROLLED_BACK';
}

class EventStagingEngine {
  private static instance: EventStagingEngine;
  private readonly STORAGE_KEY = 'OMEGA_ESL_LEDGER';
  private processedKeys: Set<string> = new Set();
  private stagingQueue: StagedEvent[] = [];

  private constructor() { this.hydrate(); }

  public static getInstance(): EventStagingEngine {
    if (!EventStagingEngine.instance) EventStagingEngine.instance = new EventStagingEngine();
    return EventStagingEngine.instance;
  }

  private hydrate(): void {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        this.processedKeys = new Set(data.processedKeys || []);
        this.stagingQueue = (data.queue || []).filter(
          (e: StagedEvent) => e.status === 'STAGED'
        );
      }
    } catch { /* graceful */ }
  }

  private persist(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
        processedKeys: Array.from(this.processedKeys),
        queue: this.stagingQueue
      }));
    } catch { /* storage full — memory only */ }
  }

  public generateIdempotencyKey(data: unknown, context: string): string {
    return ShardingService.generateShardHash({ data: JSON.stringify(data), context });
  }

  public isDuplicate(key: string): boolean {
    return this.processedKeys.has(key);
  }

  public stageEvent(payload: unknown, metadata?: Record<string, unknown>): StagedEvent {
    const idempotencyKey = metadata?.idempotencyKey as string ||
      this.generateIdempotencyKey(payload, String(Date.now()));

    const event: StagedEvent = {
      id: `ESL-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      payload,
      metadata,
      idempotencyKey,
      stagedAt: Date.now(),
      status: 'STAGED'
    };

    this.stagingQueue.push(event);
    this.persist();
    return event;
  }

  public commitEvent(eventId: string): void {
    const event = this.stagingQueue.find(e => e.id === eventId);
    if (!event) return;
    event.status = 'COMMITTED';
    this.processedKeys.add(event.idempotencyKey);
    this.stagingQueue = this.stagingQueue.filter(e => e.id !== eventId);
    this.persist();
  }

  public rollbackEvent(eventId: string): void {
    const event = this.stagingQueue.find(e => e.id === eventId);
    if (event) event.status = 'ROLLED_BACK';
    this.stagingQueue = this.stagingQueue.filter(e => e.id !== eventId);
    this.persist();
  }

  public getQueue(): StagedEvent[] { return this.stagingQueue; }
}

export const StagingStore = EventStagingEngine.getInstance();
