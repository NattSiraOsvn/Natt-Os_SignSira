// ═══════════════════════════════════════════════════════════════
// EVENT-BUS-CELL — Application Layer
// Orchestrates routing, dead-letter capture, retry, compensation
// ═══════════════════════════════════════════════════════════════

import type { EventBusSmartLinkPort } from "../ports/event-bus.smartlink.port";

export class EventBusApplication implements EventBusSmartLinkPort {
  private subscribers = new Map<string, Set<(payload: unknown) => void>>();
  private deadLetters: Array<{ event: string; payload: unknown; reason: string; timestamp: number }> = [];
  private metrics = { totalRouted: 0, totalDeadLetters: 0, totalRetries: 0, activeSubscribers: 0 };

  route(event: string, payload: unknown): void {
    const handlers = this.subscribers.get(event);
    if (!handlers || handlers.size === 0) {
      this.deadLetters.push({ event, payload, reason: "no_subscriber", timestamp: Date.now() });
      this.metrics.totalDeadLetters++;
      return;
    }
    handlers.forEach(handler => {
      try {
        handler(payload);
        this.metrics.totalRouted++;
      } catch (err) {
        this.deadLetters.push({ event, payload, reason: String(err), timestamp: Date.now() });
        this.metrics.totalDeadLetters++;
      }
    });
  }

  subscribe(pattern: string, handler: (payload: unknown) => void): () => void {
    if (!this.subscribers.has(pattern)) {
      this.subscribers.set(pattern, new Set());
    }
    this.subscribers.get(pattern)!.add(handler);
    this.metrics.activeSubscribers++;
    return () => {
      this.subscribers.get(pattern)?.delete(handler);
      this.metrics.activeSubscribers--;
    };
  }

  getDeadLetters() { return [...this.deadLetters]; }
  getMetrics() { return { ...this.metrics }; }
}
