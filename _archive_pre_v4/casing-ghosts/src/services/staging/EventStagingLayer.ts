// EventStagingLayer — staging store with idempotency
export class StagingStore {
  private static buffer: Map<string, any[]> = new Map();
  private static committed: Set<string> = new Set();
  private static idempotencyKeys: Set<string> = new Set();

  static stage(category: string, event: any): void {
    if (!this.buffer.has(category)) this.buffer.set(category, []);
    this.buffer.get(category)!.push({ ...event, stagedAt: Date.now() });
  }

  static flush(category: string): any[] {
    const items = this.buffer.get(category) || [];
    this.buffer.delete(category);
    return items;
  }

  static peek(category: string): any[] {
    return this.buffer.get(category) || [];
  }

  static generateIdempotencyKey(data: any, prefix: string): string {
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash = hash & hash;
    }
    return `${prefix}_${Math.abs(hash).toString(36)}`;
  }

  static isDuplicate(key: string): boolean {
    return this.idempotencyKeys.has(key);
  }

  static stageEvent(data: any, metadata: any): { id: string; data: any; metadata: any } {
    const id = `EVT-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    this.idempotencyKeys.add(metadata?.idempotencyKey || id);
    const event = { id, data, metadata, stagedAt: Date.now() };
    this.stage('EVENTS', event);
    return event;
  }

  static commitEvent(eventId: string): void {
    this.committed.add(eventId);
  }
}
