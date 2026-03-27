export interface PaymentCellContract {
  'payment.intent.created': { intentId: string; orderRef: string; amount: number; provider: string };
  'payment.captured': { intentId: string; transactionId: string; amount: number };
  'payment.failed': { intentId: string; reason: string };
  'payment.refunded': { intentId: string; refundAmount: number };
  'payment.bank.classified': { transactionId: string; category: string; amount: number };
  'payment.reconciled': { batchId: string; matchedCount: number; unmatchedCount: number };
}
