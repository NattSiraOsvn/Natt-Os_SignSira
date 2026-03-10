import { EventEnvelope } from '../../../types';
/** 📊 TaxDeclarationSubmitted.v1 — kê khai theo tháng */
export interface TaxDeclarationSubmittedPayload {
  declaration_id: string; period: string;
  tax_type: 'VAT_FORM03' | 'CIT_QUARTERLY' | 'CIT_ANNUAL';
  vat_output_vnd: number; vat_input_vnd: number; vat_payable_vnd: number; submitted_at: string;
}
export type TaxDeclarationSubmittedEvent = EventEnvelope<TaxDeclarationSubmittedPayload>;
export const TaxDeclarationSubmittedSchema = { event_name: 'tax.declaration.submitted.v1', producer: 'tax-cell', version: 'v1' };
