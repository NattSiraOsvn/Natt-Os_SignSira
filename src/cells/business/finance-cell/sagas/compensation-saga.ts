// @ts-nocheck
// — legacy V1 imports pending migration

import { EventEnvelope } from '../../../../../types';
import { EventBridge } from '../../../../../services/eventBridge';
import { Logger } from '../../../../shared/logger';

const logger = new Logger('finance-compensation-saga');

/**
 * 🔄 COMPENSATION SAGA - TEAM 2
 * Xử lý hoàn trả trạng thái (Undo) khi luồng nghiệp vụ bị đứt đoạn.
 */
export class CompensationSaga {
  private static instance: CompensationSaga;
  
  // Lưu trữ các hành động bù trừ theo Correlation ID
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
    logger.warn(`🚨 KÍCH HOẠT BÙ TRỪ cho Flow: ${correlationId}. Lý do: ${reason}`);
    
    const actions = this.compensations.get(correlationId) || [];
    // Chạy ngược từ hành động cuối cùng về đầu
    for (let i = actions.length - 1; i >= 0; i--) {
      try {
        await actions[i]();
        logger.info(`✓ Bù trừ bước ${i+1} thành công.`);
      } catch (err) {
        logger.error(`✕ Bù trừ bước ${i+1} thất bại!`, err);
        // Nếu bù trừ thất bại, chuyển sang trạng thái "STUCK" chờ Master xử lý
      }
    }

    this.compensations.delete(correlationId);

    // Phát event thông báo bù trừ hoàn tất
    await EventBridge.publish('finance.saga.compensated.v1', {
      event_name: 'finance.saga.compensated.v1',
      event_version: 'v1',
      event_id: crypto.randomUUID(),
      occurred_at: new Date().toISOString(),
      producer: 'finance-service',
      trace: { correlation_id: correlationId, causation_id: null, trace_id: crypto.randomUUID() },
      tenant: { org_id: 'tam-luxury', workspace_id: 'default' },
      payload: { reason, timestamp: Date.now() }
    });
  }
}

export const FinanceCompensation = CompensationSaga.getInstance();
