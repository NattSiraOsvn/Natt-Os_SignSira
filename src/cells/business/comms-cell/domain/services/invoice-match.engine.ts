import { InvoiceMatchResult, MatchStatus } from '../entities/invoice-match.entity';

interface OCRData {
  invoiceNo: string;
  date: Date;
  total: number;
  taxCode: string;
  period: string; // MM/YYYY
}

interface PORef {
  poId: string;
  total: number;
  taxCode: string;
  period: string;
}

export class InvoiceMatchEngine {
  /**
   * Match theo 2 tiêu chí:
   * 1. Số PO (nếu có trong nội dung HĐ)
   * 2. Tổng tiền + MST + kỳ
   */
  static match(
    messageId: string,
    roomId: string,
    partnerId: string,
    ocr: OCRData,
    pos: PORef[]
  ): InvoiceMatchResult {
    const AMOUNT_TOLERANCE = 0.01; // ±1% tolerance

    // Tìm PO khớp số
    const byPO = pos.find(p => ocr.invoiceNo.includes(p.poId));

    // Tìm PO khớp tiền + MST + kỳ
    const byAmount = pos.find(p =>
      p.taxCode === ocr.taxCode &&
      p.period === ocr.period &&
      Math.abs(p.total - ocr.total) / p.total <= AMOUNT_TOLERANCE
    );

    const matchByPO = !!byPO;
    const matchByAmount = !!byAmount;
    const matchedPO = byPO ?? byAmount;

    let status: MatchStatus;
    if (matchByPO && matchByAmount) status = 'MATCHED';
    else if (matchByPO || matchByAmount) status = 'PARTIAL';
    else if (ocr.total > 0) status = 'MISMATCH';
    else status = 'UNRECOGNIZED';

    return {
      matchId: `MATCH-${Date.now()}`,
      messageId,
      roomId,
      partnerId,
      extractedInvoiceNo: ocr.invoiceNo,
      extractedDate: ocr.date,
      extractedTotal: ocr.total,
      extractedTaxCode: ocr.taxCode,
      poId: matchedPO?.poId,
      poTotal: matchedPO?.total,
      poTaxCode: matchedPO?.taxCode,
      matchByPO,
      matchByAmount,
      status,
      triggersPayment: status === 'MATCHED',
      alertSent: false,
      createdAt: new Date(),
    };
  }
}