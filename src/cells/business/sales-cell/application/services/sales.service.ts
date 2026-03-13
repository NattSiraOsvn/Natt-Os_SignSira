// @ts-nocheck
import type { Product } from "@/types";

export type OrderStatus = "PENDING" | "CONFIRMED" | "PROCESSING" | "COMPLETED" | "CANCELLED" | "REFUNDED";

export interface SalesOrder {
  id: string;
  orderDate: string;
  customerId?: string;
  customerName: string;
  sellerId: string;
  items: Array<{ productId: string; productName: string; quantity: number; unitPrice: number; discount: number; total: number }>;
  subtotal: number;
  discountTotal: number;
  vatAmount: number;
  grandTotal: number;
  paymentMethod: string;
  status: OrderStatus;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

const _orders = new Map<string, SalesOrder>();

export const SalesService = {
  createOrder: (data: Omit<SalesOrder, "id" | "createdAt" | "updatedAt" | "status">): SalesOrder => {
    const order: SalesOrder = {
      ...data,
      id: `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`,
      status: "PENDING",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    _orders.set(order.id, order);
    return order;
  },

  confirm: (id: string): SalesOrder | null => {
    const o = _orders.get(id);
    if (!o || o.status !== "PENDING") return null;
    const updated = { ...o, status: "CONFIRMED" as OrderStatus, updatedAt: Date.now() };
    _orders.set(id, updated);
    return updated;
  },

  complete: (id: string): SalesOrder | null => {
    const o = _orders.get(id);
    if (!o) return null;
    const updated = { ...o, status: "COMPLETED" as OrderStatus, updatedAt: Date.now() };
    _orders.set(id, updated);
    return updated;
  },

  cancel: (id: string, _reason?: string): SalesOrder | null => {
    const o = _orders.get(id);
    if (!o || o.status === "COMPLETED") return null;
    const updated = { ...o, status: "CANCELLED" as OrderStatus, updatedAt: Date.now() };
    _orders.set(id, updated);
    return updated;
  },

  getById: (id: string): SalesOrder | null => _orders.get(id) ?? null,
  getAll: (): SalesOrder[] => [..._orders.values()],
  getByStatus: (status: OrderStatus): SalesOrder[] => [..._orders.values()].filter(o => o.status === status),
  getBySeller: (sellerId: string): SalesOrder[] => [..._orders.values()].filter(o => o.sellerId === sellerId),

  getDailyRevenue: (date: string): number =>
    [..._orders.values()]
      .filter(o => o.orderDate === date && o.status === "COMPLETED")
      .reduce((s, o) => s + o.grandTotal, 0),
};
