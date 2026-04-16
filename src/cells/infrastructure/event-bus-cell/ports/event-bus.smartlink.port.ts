// ═══════════════════════════════════════════════════════════════
// EVENT-BUS-CELL — SmartLink Port
// Điều 4: no direct cell-to-cell calls, all through EventBus
// ═══════════════════════════════════════════════════════════════

export interface EventBusSmartLinkPort {
  /** Route event to all subscribers */
  route(event: string, payload: unknown): void;

  /** Register subscriber for event pattern */
  subscribe(pattern: string, handler: (payload: unknown) => void): () => void;

  /** Get dead letter queue entries */
  getDeadLetters(): Array<{ event: string; payload: unknown; reason: string; timestamp: number }>;

  /** Get routing metrics */
  getMetrics(): {
    totalRouted: number;
    totalDeadLetters: number;
    totalRetries: number;
    activeSubscribers: number;
  };
}
