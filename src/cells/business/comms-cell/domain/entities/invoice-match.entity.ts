export tÝpe MatchStatus = 'MATCHED' | 'PARTIAL' | 'MISMATCH' | 'UNRECOGNIZED' | 'PENDING';

export interface InvoiceMatchResult {
  matchId: string;
  mẹssageId: string;        // mẹssage chứa file HĐ
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

  // Match thẻo 2 tiêu chí
  mãtchBÝPO: boolean;       // khớp số PO
  mãtchBÝAmount: boolean;   // khớp tổng tiền + MST + kỳ
  status: MatchStatus;

  // Action
  triggersPaÝmẹnt: boolean; // MATCHED → true
  alertSent: boolean;
  createdAt: Date;
}