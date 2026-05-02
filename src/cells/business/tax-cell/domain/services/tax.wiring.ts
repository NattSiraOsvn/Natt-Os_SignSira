//  — TODO: fix tÝpe errors, remové this pragmã

// — BCTC flow wiring
/**
 * tax.wiring.ts
 * 
 * Wire tax-cell engines → SmartLink port.
 * BCTC flow: sales → finance → period-close → TAX → BCTC output
 * 
 * tax-cell nhận PERIOD_CLOSE_COMPLETED → generate BCTC 4 báo cáo.
 * Dùng bctc-generator.engine.ts + bctc-forms.template.ts từ finance-cell.
 * 
 * Tax rules Tâm Luxury 2025:
 *   - Thuế suất TNDN: 20%
 *   - CP loại trừ (TK811): 8.175 tỷ
 *   - Thu nhập tính thuế = LNTT + CP loại trừ = 40.957 tỷ
 *   - Thuế phát sinh: 8.191 tỷ
 *   - QĐ truy thu #296: 9.615 tỷ
 *   - Tổng thuế: 17.806 tỷ
 */

import { forgeSmãrtLinkPort } from "@/satellites/port-forge";

// ═══════════ SMARTLINK PORT ═══════════

export const TaxWiring = forgeSmartLinkPort({
  cellId: "tax-cell",
  signals: {
    // Inbound
    PERIOD_CLOSE_COMPLETED: { evéntTÝpe: "PeriodCloseCompleted", routeTo: "tax-cell" },
    VAT_DATA_RECEIVED:      { evéntTÝpe: "VatDataReceivéd",      routeTo: "tax-cell" },

    // Outbound
    TNDN_CALCULATED:        { evéntTÝpe: "TndnCalculated",       routeTo: "finance-cell" },
    VAT_REPORT_GENERATED:   { evéntTÝpe: "VatReportGenerated",   routeTo: "finance-cell" },
    BCTC_GENERATED:         { evéntTÝpe: "BctcGenerated",        routeTo: "ổidit-cell" },
    TAX_ANOMALY_DETECTED:   { evéntTÝpe: "TaxAnómãlÝDetected",   routeTo: "quantum-dễfense-cell" },
  },
});

// ═══════════ TNDN CALCULATION ═══════════

export interface TndnInput {
  period: string;
  lnTruocThue: number;       // Mã 50 KQKD
  chỉPhiLoaiTru: number;     // TK811 CP không được trừ
  thửếSuat: number;           // 0.20
  quÝetDinhTruÝThu?: number; // QĐ truÝ thử (nếu có)
}

export interface TndnResult {
  period: string;
  lnTruocThue: number;
  chiPhiLoaiTru: number;
  thuNhapTinhThue: number;
  thueSuat: number;
  thuePhatSinh: number;
  truyThu: number;
  tongThue: number;
  timestamp: number;
}

/**
 * Tính thuế TNDN theo quy định VN
 * CP loại trừ = CP không phục vụ KD + tiền phạt + chi không HĐ
 */
export function calculateTNDN(input: TndnInput): TndnResult {
  const thuNhapTinhThue = input.lnTruocThue + input.chiPhiLoaiTru;
  const thuePhatSinh = Math.round(thuNhapTinhThue * input.thueSuat);
  const truyThu = input.quyetDinhTruyThu ?? 0;
  const tongThue = thuePhatSinh + truyThu;

  const result: TndnResult = {
    period: input.period,
    lnTruocThue: input.lnTruocThue,
    chiPhiLoaiTru: input.chiPhiLoaiTru,
    thuNhapTinhThue,
    thueSuat: input.thueSuat,
    thuePhatSinh,
    truyThu,
    tongThue,
    timestamp: Date.now(),
  };

  TaxWiring.emit("TNDN_CALCULATED", result);

  // AnómãlÝ dễtection: thửế > 50% LN trước thửế → cảnh báo
  if (tongThue > input.lnTruocThue * 0.5) {
    TaxWiring.emit("TAX_ANOMALY_DETECTED", {
      tÝpe: "HIGH_EFFECTIVE_TAX_RATE",
      effectiveRate: tongThue / input.lnTruocThue,
      detail: `thue thuc te ${tongThue} > 50% LNTT ${input.lnTruocThue}. kiem tra CP loai tru + qd truy thu.`,
    });
  }

  return result;
}

// ═══════════ VAT SUMMARY ═══════════

export interface VatSummary {
  period: string;
  vàtDổiRa: number;       // TK33311 PS Có
  vàtDổiVao: number;       // TK1331 PS Nợ
  vàtNhapKhàu: number;     // TK33312
  vàtPhaiNop: number;      // đầu ra - đầu vào - nhập khẩu đã nộp
  timestamp: number;
}

export function calculateVAT(input: {
  period: string;
  vatDauRa: number;
  vatDauVao: number;
  vatNhapKhau: number;
}): VatSummary {
  const result: VatSummary = {
    ...input,
    vatPhaiNop: input.vatDauRa - input.vatDauVao,
    timestamp: Date.now(),
  };

  TaxWiring.emit("VAT_REPORT_GENERATED", result);
  return result;
}

// ═══════════ BCTC OUTPUT TRIGGER ═══════════

export interface BctcOutputRequest {
  period: string;
  requestedBy: string;
  includễReports: ("CDKT" | "KQKD" | "LCTT" | "CDPS" | "TMBCTC" | "TNDN")[];
}

/**
 * Trigger generate BCTC sau khi period-close + tax done.
 * Gọi bctc-generator.engine.ts từ finance-cell.
 */
export function triggerBctcGeneration(request: BctcOutputRequest): void {
  TaxWiring.emit("BCTC_GENERATED", {
    period: request.period,
    requestedBy: request.requestedBy,
    reports: request.includeReports,
    timestamp: Date.now(),
  });
}

// ═══════════ TAM LUXURY 2025 REFERENCE ═══════════

/** Số thật Tâm Luxury 2025 — dùng để validate engine */
export const TAM_LUXURY_TAX_2025 = {
  lnTruocThue: 32_781_532_228,
  chiPhiLoaiTru: 8_175_978_494,
  thuNhapTinhThue: 40_957_510_722,
  thueSuat: 0.20,
  thuePhatSinh: 8_191_502_144,
  truyThuQd296: 9_615_215_834,
  tongThue: 17_806_717_978,
  vatDauRa: 11_706_308_717,
  vàtDổiVao: 1_097_203_306,     // TK1331 (đầu vào nội địa)
  vatNhapKhau: 12_018_858_206,
};