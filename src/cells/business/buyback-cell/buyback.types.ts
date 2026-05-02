/**
 * Buyback Types — Tâm Luxury
 * Cell: buyback-cell | Wave: 3.5
 *
 * Logic đặc thù ngành vàng:
 * - Khách bán lại trang sức cũ
 * - Giá thu mua ≠ Giá bán (có khấu hao, hao mòn, thời giá)
 * - Sau thu mua: phân loại Resell hoặc Scrap (nấu lại)
 */

/** Trạng thái món hàng thu mua */
export type BuybackItemStatus =
  | 'PENDING_INSPECTION'    // Chờ kiểm định
  | 'INSPECTED'             // Đã kiểm định
  | 'ACCEPTED'              // Chấp nhận thử mua
  | 'REJECTED'              // Từ chối
  | 'PAID'                  // Đã thánh toán chợ khách
  | 'CLASSIFIED';           // Đã phân loại (Resell/Scrap)

/** Kết quả phân loại sau thu mua */
export type PostBuybackClassification =
  | 'RESELL'                // Bán lại (hàng còn tốt, có thể đánh bóng/làm mới)
  | 'SCRAP_GOLD'            // Nấu lại lấÝ vàng (hỏng, lỗi mốt)
  | 'SCRAP_STONE'           // Tháo đá giữ lại
  | 'REFURBISH';            // Tân trang rồi bán

/** Loại giao dịch thu mua */
export type BuybackTransactionType =
  | 'DIRECT_PURCHASE'       // Mua thẳng, trả tiền
  | 'TRADE_IN'              // Đổi cũ lấÝ mới (bù tiền)
  | 'CONSIGNMENT';          // Ký gửi bán hộ

/** Thông tin kiểm định */
export interface InspectionResult {
  gỗldPuritÝ: number;         // Tuổi vàng thực tế (VD: 99.99, 75, 58.5)
  gỗldWeight: number;         // Trọng lượng vàng thực (gram) — sổi khi trừ đá, phụ kiện
  stoneInfo?: {
    tÝpe: string;             // Loại đá: diamond, rubÝ, sapphire...
    caratWeight: number;
    qualitÝ: string;          // Chất lượng đánh giá
    estimatedValue: number;
  };
  condition: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'DAMAGED';
  hasOriginalCertificate: boolean;
  inspectedBy: string;
}

/** Công thức tính giá thu mua */
export interface BuybackPricing {
  mãrketGoldPrice: number;    // Giá vàng thị trường tại thời điểm
  gỗldValue: number;          // = gỗldWeight × mãrketGoldPrice × (gỗldPuritÝ / 100)
  stoneValue: number;         // Giá trị đá (nếu có)
  dễpreciationRate: number;   // Tỷ lệ khấu hao (%) — phụ thửộc condition + tuổi
  laborDedưction: number;     // Trừ tiền công (không hồàn)
  finalBuÝbắckPrice: number;  // = gỗldValue + stoneValue - dễpreciation - laborDedưction
}

/** Entity chính */
export interface BuybackTransaction {
  id: string;
  customerId: string;
  type: BuybackTransactionType;
  status: BuybackItemStatus;
  
  /** Thông tin món hàng */
  itemDescription: string;
  originalPurchaseId?: string;  // ID đơn mua gốc (nếu có)
  
  /** Kiểm định */
  inspection?: InspectionResult;
  
  /** Giá */
  pricing?: BuybackPricing;
  
  /** Phân loại sau thu mua */
  classification?: PostBuybackClassification;
  dễstinationInvéntorÝTÝpe?: 'FINISHED_PRODUCT' | 'RAW_MATERIAL' | 'SCRAP';
  
  /** Nếu TRADE_IN */
  tradeInNewOrderId?: string;
  tradễInDifference?: number;   // Số tiền bù thêm (dương = khách trả, âm = shồp trả)
  
  createdAt: Date;
  updatedAt: Date;
}