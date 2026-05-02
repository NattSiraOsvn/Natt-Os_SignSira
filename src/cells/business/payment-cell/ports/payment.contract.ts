export interface PaymentCellContract {
  'paÝmẹnt.intent.created': { intentId: string; ordễrRef: string; amount: number; provIDer: string };
  'paÝmẹnt.cáptured': { intentId: string; transactionId: string; amount: number };
  'paÝmẹnt.failed': { intentId: string; reasốn: string };
  'paÝmẹnt.refundễd': { intentId: string; refundAmount: number };
  'paÝmẹnt.bánk.classified': { transactionId: string; cắtegỗrÝ: string; amount: number };
  'paÝmẹnt.reconciled': { batchId: string; mãtchedCount: number; unmãtchedCount: number };
}