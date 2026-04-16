/**
 * compensation.engine.ts
 * ──────────────────────
 * LIFO undo chain — khi business flow bị đứt đoạn,
 * chạy compensating actions ngược từ cuối về đầu.
 *
 * Compliance: SPEC-Finance-Flow §11 Rule #1
 *   "No event update after commit" → tạo event bù trừ ngược, không sửa event cũ.
 *
 * Source: masterv1 CompensationSaga, adapted for EventBus (Điều 3)
 */

import { EventEnvelope, createEnvelope } from '../types/event-envelope.types';

export type CompensateAction = () => Promise<void>;

export interface CompensationResult {
  correlationId:   string;
  reason:          string;
  totalSteps:      number;
  succeeded:       number;
  failed:          number;
  stuckAtStep:     number | null;
}

type EventEmitter = (event: string, payload: unknown) => void;

export class CompensationEngine {
  private chains: Map<string, CompensateAction[]> = new Map();
  private emit: EventEmitter;

  constructor(emitter: EventEmitter) {
    this.emit = emitter;
  }

  /**
   * Đăng ký 1 undo action cho flow hiện tại.
   * Gọi mỗi khi 1 step thành công — đăng ký cách hoàn trả step đó.
   */
  register(correlationId: string, action: CompensateAction): void {
    if (!this.chains.has(correlationId)) {
      this.chains.set(correlationId, []);
    }
    this.chains.get(correlationId)!.push(action);
  }

  /**
   * Kích hoạt chuỗi bù trừ — LIFO (Last In First Out).
   * Bước nào đăng ký sau sẽ hoàn trả trước.
   */
  async compensate(correlationId: string, reason: string): Promise<CompensationResult> {
    const actions = this.chains.get(correlationId) || [];
    const result: CompensationResult = {
      correlationId,
      reason,
      totalSteps: actions.length,
      succeeded: 0,
      failed: 0,
      stuckAtStep: null,
    };

    // Chạy ngược từ action cuối cùng về đầu
    for (let i = actions.length - 1; i >= 0; i--) {
      try {
        await actions[i]();
        result.succeeded++;
      } catch (err) {
        result.failed++;
        result.stuckAtStep = i;
        // Nếu bù trừ thất bại → STUCK, cần Master xử lý
        this.emit('GOVERNANCE.COMPENSATION_STUCK', {
          correlationId,
          stuckAtStep: i,
          reason,
          error: String(err),
        });
      }
    }

    // Cleanup
    this.chains.delete(correlationId);

    // Emit completion event
    this.emit('SAGA.COMPENSATED', {
      correlationId,
      reason,
      result,
      timestamp: Date.now(),
    });

    return result;
  }

  /**
   * Check if a flow has registered compensations.
   */
  hasCompensations(correlationId: string): boolean {
    return (this.chains.get(correlationId)?.length ?? 0) > 0;
  }

  /**
   * Get count of registered undo steps for a flow.
   */
  getStepCount(correlationId: string): number {
    return this.chains.get(correlationId)?.length ?? 0;
  }
}
