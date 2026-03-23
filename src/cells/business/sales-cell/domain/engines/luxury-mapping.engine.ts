// @ts-nocheck
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
  PASSWORD_DECRYPT: '2610',
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
  sheetName: 'GCOC',
  matchIndexes: [0, 3, 4],
  fetchIndexes: [1, 10],
  targetIndexes: [LUXURY_CONFIG.COLS.GCOC_TARGET_B, LUXURY_CONFIG.COLS.GCOC_TARGET_K],
};

/** Cấu hình GDB (Giấy Đảm Bảo) — fetch cols 1,13 → target B,N */
export const GDB_CONFIG = {
  sheetName: 'GDB',
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
  'NU': 'NNU', 'NỮ': 'NNU', 'NA': 'NNA', 'NAM': 'NNA',
  'VONG': 'VT', 'V T': 'VT', 'VÒNG': 'VT',
  'LAC': 'LT', 'LẮC': 'LT',
  'BONG': 'BT', 'BTAI': 'BT', 'BÔNG': 'BT',
  'KIMCUONG': 'KC',
  'DAY': 'D', 'DÂY': 'D',
  'NHAN': 'N', 'NHẪN': 'N',
};

/** Trạng thái đơn được track trong vòng đời SP */
export const TRACKED_STATUSES = [
  'ĐÃ ĐẶT', 'ĐÃ CỌC', 'ĐÃ BÁN', 'ĐÃ GIAO', 'ĐÃ ĐỔI',
  'HT CỌC', 'HT ĐỔI', 'TRẢ LẠI',
];

/** Cột quan trọng trong DTHU/LGT */
export const KEY_COLUMNS = {
  NGAY: ['ngày', 'date', 'ngay'],
  TEN: ['tên khách', 'khách hàng', 'khách', 'ten', 'customer'],
  SDT: ['sđt', 'điện thoại', 'phone', 'sdt', 'mobile'],
  MASP: ['mã sp', 'mã sản phẩm', 'code', 'sku', 'masp'],
  MAVC: ['mã vc', 'mã vỏ', 'mavc'],
  GIA: ['giá', 'price', 'tiền', 'amount', 'gia'],
  LOAI: ['loại', 'type', 'loai'],
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
  if (!val) return '';
  if (val instanceof Date) {
    const d = String(val.getDate()).padStart(2, '0');
    const m = String(val.getMonth() + 1).padStart(2, '0');
    const y = val.getFullYear();
    return `${d}${m}${y}`;
  }
  const str = String(val).replace(LUXURY_CONFIG.SALT, '');
  return str.replace(/[^0-9a-zA-Z]/g, '').toLowerCase().trim();
}

/**
 * parseMoney — parse tiền VN từ mọi định dạng.
 * "167.500.000" → 167500000, "500tr" → 500000000, "1.5tr" → 1500000
 */
export function parseMoney(val: unknown): number {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  let s = String(val).toLowerCase().trim();

  // Viết tắt
  const trM = s.match(/(\d+[.,]\d+)\s*(tr|triệu)/i) || s.match(/(\d+)\s*(tr|triệu)/i);
  if (trM) return parseFloat(trM[1].replace(',', '.')) * 1_000_000;

  // Nhiều dấu chấm → thousands
  if (s.includes('.') && !s.includes(',') && (s.match(/\./g) || []).length > 1) {
    s = s.replace(/\./g, '');
  } else if (s.includes('.') && s.includes(',')) {
    s = s.lastIndexOf(',') > s.lastIndexOf('.')
      ? s.replace(/\./g, '').replace(',', '.')
      : s.replace(/,/g, '');
  } else if (s.includes(',') && !s.includes('.')) {
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
  if (!phone) return '';
  const clean = String(phone).replace(/[^0-9]/g, '');
  if (!clean) return '';
  try {
    return LUXURY_CONFIG.SALT + btoa(clean);
  } catch {
    return LUXURY_CONFIG.SALT + Buffer.from(clean).toString('base64');
  }
}

/**
 * decryptPhone — giải mã SĐT. Yêu cầu pass === PASSWORD_DECRYPT.
 * Trả null nếu pass sai hoặc không phải encrypted value.
 */
export function decryptPhone(encrypted: unknown, password: string): string | null {
  if (password !== LUXURY_CONFIG.PASSWORD_DECRYPT) return null;
  const s = String(encrypted || '');
  if (!s.startsWith(LUXURY_CONFIG.SALT)) return s; // chưa encrypt
  try {
    const encoded = s.replace(LUXURY_CONFIG.SALT, '');
    try {
      return atob(encoded);
    } catch {
      return Buffer.from(encoded, 'base64').toString('utf-8');
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
        const money = String(r[idx]).replace(/[^0-9]/g, '');
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
    const srcKey = matchIndexes.map(idx => cleanForMatch(srcRow[idx])).join('|');
    if (!srcKey.replace(/\|/g, '')) continue;

    for (let j = 1; j < dest.length; j++) {
      const destRow = dest[j];
      const destKey = [3, 4, 5, 6].slice(0, matchIndexes.length)
        .map(idx => cleanForMatch(destRow[idx])).join('|');

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
    return idx >= 0 ? row[idx] : '';
  };
  return {
    ngay: find(['ngay', 'date']),
    ten:  find(['tenkhach', 'khachhang', 'khach', 'customer']),
    sdt:  find(['sdt', 'dienthoai', 'phone', 'mobile']),
    masp: find(['masp', 'masanpham', 'code', 'sku']),
    mavc: find(['mavc', 'mavo', 'mavienchuoi']),
    gia:  find(['gia', 'price', 'tien', 'amount']),
    loai: find(['loai', 'type']),
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
  let note   = 'Bán mới';

  if (isDoi && thuLai && thuLai > 0) {
    const diff = giaSP - thuLai;
    if (diff <= 0) {
      hhVo = 0; hhVien = 0;
      note = `Đổi ngang/xuống (Thu ${thuLai.toLocaleString('vi-VN')}đ)`;
    } else {
      const ratio = diff / giaSP;
      hhVo   = hhVo   * ratio;
      hhVien = hhVien * ratio;
      note   = `Đổi bù ${Math.round(ratio * 100)}%`;
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
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd');

  if (/da ban|da giao|hoan thanh/.test(s)) return 'SOLD';
  if (/da doi|doi hang/.test(s))           return 'EXCHANGED';
  if (/tra lai|hoan tra/.test(s))          return 'RETURNED';
  if (/da coc|dat coc/.test(s))            return 'DEPOSITED';
  if (/da dat|cho giao/.test(s))           return 'ORDERED';
  if (/bao hanh|sua chua/.test(s))         return 'WARRANTY';
  if (/trung bay|showroom/.test(s))        return 'DISPLAY';
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
  const parts = String(maSPRaw || '')
    .split(/[\n\s,]+/)
    .map(s => s.trim())
    .filter(Boolean);

  const maVienList: string[] = [];
  const maSPParts: string[] = [];

  for (const p of parts) {
    if (/^VC\d+$/i.test(p)) maVienList.push(p.toUpperCase());
    else maSPParts.push(p);
  }

  return { maSPClean: maSPParts.join(', '), maVienList };
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
  // Build key map từ sell
  const sellH = sellHeaders.map(h => String(h || '').toLowerCase());
  const ngayIdxS  = sellH.findIndex(h => h.includes('ngày') || h.includes('date'));
  const khachIdxS = sellH.findIndex(h => h.includes('khách') || h.includes('ten'));
  const sdtIdxS   = sellH.findIndex(h => h.includes('sđt') || h.includes('phone'));
  const maSPIdxS  = sellH.findIndex(h => h.includes('mã sp') || h.includes('code'));
  const giaVoIdxS = sellH.findIndex(h => h.includes('tiền vỏ') || h.includes('gia vo'));
  const maVCIdxS  = sellH.findIndex(h => h.includes('mã vc'));
  const giaVienIdxS = sellH.findIndex(h => h.includes('tiền viên') || h.includes('gia vien'));
  const tongIdxS  = sellH.findIndex(h => h.includes('thành tiền') || h.includes('tong'));

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

  // Map sang life
  const lifeH = lifeHeaders.map(h => String(h || '').toLowerCase());
  const ngayIdxL  = lifeH.findIndex(h => h.includes('ngày') || h.includes('date'));
  const khachIdxL = lifeH.findIndex(h => h.includes('khách'));
  const sdtIdxL   = lifeH.findIndex(h => h.includes('sđt') || h.includes('phone'));

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
