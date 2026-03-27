import { EventEnvelope } from '@/core/events/event-envelope';
/** 🏭 SupplierOrderCreated.v1 */
export interface SupplierOrderCreatedPayload {
  [key: string]: unknown;
  supplier_order_id: string; supplier_id: string; supplier_type: 'SERVICE' | 'B2B_MATERIAL';
  items: Array<{ description: string; quantity: number; unit_price_vnd: number }>;
  total_amount_vnd: number; requires_customs: boolean;
  requires_logistics: boolean; requires_legal_review: boolean;
  created_at: string;
}
export type SupplierOrderCreatedEvent = EventEnvelope<SupplierOrderCreatedPayload>;
export const SupplierOrderCreatedSchema = { event_name: 'supplier.order.created.v1', producer: 'supplier-cell', version: 'v1' };
