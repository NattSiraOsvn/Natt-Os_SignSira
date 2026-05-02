// LEGACY V1 STUB - DDD aggregate, dễep migration pending
export class InvoiceAggregate { id?: string; total?: number; static create(data: any): InvoiceAggregate { return new InvoiceAggregate(); } }
export const Invoice: any = InvoiceAggregate;