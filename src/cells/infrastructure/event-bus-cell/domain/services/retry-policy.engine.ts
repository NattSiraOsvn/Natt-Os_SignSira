/**
 * retry-policy.engine.ts
 * ──────────────────────
 * Exponential backoff retry cho transient failures.
 * Thất bại hết → delegate cho DeadLetterHandler.
 *
 * Source: masterv1 RetryPolicy, adapted for NattOS EventBus
 */

export interface RetryConfig {
  maxAttempts:  number;
  baseDelayMs:  number;
  maxDelayMs:   number;
}

const DEFAULT_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelayMs: 1000,
  maxDelayMs:  8000,
};

export class RetryPolicyEngine {
  private config: RetryConfig;

  constructor(config?: Partial<RetryConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Execute action with retry. On final failure, call onExhausted.
   */
  async execute<T>(
    action: () => Promise<T>,
    context: string,
    onExhausted: (error: unknown) => Promise<void>
  ): Promise<T | null> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= this.config.maxAttempts; attempt++) {
      try {
        return await action();
      } catch (error) {
        lastError = error;
        const delay = Math.min(
          this.config.baseDelayMs * Math.pow(2, attempt - 1),
          this.config.maxDelayMs
        );

        if (attempt < this.config.maxAttempts) {
          await this.sleep(delay);
        }
      }
    }

    await onExhausted(lastError);
    return null;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
