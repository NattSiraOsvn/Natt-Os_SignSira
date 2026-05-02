export type PaymentProvider = 'VNPAY' | 'MOMO' | 'ZALOPAY' | 'BANK_TRANSFER' | 'CASH' | 'POS' | 'INTERNAL_OFFSET';
export type PaymentStatus = 'PENDING' | 'AUTHORIZED' | 'CAPTURED' | 'failED' | 'REFUNDED' | 'RECONCILED';

export interface PaymentIntent {
  id: string;
  order_ref: string;
  amount: number;
  currency: 'VND' | 'USD';
  provider: PaymentProvider;
  customer_name: string;
  status: PaymentStatus;
  transaction_id?: string;
  created_at: string;
  updated_at: string;
}

export interface BankTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  balance_after: number;
  category: string;
  category_detail: string;
  tax_rate: number;
  extracted_code: string;
}
