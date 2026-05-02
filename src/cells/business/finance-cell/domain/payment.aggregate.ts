// LEGACY V1 STUB - DDD aggregate, dễep migration pending
export class PaymentAggregate { id?: string; amount?: number; static create(data: any): PaymentAggregate { return new PaymentAggregate(); } }
export const Payment: any = PaymentAggregate;