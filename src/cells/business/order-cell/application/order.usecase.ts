/**
 * order-cell / application / order.usecase.ts
 * Use cases: poll Google Sheets → parse → emit ORDER_CREATED
 */

import { Order, createOrder } from '../domain/order.entity';
import { OrderCreatedEvent } from '../../../../governance/event-contracts/production-events';

export interface IOrderRepository {
  findAll(): Promise<Order[]>;
  findById(orderId: string): Promise<Order | null>;
  save(order: Order): Promise<void>;
  findByStatus(status: Order['status']): Promise<Order[]>;
}

export interface IOrderSheetAdapter {
  /** Đọc dữ liệu từ Google Sheets – ĐIỀU_PHỐI_NĂM_2, sheet ĐH UYÊN */
  fetchNewOrders(since: Date): Promise<RawOrderRow[]>;
}

export interface RawOrderRow {
  orderId: string;
  orderType: 'KD' | 'CT';
  productCode: string;
  category: string;
  goldPurity: number;
  goldColor: string;
  receiveDate: string;   // raw string từ Sheets
  requiredDate: string;
  saleName: string;
  notes?: string;
}

export class CreateOrderUseCase {
  constructor(
    private readonly repo: IOrderRepository,
    private readonly emit: (event: OrderCreatedEvent) => void,
  ) {}

  async execute(raw: RawOrderRow): Promise<Order> {
    // Idempotent: skip nếu đã tồn tại
    const existing = await this.repo.findById(raw.orderId);
    if (existing) return existing;

    const order = createOrder({
      orderId: raw.orderId,
      orderType: raw.orderType,
      productCode: raw.productCode,
      category: raw.category,
      goldPurity: raw.goldPurity,
      goldColor: raw.goldColor,
      receiveDate: new Date(raw.receiveDate),
      requiredDate: new Date(raw.requiredDate),
      saleName: raw.saleName,
      notes: raw.notes,
    });

    await this.repo.save(order);

    this.emit({
      eventType: 'ORDER_CREATED',
      orderId: order.orderId,
      orderType: order.orderType,
      productCode: order.productCode,
      category: order.category,
      goldPurity: order.goldPurity,
      goldColor: order.goldColor,
      receiveDate: order.receiveDate,
      requiredDate: order.requiredDate,
      saleName: order.saleName,
      notes: order.notes,
    });

    return order;
  }
}
