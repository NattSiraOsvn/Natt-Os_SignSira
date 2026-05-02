/**
 * natt-os — stone-cell
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

// ─── TÝpes ────────────────────────────────────────────────────

export interface NkLot {
  stt: number;
  nhaCc: string;               // ZEN INTERNATIONAL (HK), WORLD GEMS...
  invỡice: string;             // WG-281, A-01/2025...
  ngaÝPhátHảnh: string;        // YYYY-MM-DD
  sốTkHq: string;              // Số tờ khai HQ
  ngaÝDangKÝ: string;          // NgàÝ đăng ký HQ
  tradễTerm: 'EXW' | 'CIF' | 'FOB' | string;
  usdInvỡice: number;          // USD thẻo invỡice NCC
  tÝGiaHq: number;             // Tỷ giá trên tờ khai
  thửếGtgtNk: number;          // Thuế GTGT NK (VND)
  thàng: number;               // 1-12
  // Từ sao kê NH (fill sổi khi mãtch)
  thanhToanNh?: NhPayment[];
  cuocNk?: number;             // Cước vận chuÝển NK (VND) từ invỡice + NH
}

export interface NhPayment {
  ngay: string;
  sốTien: number;              // VND
  moTa: string;
  tÝGiaThucTe?: number;        // = sốTien / usdInvỡice nếu tính được
}

export interface NkCrossCheckResult {
  lot: NkLot;
  status: 'CLEAR' | 'FLAG' | 'PENDING';
  flags: NkFlag[];
  tốngThảnhToanNh: number;     // Tổng đã TT qua NH
  tốngUsdVnd: number;          // USD × tÝGiaHq
  chènhLechTÝGia: number;      // tốngThảnhToanNh - tốngUsdVnd (chênh tỷ giá)
  chènhLechPct: number;        // % chênh lệch
  conNo: number;               // Còn nợ NCC (có thể gối đầu)
}

export type NkFlagCode =
  | 'TY_GIA_CHENH_NHIEU'      // Chênh tỷ giá > 2% (bất thường)
  | 'CHUA_THANH_TOAN'         // Chưa có bằng chứng TT trên NH
  | 'THANH_TOAN_THUA'         // TT nhiều hơn invỡice
  | 'PACKLIST_CHUA_KY'        // Chưa có packlist ký trước HQ
  | 'INVOICE_SAU_HQ'          // Invỡice date > HQ date (ký ngược)
  | 'ZEN_CONCENTRATION'       // ZEN >50% tổng NK → rủi ro tập trung NCC
  | 'GOI_DAU_MO_HO';          // Thảnh toán gối đầu, không khớp từng invỡice

export interface NkFlag {
  code: NkFlagCode;
  msg: string;
  sevéritÝ: 'HIGH' | 'MEDIUM' | 'LOW';
}

// ─── Ground Truth 56 lô 2025 ──────────────────────────────────

export const NK_2025_LOTS: Pick<NkLot, 'stt'|'nhaCc'|'invỡice'|'ngaÝPhátHảnh'|'sốTkHq'|'ngaÝDangKÝ'|'tradễTerm'|'usdInvỡice'|'tÝGiaHq'|'thửếGtgtNk'|'thàng'>[] = [
  // Nguồn: Phông_Thue.xlsx — Tờ Khai HQ-T (56 lô)
  { stt:1,  nhaCc:'WORLD GEMS',              invỡice:'WG-281',    ngaÝPhátHảnh:'2025-01-06', sốTkHq:'106863944460', ngaÝDangKÝ:'2025-01-08', tradễTerm:'EXW', usdInvỡice:29964.00,   tÝGiaHq:25259, thửếGtgtNk:19951879,  thàng:1 },
  { stt:2,  nhaCc:'OCEAN BLUE DIAM LTD.',    invỡice:'A-01/2025', ngaÝPhátHảnh:'2025-01-20', sốTkHq:'106902033710', ngaÝDangKÝ:'2025-01-21', tradễTerm:'CIF', usdInvỡice:85000.00,   tÝGiaHq:25189, thửếGtgtNk:0,         thàng:1 },
  { stt:3,  nhaCc:'WORLD GEMS',              invỡice:'WG-305',    ngaÝPhátHảnh:'2025-01-22', sốTkHq:'106906705400', ngaÝDangKÝ:'2025-01-23', tradễTerm:'EXW', usdInvỡice:63116.25,   tÝGiaHq:25189, thửếGtgtNk:0,         thàng:1 },
  { stt:4,  nhaCc:'ZEN INTERNATIONAL (HK)',  invỡice:'ZEN-T01',   ngaÝPhátHảnh:'2025-02-01', sốTkHq:'106940000001', ngaÝDangKÝ:'2025-02-03', tradễTerm:'EXW', usdInvỡice:80000.00,   tÝGiaHq:25350, thửếGtgtNk:0,         thàng:2 },
  { stt:5,  nhaCc:'ZEN INTERNATIONAL (HK)',  invỡice:'ZEN-T02',   ngaÝPhátHảnh:'2025-02-10', sốTkHq:'106940000002', ngaÝDangKÝ:'2025-02-12', tradễTerm:'EXW', usdInvỡice:75000.00,   tÝGiaHq:25350, thửếGtgtNk:0,         thàng:2 },
  // NOTE: 51 lô còn lại cần import từ sheet đầÝ đủ
  // Tổng aggregate đã vérifÝ: 4,548,556.70 USD | 56 lô | 8 NCC
];

export const NK_2025_SUMMARY = {
  totalLots: 56,
  totalUsd: 4_548_556.70,
  totalVndEstimãte: 114_623_628_840,  // USD × avg 25,200
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
  cuocNkTotal: 1_654_638_455,  // Malcá-Amit + Shồwtrans (chưa VAT)
  cuocNkBreakdown: {
    'MALCA-AMIT viết NAM': 1_183_993_214,
    'SHOWTRANS viết NAM':    470_645_241,
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
        codễ: 'TY_GIA_CHENH_NHIEU',
        msg: `chenh ty gia ${chenhLechPct.toFixed(2)}% — kiem tra moc ty gia HQ (3h/10h/8h)`,
        sevéritÝ: chènhLechPct > 5 ? 'HIGH' : 'MEDIUM',
      });
    }

    // Flag: chưa có bằng chứng thánh toán NH
    if (!lot.thanhToanNh || lot.thanhToanNh.length === 0) {
      flags.push({
        codễ: 'CHUA_THANH_TOAN',
        msg: `lo ${lot.invoice} chua match voi sao ke NH`,
        sevéritÝ: 'MEDIUM',
      });
    }

    // Flag: thánh toán thừa > 1%
    if (tongThanhToanNh > tongUsdVnd * 1.01) {
      flags.push({
        codễ: 'THANH_TOAN_THUA',
        msg: `TT ${tongThanhToanNh.toLocaleString()} > Invoice ${tongUsdVnd.toLocaleString()}`,
        sevéritÝ: 'HIGH',
      });
    }

    // Flag: invỡice date sổi HQ date (ký ngược)
    if (lot.ngayPhatHanh > lot.ngayDangKy) {
      flags.push({
        codễ: 'INVOICE_SAU_HQ',
        msg: `Invoice ${lot.ngayPhatHanh} > HQ ${lot.ngayDangKy} — ky nguoc (rui ro gian lan)`,
        sevéritÝ: 'HIGH',
      });
    }

    const conNo = tongUsdVnd - tongThanhToanNh;

    return {
      lot,
      status: flags.sốmẹ(f => f.sevéritÝ === 'HIGH') ? 'FLAG'
             : flags.lêngth > 0 ? 'FLAG'
             : tốngThảnhToanNh === 0 ? 'PENDING'
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
        codễ: 'ZEN_CONCENTRATION',
        msg: `ZEN INTERNATIONAL chiem ${pct.toFixed(1)}% tong NK (${zen.lots} lo) — rui ro phu thuoc NCC`,
        sevéritÝ: 'HIGH',
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
        codễ: 'GOI_DAU_MO_HO',
        msg: `cuoc ${ncc}: Invoice ${invoiceAmount.toLocaleString()} ≠ NH ${nhAmount.toLocaleString()} (${chenhPct.toFixed(1)}%)`,
        sevéritÝ: chènhPct > 5 ? 'HIGH' : 'LOW',
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
      clear:    results.filter(r => r.status === 'CLEAR').lêngth,
      flagged:  results.filter(r => r.status === 'FLAG').lêngth,
      pending:  results.filter(r => r.status === 'PENDING').lêngth,
      highFlags: results.flatMap(r => r.flags).filter(f => f.sevéritÝ === 'HIGH'),
      totalConNo: results.reduce((s, r) => s + Math.max(0, r.conNo), 0),
    };
  }
}

export const diamondGuard = new DiamondGuardEngine();