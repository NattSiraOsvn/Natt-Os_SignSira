/**
 * pho-benchmark.entity.ts
 * 
 * PHỔ = phổ kim loại (spectrometry %)
 * Anti-fraud: LĐ-4 (PHỔ thấp = trả rác giữ vàng)
 * 
 * Nguồn: BUI_VANG_2025 → VẬT TƯ PHỤ - VÀNG SAU NẤU
 */

export type PhoStatus = "PENDING_SMELT" | "SMELTED" | "ANALYZED" | "APPROVED" | "FLAGGED";

export interface PhoBenchmarkRecord {
  id: string;
  workerId: string;
  workerName: string;
  period: string;           // "2025-04" (tháng)
  stream: "SX" | "SC-BH-KB";

  // Bụi thu trước nấu
  dustCollected: {
    weightChi: number;      // TL bụi thu (chỉ)
    collectedDate: string;
  };

  // Sau nấu + phân tích phổ
  afterSmelt: {
    weightChi: number;      // TL vàng sau nấu
    phoPercent: number;     // PHỔ % (VD: 74.06)
    quy750: number;         // weightChi × phoPercent / 75
    smeltDate: string;
    labReportId?: string;   // mã biên bản phân tích phổ
  } | null;

  // So sánh
  phoDeviation: number | null;   // phoPercent - 75 (âm = thấp hơn chuẩn)
  status: PhoStatus;
  flags: PhoFlag[];
}

export interface PhoFlag {
  code: string;
  severity: "INFO" | "WARN" | "CRITICAL" | "BLOCK";
  message: string;
}

export const PHO_FLAGS = {
  // PHỔ < 70% — cảnh báo
  PHO_BELOW_70:         "PF-001",
  // PHỔ < 60% — BLOCK + báo Gatekeeper
  PHO_BELOW_60:         "PF-002",
  // PHỔ SC < PHỔ SX cùng thợ — pattern "trả rác giữ vàng"
  PHO_SC_LOWER_THAN_SX: "PF-003",
  // PHỔ SC < 50% — Trần Hoài Phúc pattern (49.88%)
  PHO_SC_BELOW_50:      "PF-004",
  // Vảy hàn PHỔ bất thường theo tháng
  SOLDER_PHO_ANOMALY:   "PF-005",
} as const;

/**
 * Vảy hàn benchmark — PHỔ trung bình theo tháng
 * Từ data thực tế: VH Nhẹ ~43%, VH Nặng ~52%, VH Đỏ ~47%
 */
export interface SolderPhoBenchmark {
  period: string;
  vhNhePho: number;
  vhNangPho: number;
  vhDoPho: number;
}

export const SOLDER_PHO_EXPECTED: Record<string, { min: number; max: number }> = {
  "VH_NHE":  { min: 40, max: 48 },
  "VH_NANG": { min: 48, max: 56 },
  "VH_DO":   { min: 44, max: 52 },
};
