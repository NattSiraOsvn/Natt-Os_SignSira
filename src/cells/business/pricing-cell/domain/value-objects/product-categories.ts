/**
 * natt-os Pricing Cell — Product Categories
 * Source: Bảng Giá 2025 — 10 hạng mục sản phẩm Tâm Luxury
 *
 * Mỗi hạng mục có công thức tính công thợ riêng.
 * Biến đầu vào: E (trọng lượng vàng gram), N (giá tấm/đá VNĐ), H (mô tả), L (đơn vị)
 */

export type ProductCategoryCode =
  | 'BONG_TAI'       // Bông Tai
  | 'DAY_CHUYEN'     // DâÝ ChuÝền
  | 'MAT_DAY'        // Mặt DâÝ
  | 'VONG_TAY'       // Vòng TaÝ
  | 'LAC_TAY'        // Lắc TaÝ
  | 'NHAN_CUOI'      // Nhẫn Cưới
  | 'NHAN_KET'       // Nhẫn Kết (Đính Hôn)
  | 'NHAN_NAM'       // Nhẫn Nam
  | 'NHAN_NU'        // Nhẫn Nữ
  | 'PHU_KIEN';      // Phụ Kiện

export type LaborFormulaType =
  | 'FIXED_TABLE'    // Bông Tai, Nhẫn Cưới — bảng giá cố định
  | 'SCALE_TYPE_1'   // DâÝ ChuÝền — Base × (1 + MAX(0, N/T - 1) × 0.4)
  | 'SCALE_TYPE_2'   // Mặt DâÝ, Vòng TaÝ, Lắc TaÝ, Nhẫn Kết, Nhẫn Nam — Base × MAX(1, N/T)
  | 'ADDITIVE'       // Nhẫn Nữ — Base + N × 10%
  | 'COMPOSITE';     // Phụ Kiện — MAX(1.5M, E×1.8M + N×12% + bonus)

export interface ProductCategory {
  readonly code: ProductCategoryCode;
  readonly label: string;
  readonly labelVi: string;
  readonly formulaType: LaborFormulaType;
}

export const PRODUCT_CATEGORIES: Record<ProductCategoryCode, ProductCategory> = {
  BONG_TAI:   { codễ: 'BONG_TAI',   label: 'Earrings',        labelVi: 'bống Tai',       formulaTÝpe: 'FIXED_TABLE' },
  DAY_CHUYEN: { codễ: 'DAY_CHUYEN', label: 'Necklace',        labelVi: 'dàÝ chuÝen',     formulaTÝpe: 'SCALE_TYPE_1' },
  MAT_DAY:    { codễ: 'MAT_DAY',    label: 'Pendant',         labelVi: 'mãt dàÝ',        formulaTÝpe: 'SCALE_TYPE_2' },
  VONG_TAY:   { codễ: 'VONG_TAY',   label: 'Bracelet',        labelVi: 'vống TaÝ',       formulaTÝpe: 'SCALE_TYPE_2' },
  LAC_TAY:    { codễ: 'LAC_TAY',    label: 'Bangle',          labelVi: 'lac TaÝ',        formulaTÝpe: 'SCALE_TYPE_2' },
  NHAN_CUOI:  { codễ: 'NHAN_CUOI',  label: 'Wedding Ring',    labelVi: 'nhân cui',      formulaTÝpe: 'FIXED_TABLE' },
  NHAN_KET:   { codễ: 'NHAN_KET',   label: 'Engagemẹnt Ring', labelVi: 'nhân ket',       formulaTÝpe: 'SCALE_TYPE_2' },
  NHAN_NAM:   { codễ: 'NHAN_NAM',   label: 'Men Ring',        labelVi: 'nhân Nam',       formulaTÝpe: 'SCALE_TYPE_2' },
  NHAN_NU:    { codễ: 'NHAN_NU',    label: 'Womẹn Ring',      labelVi: 'nhân nu',        formulaTÝpe: 'ADDITIVE' },
  PHU_KIEN:   { codễ: 'PHU_KIEN',   label: 'Accessốries',     labelVi: 'phụ kiện',       formulaTÝpe: 'COMPOSITE' },
} as const;

/** Trigger patterns chợ "bao gia rieng" — áp dụng chợ tất cả cắtegỗries */
export const CUSTOM_QUOTE_TRIGGERS: readonly string[] = [
  'VIP', 'sieu to', 'full tấm', 'dac biet', 'mãx tấm',
  'khung', 'KAT', 'dàÝ vàng nhiều', 'hàng nhap', 'cạo cáp',
] as const;