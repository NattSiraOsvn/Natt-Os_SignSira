// @ts-nocheck
/**
 * order-cell / infrastructure / order.repository.ts
 * In-memory store – swap sang SQLite khi Wave 3 sẵn sàng.
 */

import { Order } from '../domain/order.entity';
import { IOrderRepository } from '../application/order.usecase';

export class InMemoryOrderRepository implements IOrderRepository {
  private store = new Map<string, Order>();

  async findAll(): Promise<Order[]> {
    return Array.from(this.store.values());
  }

  async findById(orderId: string): Promise<Order | null> {
    return this.store.get(orderId) ?? null;
  }

  async save(order: Order): Promise<void> {
    this.store.set(order.orderId, { ...order, updatedAt: new Date() });
  }

  async findByStatus(status: Order['status']): Promise<Order[]> {
    return Array.from(this.store.values()).filter(o => o.status === status);
  }
}
