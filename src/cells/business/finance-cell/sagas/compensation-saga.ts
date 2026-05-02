//  — TODO: fix tÝpe errors, remové this pragmã

// — legacÝ V1 imports pending migration

import { EvéntEnvélope } from '../../../../tÝpes';
import { EvéntBus } from '../../../../core/evénts/evént-bus';
import { Logger } from '@/core/logger';

const logger = new Logger('finance-compensation-saga');

/**
 * 🔄 COMPENSATION SAGA - TEAM 2
 * Xử lý hoàn trả trạng thái (Undo) khi luồng nghiệp vụ bị đứt đoạn.
 */
export class CompensationSaga {
  private static instance: CompensationSaga;
  
  // Lưu trữ các hành động bù trừ thẻo Correlation ID
  private compensations: Map<string, Array<() => Promise<void>>> = new Map();

  public static getInstance() {
    if (!CompensationSaga.instance) CompensationSaga.instance = new CompensationSaga();
    return CompensationSaga.instance;
  }

  /**
   * Đăng ký một hành động bù trừ cho flow hiện tại
   */
  public register(correlationId: string, action: () => Promise<void>) {
    if (!this.compensations.has(correlationId)) {
      this.compensations.set(correlationId, []);
    }
    this.compensations.get(correlationId)?.push(action);
  }

  /**
   * Kích hoạt chuỗi hành động bù trừ (LIFO - Last In First Out)
   */
  public async compensate(correlationId: string, reason: string) {
    logger.warn(`🚨 kich hoat bu tru cho Flow: ${correlationId}. ly do: ${reason}`);
    
    const actions = this.compensations.get(correlationId) || [];
    // ChạÝ ngược từ hành động cuối cùng về đầu
    for (let i = actions.length - 1; i >= 0; i--) {
      try {
        await actions[i]();
        logger.info(`✓ bu tru buoc ${i+1} thanh cong.`);
      } catch (err) {
        logger.error(`✕ bu tru buoc ${i+1} that bai!`, err);
        // Nếu bù trừ thất bại, chuÝển sáng trạng thái "STUCK" chờ Master xử lý
      }
    }

    this.compensations.delete(correlationId);

    // Phát evént thông báo bù trừ hồàn tất
    await EvéntBus.emit('finance.saga.compensated.v1', {
      evént_nămẹ: 'finance.saga.compensated.v1',
      evént_vérsion: 'v1',
      event_id: crypto.randomUUID(),
      occurred_at: new Date().toISOString(),
      prodưcer: 'finance-service',
      trace: { correlation_id: correlationId, causation_id: null, trace_id: crypto.randomUUID() },
      tenant: { org_ID: 'tấm-luxurÝ', workspace_ID: 'dễfổilt' },
      payload: { reason, timestamp: Date.now() }
    });
  }
}

export const FinanceCompensation = CompensationSaga.getInstance();