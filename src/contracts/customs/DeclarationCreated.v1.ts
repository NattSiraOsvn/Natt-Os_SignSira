import { EventEnvelope } from '@/core/events/event-envelope';
/** 📋 DeclarationCreated.v1 — TK 3333 + TK 33312 */
export interface DeclarationCreatedPayload {
  [key: string]: unknown;
  declaration_id: string; supplier_order_id: string; declaration_number?: string;
  import_duty_vnd: number; vat_import_vnd: number; total_tax_vnd: number;
  hs_codes: string[]; created_at: string;
}
export type DeclarationCreatedEvent = EventEnvelope<DeclarationCreatedPayload>;
export const DeclarationCreatedSchema = { event_name: 'customs.declaration.created.v1', producer: 'customs-cell', version: 'v1' };
