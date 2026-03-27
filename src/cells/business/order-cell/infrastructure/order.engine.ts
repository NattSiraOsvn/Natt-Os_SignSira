/**
 * order-cell / infrastructure / order.engine.ts
 * Poll Google Sheets mỗi 30 phút, emit ORDER_CREATED qua SmartLink.
 *
 * ADAPT: thay ISmartLinkPort bằng SmartLink implementation hiện có của NATT-OS.
 */

import { CreateOrderUseCase, IOrderRepository, IOrderSheetAdapter } from '../application/order.usecase';
import { OrderCreatedEvent } from '../../../../governance/event-contracts/production-events';

export interface ISmartLinkPort {
  emit(eventType: string, payload: unknown): void;
}

export class OrderEngine {
  private lastPolled: Date;
  private readonly useCase: CreateOrderUseCase;
  private pollInterval?: ReturnType<typeof setInterval>;

  constructor(
    private readonly repo: IOrderRepository,
    private readonly adapter: IOrderSheetAdapter,
    private readonly smartLink: ISmartLinkPort,
  ) {
    this.lastPolled = new Date(Date.now() - 30 * 60 * 1000); // 30 phút trước
    this.useCase = new CreateOrderUseCase(repo, (event) => this.publish(event));
  }

  async start(intervalMs = 30 * 60 * 1000): Promise<void> {
    console.log('[order-cell] Engine started, polling every 30min');
    await this.poll(); // poll ngay lúc start
    this.pollInterval = setInterval(() => this.poll(), intervalMs);
  }

  stop(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      console.log('[order-cell] Engine stopped');
    }
  }

  async poll(): Promise<void> {
    try {
      const rows = await this.adapter.fetchNewOrders(this.lastPolled);
      console.log(`[order-cell] Fetched ${rows.length} new rows since ${this.lastPolled.toISOString()}`);

      for (const row of rows) {
        await this.useCase.execute(row);
      }

      this.lastPolled = new Date();
    } catch (err) {
      console.error('[order-cell] Poll error:', err);
      // Không throw – engine tiếp tục chạy, log để trace-logger bắt
    }
  }

  private publish(event: OrderCreatedEvent): void {
    this.smartLink.emit(event.eventType, event);
    console.log(`[order-cell] Emitted ORDER_CREATED: ${event.orderId}`);
  }
}
