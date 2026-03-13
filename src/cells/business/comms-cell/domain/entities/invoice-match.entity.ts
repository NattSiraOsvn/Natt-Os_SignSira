// @ts-nocheck
export type MatchStatus = 'MATCHED' | 'PARTIAL' | 'MISMATCH' | 'UNRECOGNIZED' | 'PENDING';

export interface InvoiceMatchResult {
  matchId: string;
  messageId: string;        // message chứa file HĐ
  roomId: string;
  partnerId: string;

  // OCR extracted
  extractedInvoiceNo: string;
  extractedDate: Date;
  extractedTotal: number;
  extractedTaxCode: string;

  // Match target
  poId?: string;
  poTotal?: number;
  poTaxCode?: string;

  // Match theo 2 tiêu chí
  matchByPO: boolean;       // khớp số PO
  matchByAmount: boolean;   // khớp tổng tiền + MST + kỳ
  status: MatchStatus;

  // Action
  triggersPayment: boolean; // MATCHED → true
  alertSent: boolean;
  createdAt: Date;
}