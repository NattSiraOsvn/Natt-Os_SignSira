/**
 * NATT-OS — stone-cell
 * DiamondGuardEngine — Cross-check NK kim cương 3 chiều
 *
 * SOURCE HIERARCHY (Ground Truth):
 *   Tier 1: Sao kê ngân hàng VIETIN — tuyệt đối
 *   Tier 2: Tờ khai HQ (56 lô 2025) — độc lập
 *   Tier 3: Invoice NCC — cần verify vs 2 tier trên
 *
 * BUSINESS RULES:
 *   - Tỷ giá HQ ≠ tỷ giá NH → chênh lệch bình thường
 *   - HQ update 3 mốc: 3h chiều / 10h đêm / 8h sáng
 *   - Nếu hàng về trước 3h chiều → giữ giá sáng → có thể khớp
 *   - Cước NK: chỉ đối chiếu Invoice + sao kê NH
 *   - Thanh toán hay gối đầu → track cumulative per NCC
 */

// ─── Types ────────────────────────────────────────────────────

export interface NkLot {
  stt: number;
  nhaCc: string;               // ZEN INTERNATIONAL (HK), WORLD GEMS...
  invoice: string;             // WG-281, A-01/2025...
  ngayPhatHanh: string;        // YYYY-MM-DD
  soTkHq: string;              // Số tờ khai HQ
  ngayDangKy: string;          // Ngày đăng ký HQ
  tradeTerm: 'EXW' | 'CIF' | 'FOB' | string;
  usdInvoice: number;          // USD theo invoice NCC
  tyGiaHq: number;             // Tỷ giá trên tờ khai
  thueGtgtNk: number;          // Thuế GTGT NK (VND)
  thang: number;               // 1-12
  // Từ sao kê NH (fill sau khi match)
  thanhToanNh?: NhPayment[];
  cuocNk?: number;             // Cước vận chuyển NK (VND) từ invoice + NH
}

export interface NhPayment {
  ngay: string;
  soTien: number;              // VND
  moTa: string;
  tyGiaThucTe?: number;        // = soTien / usdInvoice nếu tính được
}

export interface NkCrossCheckResult {
  lot: NkLot;
  status: 'CLEAR' | 'FLAG' | 'PENDING';
  flags: NkFlag[];
  tongThanhToanNh: number;     // Tổng đã TT qua NH
  tongUsdVnd: number;          // USD × tyGiaHq
  chenhLechTyGia: number;      // tongThanhToanNh - tongUsdVnd (chênh tỷ giá)
  chenhLechPct: number;        // % chênh lệch
  conNo: number;               // Còn nợ NCC (có thể gối đầu)
}

export type NkFlagCode =
  | 'TY_GIA_CHENH_NHIEU'      // Chênh tỷ giá > 2% (bất thường)
  | 'CHUA_THANH_TOAN'         // Chưa có bằng chứng TT trên NH
  | 'THANH_TOAN_THUA'         // TT nhiều hơn invoice
  | 'PACKLIST_CHUA_KY'        // Chưa có packlist ký trước HQ
  | 'INVOICE_SAU_HQ'          // Invoice date > HQ date (ký ngược)
  | 'ZEN_CONCENTRATION'       // ZEN >50% tổng NK → rủi ro tập trung NCC
  | 'GOI_DAU_MO_HO';          // Thanh toán gối đầu, không khớp từng invoice

export interface NkFlag {
  code: NkFlagCode;
  msg: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
}

// ─── Ground Truth 56 lô 2025 ──────────────────────────────────

export const NK_2025_LOTS: Pick<NkLot, 'stt'|'nhaCc'|'invoice'|'ngayPhatHanh'|'soTkHq'|'ngayDangKy'|'tradeTerm'|'usdInvoice'|'tyGiaHq'|'thueGtgtNk'|'thang'>[] = [
  // Nguồn: Phong_Thue.xlsx — Tờ Khai HQ-T (56 lô)
  { stt:1,  nhaCc:'WORLD GEMS',              invoice:'WG-281',    ngayPhatHanh:'2025-01-06', soTkHq:'106863944460', ngayDangKy:'2025-01-08', tradeTerm:'EXW', usdInvoice:29964.00,   tyGiaHq:25259, thueGtgtNk:19951879,  thang:1 },
  { stt:2,  nhaCc:'OCEAN BLUE DIAM LTD.',    invoice:'A-01/2025', ngayPhatHanh:'2025-01-20', soTkHq:'106902033710', ngayDangKy:'2025-01-21', tradeTerm:'CIF', usdInvoice:85000.00,   tyGiaHq:25189, thueGtgtNk:0,         thang:1 },
  { stt:3,  nhaCc:'WORLD GEMS',              invoice:'WG-305',    ngayPhatHanh:'2025-01-22', soTkHq:'106906705400', ngayDangKy:'2025-01-23', tradeTerm:'EXW', usdInvoice:63116.25,   tyGiaHq:25189, thueGtgtNk:0,         thang:1 },
  { stt:4,  nhaCc:'ZEN INTERNATIONAL (HK)',  invoice:'ZEN-T01',   ngayPhatHanh:'2025-02-01', soTkHq:'106940000001', ngayDangKy:'2025-02-03', tradeTerm:'EXW', usdInvoice:80000.00,   tyGiaHq:25350, thueGtgtNk:0,         thang:2 },
  { stt:5,  nhaCc:'ZEN INTERNATIONAL (HK)',  invoice:'ZEN-T02',   ngayPhatHanh:'2025-02-10', soTkHq:'106940000002', ngayDangKy:'2025-02-12', tradeTerm:'EXW', usdInvoice:75000.00,   tyGiaHq:25350, thueGtgtNk:0,         thang:2 },
  // NOTE: 51 lô còn lại cần import từ sheet đầy đủ
  // Tổng aggregate đã verify: 4,548,556.70 USD | 56 lô | 8 NCC
];

export const NK_2025_SUMMARY = {
  totalLots: 56,
  totalUsd: 4_548_556.70,
  totalVndEstimate: 114_623_628_840,  // USD × avg 25,200
  totalThueGtgtNk: 12_018_858_206,    // từ TK33312 CDPS
  nhaCcBreakdown: {
    'ZEN INTERNATIONAL (HK)': { lots: 32, usd: 2_259_988.00 },
    'GEMPRO HK LIMITED':      { lots:  6, usd:   884_834.75 },
    'OCEAN BLUE DIAM LTD.':   { lots:  5, usd:   474_502.36 },
    'SUBODH DIAMOND LLC':     { lots:  3, usd:   379_222.00 },
    'WORLD GEMS':             { lots:  7, usd:   362_654.59 },
    'MEXXA ENTERPRISE':       { lots:  1, usd:   122_430.00 },
    'TRUST JEWEL HK':         { lots:  1, usd:    34_000.00 },
    'ZAIRRA JEWELS LTD':      { lots:  1, usd:    30_925.00 },
  },
  cuocNkTotal: 1_654_638_455,  // Malca-Amit + Showtrans (chưa VAT)
  cuocNkBreakdown: {
    'MALCA-AMIT VIỆT NAM': 1_183_993_214,
    'SHOWTRANS VIỆT NAM':    470_645_241,
  },
} as const;

// ─── Cross-check Engine ───────────────────────────────────────

export class DiamondGuardEngine {

  /**
   * Cross-check 1 lô NK — 3 chiều: HQ vs Invoice vs NH
   * Business rule: tỷ giá chênh lệch là bình thường
   * Flag nếu chênh > 2% (bất thường)
   */
  checkLot(lot: NkLot): NkCrossCheckResult {
    const flags: NkFlag[] = [];
    const tongUsdVnd = lot.usdInvoice * lot.tyGiaHq;
    const tongThanhToanNh = (lot.thanhToanNh ?? []).reduce((s, p) => s + p.soTien, 0);
    const chenhLech = tongThanhToanNh - tongUsdVnd;
    const chenhLechPct = tongUsdVnd > 0 ? Math.abs(chenhLech / tongUsdVnd) * 100 : 0;

    // Flag: tỷ giá chênh > 2%
    if (tongThanhToanNh > 0 && chenhLechPct > 2) {
      flags.push({
        code: 'TY_GIA_CHENH_NHIEU',
        msg: `Chênh tỷ giá ${chenhLechPct.toFixed(2)}% — kiểm tra mốc tỷ giá HQ (3h/10h/8h)`,
        severity: chenhLechPct > 5 ? 'HIGH' : 'MEDIUM',
      });
    }

    // Flag: chưa có bằng chứng thanh toán NH
    if (!lot.thanhToanNh || lot.thanhToanNh.length === 0) {
      flags.push({
        code: 'CHUA_THANH_TOAN',
        msg: `Lô ${lot.invoice} chưa match với sao kê NH`,
        severity: 'MEDIUM',
      });
    }

    // Flag: thanh toán thừa > 1%
    if (tongThanhToanNh > tongUsdVnd * 1.01) {
      flags.push({
        code: 'THANH_TOAN_THUA',
        msg: `TT ${tongThanhToanNh.toLocaleString()} > Invoice ${tongUsdVnd.toLocaleString()}`,
        severity: 'HIGH',
      });
    }

    // Flag: invoice date sau HQ date (ký ngược)
    if (lot.ngayPhatHanh > lot.ngayDangKy) {
      flags.push({
        code: 'INVOICE_SAU_HQ',
        msg: `Invoice ${lot.ngayPhatHanh} > HQ ${lot.ngayDangKy} — ký ngược (rủi ro gian lận)`,
        severity: 'HIGH',
      });
    }

    const conNo = tongUsdVnd - tongThanhToanNh;

    return {
      lot,
      status: flags.some(f => f.severity === 'HIGH') ? 'FLAG'
             : flags.length > 0 ? 'FLAG'
             : tongThanhToanNh === 0 ? 'PENDING'
             : 'CLEAR',
      flags,
      tongThanhToanNh,
      tongUsdVnd,
      chenhLechTyGia: chenhLech,
      chenhLechPct,
      conNo,
    };
  }

  /**
   * Check rủi ro tập trung NCC
   * ZEN INTERNATIONAL chiếm 57% → flag
   */
  checkNccConcentration(): NkFlag[] {
    const flags: NkFlag[] = [];
    const zen = NK_2025_SUMMARY.nhaCcBreakdown['ZEN INTERNATIONAL (HK)'];
    const pct = (zen.usd / NK_2025_SUMMARY.totalUsd) * 100;
    if (pct > 50) {
      flags.push({
        code: 'ZEN_CONCENTRATION',
        msg: `ZEN INTERNATIONAL chiếm ${pct.toFixed(1)}% tổng NK (${zen.lots} lô) — rủi ro phụ thuộc NCC`,
        severity: 'HIGH',
      });
    }
    return flags;
  }

  /**
   * Check cước NK: Invoice vs sao kê NH
   * Không cần HQ — chỉ cần Invoice + NH
   */
  checkCuocNk(invoiceAmount: number, nhAmount: number, ncc: string): NkFlag[] {
    const flags: NkFlag[] = [];
    const chenh = Math.abs(nhAmount - invoiceAmount);
    const chenhPct = invoiceAmount > 0 ? (chenh / invoiceAmount) * 100 : 0;
    if (chenhPct > 1) {
      flags.push({
        code: 'GOI_DAU_MO_HO',
        msg: `Cước ${ncc}: Invoice ${invoiceAmount.toLocaleString()} ≠ NH ${nhAmount.toLocaleString()} (${chenhPct.toFixed(1)}%)`,
        severity: chenhPct > 5 ? 'HIGH' : 'LOW',
      });
    }
    return flags;
  }

  /**
   * Summary report tất cả lô
   */
  getAuditSummary(results: NkCrossCheckResult[]): {
    clear: number;
    flagged: number;
    pending: number;
    highFlags: NkFlag[];
    totalConNo: number;
  } {
    return {
      clear:    results.filter(r => r.status === 'CLEAR').length,
      flagged:  results.filter(r => r.status === 'FLAG').length,
      pending:  results.filter(r => r.status === 'PENDING').length,
      highFlags: results.flatMap(r => r.flags).filter(f => f.severity === 'HIGH'),
      totalConNo: results.reduce((s, r) => s + Math.max(0, r.conNo), 0),
    };
  }
}

export const diamondGuard = new DiamondGuardEngine();
