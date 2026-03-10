export type TaxType = 'GTGT' | 'TNDN' | 'NK' | 'TTDB' | 'OTHER';
export type TaxPeriod = 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
export type TaxReturnStatus = 'DRAFT' | 'SUBMITTED' | 'PAID' | 'ADJUSTED';

export interface TaxTransaction {
  transactionId: string;
  taxType: TaxType;
  period: string;           // MM/YYYY hoặc Qx/YYYY
  baseAmount: number;       // thu nhập tính thuế / doanh thu tính thuế
  taxRate: number;          // %
  taxAmount: number;        // baseAmount * taxRate / 100
  adjustments?: number;     // điều chỉnh tăng/giảm (thuế TNDN)
  finalAmount: number;      // taxAmount + adjustments
  status: TaxReturnStatus;
  submittedAt?: Date;
  paidAt?: Date;
  refDocs: string[];        // chứng từ liên quan (số hóa đơn, quyết toán)
  notes?: string;
}

export interface GtgtDeclaration {
  // Mẫu 03/GTGT
  period: string;
  revenue: number;          // doanh thu bán ra chưa thuế
  cogs: number;             // giá vốn tương ứng
  taxableAmount: number;    // revenue - cogs
  taxRate: number;          // 10% (mặc định)
  taxPayable: number;       // taxableAmount * taxRate / 100
  previousPeriodCredit?: number; // thuế nộp thừa kỳ trước
  totalPayable: number;     // taxPayable - previousPeriodCredit
}
