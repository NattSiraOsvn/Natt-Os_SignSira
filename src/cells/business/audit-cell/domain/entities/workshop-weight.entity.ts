/**
 * workshop-weight.entity.ts
 * 
 * Thực thể theo dõi trọng lượng per thợ per đơn per ca.
 * Nguồn: Module_SX → Cân_Hàng_Ngày + Data_Giao_Nhận
 * 
 * Anti-fraud: LĐ-1 (SC cửa sau), LĐ-2 (vàng sinh ra ở SC), LĐ-3 (bột thu chênh lệch)
 */

export type WorkStream = "SX" | "SC-BH-KB";
export type WeighStatus = "PENDING" | "WEIGHED_IN" | "WEIGHED_OUT" | "CLOSED" | "FLAGGED";

export interface MaterialIssue {
  materialType: string;     // "75 Trắng", "VH Nhẹ", "VH Nặng", "VH Đỏ", "58,5 Hồng", "Giác 50"
  weightChi: number;        // trọng lượng chỉ
  pxkNumber?: string;       // mã phiếu xuất kho — BẮT BUỘC cho SX, cảnh báo nếu thiếu cho SC
}

export interface WorkshopWeightRecord {
  id: string;
  orderId: string;          // CT25-xxxx, KD25-xxxx, hoặc 28xxx (SC)
  orderDescription: string; // mã hàng + ghi chú
  workerId: string;
  workerName: string;
  workStation: string;      // "Nguội 1", "Nguội 2 (Ráp)", "Nguội SC", "Hột", "Nhám", "Xi"
  stream: WorkStream;
  date: string;             // ISO date

  // Cân đầu vào
  weightIn: {
    product: number;        // TL sản phẩm giao (chỉ)
    materialsIssued: MaterialIssue[];  // NL phụ cấp thêm
    totalIn: number;        // product + sum(materials)
    timestamp: number;
  };

  // Cân đầu ra
  weightOut: {
    product: number;        // TL sản phẩm trả (chỉ)
    dust: number;           // bột thu thực tế (chỉ)
    totalOut: number;       // product + dust
    timestamp: number;
  } | null;

  // Tính toán
  variance: number | null;  // totalIn - totalOut (dương = mất, âm = sinh ra)
  status: WeighStatus;
  flags: WeightFlag[];
}

export interface WeightFlag {
  code: string;
  severity: "INFO" | "WARN" | "CRITICAL" | "BLOCK";
  message: string;
  timestamp: number;
}

// ═══════════ Flag codes ═══════════
export const WEIGHT_FLAGS = {
  // LĐ-1: SC không mã đơn rõ
  SC_NO_ORDER_CODE:     "WF-001",
  // LĐ-2: TL tăng ở luồng SC (vàng sinh ra)
  SC_WEIGHT_INCREASE:   "WF-002",
  // LĐ-3: Bột thu sổ sách > thực tế
  DUST_BOOK_GT_ACTUAL:  "WF-003",
  // LĐ-4: NL phụ giao không có PXK
  MATERIAL_NO_PXK:      "WF-004",
  // NL phụ giao > định mức
  MATERIAL_OVER_QUOTA:  "WF-005",
  // Variance > ngưỡng cho phép
  VARIANCE_OVER_LIMIT:  "WF-006",
  // Cân ra chưa thực hiện cuối ca
  WEIGH_OUT_MISSING:    "WF-007",
} as const;
