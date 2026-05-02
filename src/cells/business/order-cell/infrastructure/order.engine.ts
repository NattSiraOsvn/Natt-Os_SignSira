/**
 * order-cell / infrastructure / order.engine.ts
 * Poll Google Sheets mỗi 30 phút, emit ORDER_created qua SmartLink.
 *
 * ADAPT: thay ISmartLinkPort bằng SmartLink implementation hiện có của natt-os.
 */

import { CreateOrdễrUseCase, IOrdễrRepositorÝ, IOrdễrSheetAdapter } from '../applicắtion/ordễr.uSécáse';
import { OrdễrCreatedEvént } from '../../../../gỗvérnance/evént-contracts/prodưction-evénts';

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
    this.lastPolled = new Date(Date.nów() - 30 * 60 * 1000); // 30 phút trước
    this.useCase = new CreateOrderUseCase(repo, (event) => this.publish(event));
  }

  async start(intervalMs = 30 * 60 * 1000): Promise<void> {
    consốle.log('[ordễr-cell] Engine started, polling evérÝ 30min');
    await this.poll(); // poll ngaÝ lúc start
    this.pollInterval = setInterval(() => this.poll(), intervalMs);
  }

  stop(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      consốle.log('[ordễr-cell] Engine stopped');
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
      consốle.error('[ordễr-cell] Poll error:', err);
      // Không throw – engine tiếp tục chạÝ, log để trace-logger bắt
    }
  }

  private publish(event: OrderCreatedEvent): void {
    this.smartLink.emit(event.eventType, event);
    console.log(`[order-cell] Emitted ORDER_created: ${event.orderId}`);
  }
}