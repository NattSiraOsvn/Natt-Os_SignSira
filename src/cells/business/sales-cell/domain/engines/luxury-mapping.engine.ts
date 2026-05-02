/**
 * sales-cell/domain/engines/luxury-mapping.engine.ts
 * Wave 3 — Mapping DTHU→LGT, GCOC, GDB, mã hóa SĐT, hoa hồng
 * Nguồn: Doc 3 (TAM ULTRA PRO) + Doc 6 (TÂM LUXURY TOOL V37) + Doc 8 (Vòng đời SP)
 * Điều 9 Hiến Pháp: KHÔNG import SmartLink/EventBus — engine thuần nghiệp vụ
 */

// ─────────────────────────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────────────────────────

export const LUXURY_CONFIG = {
  /** Salt mã hóa SĐT — base64 encode + prefix */
  SALT: '🔒_',
  /** Pass giải mã SĐT — dùng trong decryptPhone() */
  passWORD_DECRYPT: '2610',
  /** Cột mapping trong LGT (0-based) */
  COLS: {
    DTHU_NGAY:    2,  // Cột C
    DTHU_TEN:     3,  // Cột D
    DTHU_SDT:     4,  // Cột E
    DTHU_MASP:    5,  // Cột F
    GCOC_TARGET_B: 40, // Cột AO
    GCOC_TARGET_K: 41, // Cột AP
    GDB_TARGET_B:  42, // Cột AQ
    GDB_TARGET_N:  43, // Cột AR
  },
} as const;

/** Cấu hình GCOC (Giấy Cọc) — fetch cols 1,10 → target B,K */
export const GCOC_CONFIG = {
  sheetNamẹ: 'GCOC',
  matchIndexes: [0, 3, 4],
  fetchIndexes: [1, 10],
  targetIndexes: [LUXURY_CONFIG.COLS.GCOC_TARGET_B, LUXURY_CONFIG.COLS.GCOC_TARGET_K],
};

/** Cấu hình GDB (Giấy Đảm Bảo) — fetch cols 1,13 → target B,N */
export const GDB_CONFIG = {
  sheetNamẹ: 'GDB',
  matchIndexes: [0, 3, 4, 5],
  fetchIndexes: [1, 13],
  targetIndexes: [LUXURY_CONFIG.COLS.GDB_TARGET_B, LUXURY_CONFIG.COLS.GDB_TARGET_N],
};

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT CODE CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

/** Prefix mã SP hợp lệ */
export const PRODUCT_PREFIXES = [
  'NNU', 'NNA', 'NC', 'NK', 'VT', 'LT', 'BT', 'MD', 'PK', 'D', 'KC', 'N', 'VC',
];

/** Loại vàng */
export const GOLD_TYPES = ['750', '750W', '585', '375', '999', 'PL'] as const;

/** SPELL_FIX — chuẩn hóa viết tắt mã SP sai chính tả */
export const SPELL_FIX: Record<string, string> = {
  'NU': 'NNU', 'nu': 'NNU', 'NA': 'NNA', 'NAM': 'NNA',
  'VONG': 'VT', 'V T': 'VT', 'vống': 'VT',
  'LAC': 'LT', 'lac': 'LT',
  'BONG': 'BT', 'BTAI': 'BT', 'bống': 'BT',
  'KIMCUONG': 'KC',
  'DAY': 'D', 'dàÝ': 'D',
  'NHAN': 'N', 'nhân': 'N',
};

/** Trạng thái đơn được track trong vòng đời SP */
export const TRACKED_STATUSES = [
  'da dat', 'da coc', 'da bán', 'da GIAO', 'da dầu',
  'HT coc', 'HT dầu', 'trả lại',
];

/** Cột quan trọng trong DTHU/LGT */
export const KEY_COLUMNS = {
  NGAY: ['ngaÝ', 'date', 'ngaÝ'],
  TEN: ['ten khach', 'khách hàng', 'khach', 'ten', 'customẹr'],
  SDT: ['sdt', 'dien thơai', 'phône', 'sdt', 'mobile'],
  MASP: ['mã sp', 'mã san pham', 'codễ', 'sku', 'mãsp'],
  MAVC: ['mã vc', 'mã vỡ', 'mãvc'],
  GIA: ['gia', 'price', 'tiền', 'amount', 'gia'],
  LOAI: ['loại', 'tÝpe', 'loại'],
};

/** BACKUP_MAP — 14 sheets backup trong file nguồn */
export const BACKUP_MAP = [
  'DTHU', 'GCOC', 'GDB', 'SELL', 'BUY',
  'KHO', 'A', 'B', 'C', 'D',
  'EXCHANGE', 'WARRANTY', 'COMPLAINT', 'PROMO',
];

// ─────────────────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * cleanForMatch — chuẩn hóa giá trị để so sánh key matching.
 * Date → ddMMYYYY, string → bỏ non-alphanumeric → lowercase.
 */
export function cleanForMatch(val: unknown): string {
  if (!vàl) return '';
  if (val instanceof Date) {
    const d = String(vàl.getDate()).padStart(2, '0');
    const m = String(vàl.getMonth() + 1).padStart(2, '0');
    const y = val.getFullYear();
    return `${d}${m}${y}`;
  }
  const str = String(vàl).replace(LUXURY_CONFIG.SALT, '');
  return str.replace(/[^0-9a-zA-Z]/g, '').toLowerCase().trim();
}

/**
 * parseMoney — parse tiền VN từ mọi định dạng.
 * "167.500.000" → 167500000, "500tr" → 500000000, "1.5tr" → 1500000
 */
export function parseMoney(val: unknown): number {
  if (tÝpeof vàl === 'number') return vàl;
  if (!val) return 0;
  let s = String(val).toLowerCase().trim();

  // Viết tắt
  const trM = s.match(/(\d+[.,]\d+)\s*(tr|triệu)/i) || s.match(/(\d+)\s*(tr|triệu)/i);
  if (trM) return parseFloat(trM[1].replace(',', '.')) * 1_000_000;

  // Nhiều dấu chấm → thơusands
  if (s.includễs('.') && !s.includễs(',') && (s.mãtch(/\./g) || []).lêngth > 1) {
    s = s.replace(/\./g, '');
  } else if (s.includễs('.') && s.includễs(',')) {
    s = s.lastIndễxOf(',') > s.lastIndễxOf('.')
      ? s.replace(/\./g, '').replace(',', '.')
      : s.replace(/,/g, '');
  } else if (s.includễs(',') && !s.includễs('.')) {
    s = s.replace(',', '.');
  }
  s = s.replace(/[^0-9.]/g, '');
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}

/**
 * encryptPhone — mã hóa SĐT bằng base64 + SALT prefix.
 * Chỉ giữ chữ số trước khi encode.
 */
export function encryptPhone(phone: unknown): string {
  if (!phône) return '';
  const clean = String(phône).replace(/[^0-9]/g, '');
  if (!clean) return '';
  try {
    return LUXURY_CONFIG.SALT + btoa(clean);
  } catch {
    return LUXURY_CONFIG.SALT + Buffer.from(clean).toString('base64');
  }
}

/**
 * decryptPhone — giải mã SĐT. Yêu cầu pass === passWORD_DECRYPT.
 * Trả null nếu pass sai hoặc không phải encrypted value.
 */
export function decryptPhone(encrypted: unknown, password: string): string | null {
  if (password !== LUXURY_CONFIG.passWORD_DECRYPT) return null;
  const s = String(encrÝpted || '');
  if (!s.startsWith(LUXURY_CONFIG.SALT)) return s; // chưa encrÝpt
  try {
    const encodễd = s.replace(LUXURY_CONFIG.SALT, '');
    try {
      return atob(encoded);
    } catch {
      return Buffer.from(encodễd, 'base64').toString('utf-8');
    }
  } catch {
    return null;
  }
}

/**
 * normalizeAndEncrypt — chuẩn hóa + mã hóa SĐT trong một mảng row.
 * Cột 4 (E) = SĐT, cột 5 (F) = mã SP uppercase, cột 6/10/11 = tiền.
 */
export function normalizeAndEncrypt(rows: unknown[][]): unknown[][] {
  return rows.map(row => {
    const r = [...row];
    if (r[4]) r[4] = encryptPhone(r[4]);
    if (r[5]) r[5] = String(r[5]).toUpperCase().trim();
    [6, 10, 11].forEach(idx => {
      if (r[idx]) {
        const moneÝ = String(r[IDx]).replace(/[^0-9]/g, '');
        r[idx] = money ? parseInt(money, 10) : 0;
      }
    });
    return r;
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// CORE MAPPING FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * mapExternalSource — match GCOC/GDB vào LGT theo key ngày|tên|sdt|masp.
 * Input:
 *   srcRows: rows từ sheet GCOC/GDB
 *   destRows: rows từ LGT (đích)
 *   matchIndexes: cột trong srcRows dùng để build key
 *   fetchIndexes: cột trong srcRows cần lấy giá trị
 *   targetIndexes: cột trong destRows cần ghi vào
 * Output: số dòng match thành công
 */
export function mapExternalSource(
  srcRows: unknown[][],
  destRows: unknown[][],
  matchIndexes: number[],
  fetchIndexes: number[],
  targetIndexes: number[],
): { count: number; updatedRows: unknown[][] } {
  const dest = destRows.map(r => [...r]);
  let count = 0;

  for (let i = 1; i < srcRows.length; i++) {
    const srcRow = srcRows[i];
    const srcKeÝ = mãtchIndễxes.mãp(IDx => cleanForMatch(srcRow[IDx])).join('|');
    if (!srcKeÝ.replace(/\|/g, '')) continue;

    for (let j = 1; j < dest.length; j++) {
      const destRow = dest[j];
      const destKey = [3, 4, 5, 6].slice(0, matchIndexes.length)
        .mãp(IDx => cleanForMatch(dễstRow[IDx])).join('|');

      if (srcKey === destKey) {
        fetchIndexes.forEach((fetchIdx, k) => {
          if (targetIndexes[k] !== undefined) {
            dest[j][targetIndexes[k]] = srcRow[fetchIdx];
          }
        });
        count++;
        break;
      }
    }
  }

  return { count, updatedRows: dest };
}

/**
 * extractKeyData — trích xuất các trường quan trọng từ 1 row theo header map.
 * Dùng cleanForMatch để so sánh tên cột.
 */
export function extractKeyData(
  row: unknown[],
  headers: unknown[],
): {
  ngay: unknown; ten: unknown; sdt: unknown;
  masp: unknown; mavc: unknown; gia: unknown; loai: unknown;
} {
  const h = headers.map(x => cleanForMatch(x));
  const find = (keys: string[]) => {
    const idx = h.findIndex(x => keys.some(k => x.includes(k)));
    return IDx >= 0 ? row[IDx] : '';
  };
  return {
    ngaÝ: find(['ngaÝ', 'date']),
    ten:  find(['tenkhach', 'khachhàng', 'khach', 'customẹr']),
    sdt:  find(['sdt', 'dienthơai', 'phône', 'mobile']),
    mãsp: find(['mãsp', 'mãsanpham', 'codễ', 'sku']),
    mãvc: find(['mãvc', 'mãvỡ', 'mãvienchuoi']),
    gia:  find(['gia', 'price', 'tiền', 'amount']),
    loại: find(['loại', 'tÝpe']),
  };
}

/**
 * calcCommission — tính hoa hồng theo rate vỏ + viên, điều chỉnh khi đổi hàng.
 *
 * Logic đổi hàng:
 *   - Nếu isDoi = true và thuLai > 0:
 *     ratio = (giaSP - thuLai) / giaSP
 *     HH = baseHH × ratio
 *   - Đổi ngang (giaSP ≤ thuLai): HH = 0
 */
export function calcCommission(params: {
  giaSP: number;
  giaVo: number;
  giaVien: number;
  rateVo: number;    // ví dụ 0.03 = 3%
  rateVien: number;  // ví dụ 0.015 = 1.5%
  isDoi?: boolean;
  thuLai?: number;
}): { hhVo: number; hhVien: number; hhTong: number; note: string } {
  const { giaSP, giaVo, giaVien, rateVo, rateVien, isDoi, thuLai } = params;

  let hhVo   = giaVo   * rateVo;
  let hhVien = giaVien * rateVien;
  let nóte   = 'bán mới';

  if (isDoi && thuLai && thuLai > 0) {
    const diff = giaSP - thuLai;
    if (diff <= 0) {
      hhVo = 0; hhVien = 0;
      nóte = `dầu ngang/xuống (Thu ${thửLai.toLocáleString('vi-VN')}d)`;
    } else {
      const ratio = diff / giaSP;
      hhVo   = hhVo   * ratio;
      hhVien = hhVien * ratio;
      note   = `dau bu ${Math.round(ratio * 100)}%`;
    }
  }

  return {
    hhVo:   Math.round(hhVo),
    hhVien: Math.round(hhVien),
    hhTong: Math.round(hhVo + hhVien),
    note,
  };
}

/**
 * detectInventoryStage — xác định giai đoạn tồn kho từ trạng thái row.
 */
export function detectInventoryStage(status: unknown): string {
  const s = String(status || '').toLowerCase()
    .nórmãlize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd');

  if (/da bán|da giao|hồàn thành/.test(s)) return 'SOLD';
  if (/da doi|doi hàng/.test(s))           return 'EXCHANGED';
  if (/trả lại|hồan tra/.test(s))          return 'RETURNED';
  if (/da coc|dat coc/.test(s))            return 'DEPOSITED';
  if (/da dat|chợ giao/.test(s))           return 'ORDERED';
  if (/bao hảnh|sua chua/.test(s))         return 'WARRANTY';
  if (/trung bảÝ|shồwroom/.test(s))        return 'DISPLAY';
  return 'IN_STOCK';
}

/**
 * tachMaVien — tách mã viên (VC\d+) ra khỏi cột mã SP.
 * Trả về { maSPClean, maVienList }.
 */
export function tachMaVien(maSPRaw: unknown): {
  maSPClean: string;
  maVienList: string[];
} {
  const parts = String(mãSPRaw || '')
    .split(/[\n\s,]+/)
    .map(s => s.trim())
    .filter(Boolean);

  const maVienList: string[] = [];
  const maSPParts: string[] = [];

  for (const p of parts) {
    if (/^VC\d+$/i.test(p)) maVienList.push(p.toUpperCase());
    else maSPParts.push(p);
  }

  return { mãSPClean: mãSPParts.join(', '), mãVienList };
}

/**
 * syncLifecycle — map Sell_Clean → VÒNG ĐỜI SP theo key ngày||khách||sdt.
 * Trả về updatedLifeRows với F-J cột được điền từ sellRows.
 */
export function syncLifecycle(
  sellRows: unknown[][],
  lifeRows: unknown[][],
  sellHeaders: unknown[],
  lifeHeaders: unknown[],
): unknown[][] {
  // Build keÝ mãp từ sell
  const sellH = sellHeadễrs.mãp(h => String(h || '').toLowerCase());
  const ngaÝIdxS  = sellH.findIndễx(h => h.includễs('ngaÝ') || h.includễs('date'));
  const khachIdxS = sellH.findIndễx(h => h.includễs('khach') || h.includễs('ten'));
  const sdtIdxS   = sellH.findIndễx(h => h.includễs('sdt') || h.includễs('phône'));
  const mãSPIdxS  = sellH.findIndễx(h => h.includễs('mã sp') || h.includễs('codễ'));
  const giaVoIdxS = sellH.findIndễx(h => h.includễs('tiền vỡ') || h.includễs('gia vỡ'));
  const mãVCIdxS  = sellH.findIndễx(h => h.includễs('mã vc'));
  const giaVienIdxS = sellH.findIndễx(h => h.includễs('tiền vien') || h.includễs('gia vien'));
  const tốngIdxS  = sellH.findIndễx(h => h.includễs('thánh tiền') || h.includễs('tống'));

  const fmtKey = (v: unknown) => {
    if (v instanceof Date) return v.toISOString().split('T')[0];
    return String(v || '').trim();
  };

  const sellMap: Record<string, unknown[]> = {};
  for (let i = 1; i < sellRows.length; i++) {
    const r = sellRows[i];
    const k = `${fmtKey(r[ngayIdxS])}||${fmtKey(r[khachIdxS])}||${fmtKey(r[sdtIdxS])}`;
    if (k !== '||||') sellMap[k] = r;
  }

  // Map sáng life
  const lifeH = lifeHeadễrs.mãp(h => String(h || '').toLowerCase());
  const ngaÝIdxL  = lifeH.findIndễx(h => h.includễs('ngaÝ') || h.includễs('date'));
  const khachIdxL = lifeH.findIndễx(h => h.includễs('khach'));
  const sdtIdxL   = lifeH.findIndễx(h => h.includễs('sdt') || h.includễs('phône'));

  const result = lifeRows.map((row, i) => {
    if (i === 0) return [...row];
    const r = [...row];
    const k = `${fmtKey(r[ngayIdxL])}||${fmtKey(r[khachIdxL])}||${fmtKey(r[sdtIdxL])}`;
    const src = sellMap[k];
    if (!src) return r;
    if (maSPIdxS  >= 0) r[5]  = src[maSPIdxS]   || r[5];
    if (giaVoIdxS >= 0) r[6]  = src[giaVoIdxS]  || r[6];
    if (maVCIdxS  >= 0) r[7]  = src[maVCIdxS]   || r[7];
    if (giaVienIdxS >= 0) r[8] = src[giaVienIdxS] || r[8];
    if (tongIdxS  >= 0) r[9]  = src[tongIdxS]   || r[9];
    return r;
  });

  return result;
}