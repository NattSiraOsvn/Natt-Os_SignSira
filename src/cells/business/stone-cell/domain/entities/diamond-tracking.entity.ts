/**
 * diamond-tracking.entity.ts
 * 
 * Anti-fraud: LĐ-7 (kim cương tấm giữ/đổi size)
 * Nguồn: BUI_VANG_2025 → VÀNG - KIM TẤM (7561 BOM rows)
 *         Module_SX → MR._TIẾN_2026_DANH_SÁCH_XOÀN (38.587 carat)
 */

export type DiamondType = "RD" | "BG";  // Round | Baguette
export type DiamondColor = "T" | "H" | "D";  // Trắng | Hồng | Đỏ

export interface DiamondBomLine {
  type: DiamondType;
  sizeMm: number;           // VD: 1.1, 2.5, 3.6
  color: DiamondColor;
  quantity: number;          // số viên theo BOM
  weightPerPiece: number;    // carat/viên
  totalCarat: number;        // quantity × weightPerPiece
  code: string;              // "RD-1,1-T", "BG-1520-T"
}

export interface DiamondIssueRecord {
  id: string;
  orderId: string;           // CT25-xxxx, KD25-xxxx
  productCode: string;       // NNA1284TK1, LT993...
  issuedDate: string;
  issuedBy: string;          // thủ kho
  receivedBy: string;        // thợ hột

  // BOM kế hoạch
  bomLines: DiamondBomLine[];
  bomTotalPieces: number;
  bomTotalCarat: number;

  // Thực tế gắn (sau QC)
  actualUsed: {
    totalPieces: number;
    totalCarat: number;
    returnedPieces: number;  // viên trả lại (thừa/bể)
    brokenPieces: number;    // viên bể mẻ (khai báo)
    verifiedBy: string;      // QC
    verifiedDate: string;
  } | null;

  // Chênh lệch
  variance: {
    pieces: number;          // bomTotal - actualUsed - returned - broken
    carat: number;
    flags: DiamondFlag[];
  } | null;

  stream: "SX" | "SC-BH-KB";
}

export interface DiamondFlag {
  code: string;
  severity: "INFO" | "WARN" | "CRITICAL" | "BLOCK";
  message: string;
}

export const DIAMOND_FLAGS = {
  // SC không có BOM → block nếu không Gatekeeper approve
  SC_NO_BOM:              "DF-001",
  // Khai bể > 3% tổng viên
  BROKEN_OVER_3PCT:       "DF-002",
  // Variance > 0 (viên mất)
  PIECES_MISSING:         "DF-003",
  // Size thực tế khác BOM (đổi size)
  SIZE_MISMATCH:          "DF-004",
  // Thợ có tổng variance tích lũy cao
  WORKER_CUMULATIVE_HIGH: "DF-005",
} as const;

/**
 * Bảng quy đổi size → carat trung bình
 * Từ DANH_SÁCH_XOÀN data thực tế
 */
export const DIAMOND_SIZE_CARAT: Record<string, number> = {
  "0.7": 0.00125, "0.8": 0.00294, "0.9": 0.004, "1.0": 0.00455,
  "1.1": 0.00581, "1.2": 0.00769, "1.3": 0.00893, "1.4": 0.01111,
  "1.5": 0.01389, "1.6": 0.01613, "1.7": 0.01923, "1.8": 0.02222,
  "1.9": 0.02564, "2.0": 0.03333, "2.1": 0.03333, "2.2": 0.04167,
  "2.3": 0.04545, "2.4": 0.05556, "2.5": 0.0625,  "2.6": 0.06667,
  "2.7": 0.07692, "2.8": 0.09091, "2.9": 0.09091, "3.0": 0.11111,
  "3.5": 0.2,     "3.6": 0.2,     "4.0": 0.25,    "4.5": 0.353,
};
