import { EventEnvelope } from '../../../types';
/** 👤 CustomerCreated.v1 */
export interface CustomerCreatedPayload {
  customer_id: string; type: 'INDIVIDUAL' | 'CORPORATE'; name: string;
  phone?: string; email?: string; tax_id?: string;
  tier: 'STANDARD' | 'VIP' | 'DIAMOND'; created_at: string;
}
export type CustomerCreatedEvent = EventEnvelope<CustomerCreatedPayload>;
export const CustomerCreatedSchema = { event_name: 'customer.created.v1', producer: 'customer-cell', version: 'v1' };
