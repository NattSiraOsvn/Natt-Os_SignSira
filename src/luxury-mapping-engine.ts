/**
 * NATT-OS Luxury Mapping Engine v1.0
 * Port từ TAM ULTRA PRO Doc 13 + Doc 6
 *
 * Xử lý 3 luồng mapping cốt lõi của Tâm Luxury:
 *   1. DTHU → LGT (41 cột doanh thu)
 *   2. GCOC (Giấy Cọc) → mapping vào đơn hàng
 *   3. GDB  (Giấy Đảm Bảo) → mapping vào SP đã bán
 *
 * Target: sales-cell + gcoc-cell + warranty-cell
 */

// ── CONFIG ────────────────────────────────────────────────────────────────
export const LUXURY_COLS = {
  DTHU_NGAY:    3,  // cột D — ngày giao dịch
  DTHU_TEN:     4,  // cột E — tên khách
  DTHU_SDT:     5,  // cột F — SĐT (sẽ encrypt)
  DTHU_MASP:    6,  // cột G — mã sản phẩm
  GCOC_TARGET_B: 41, // cột AP — giá cọc
  GCOC_TARGET_K: 42, // cột AQ — kỳ hạn cọc
  GDB_TARGET_B:  43, // cột AR — giá bảo hành / ngày cấp GDB
  GDB_TARGET_N:  44, // cột AS — nội dung bảo hành
} as const;

export const SALT = '🔒_';
export const DECRYPT_PASSWORD = '2610';

// ── PHONE HEADERS ─────────────────────────────────────────────────────────
export const PHONE_HEADERS = [
  'phone','sdt','number','đt','dt','xcode','tel','mobile','dienthoai',
];

// ── BACKUP MAP — 14 sheets nguồn ─────────────────────────────────────────
export const BACKUP_MAP: Record<string, string> = {
  'Thiện':          'Backup_Thiện_MAP',
  'list':           'Backup_list',
  'SỔ KHO':         'Backup_SỔ KHO_MAP',
  'SLRPOINT':       'Backup_SLRPOINT',
  'QuỹCĐ':          'Backup_QuỹCĐ',
  'THƯDTHN':        'Backup_THƯDTHN',
  'QuỹCĐaHiếu':     'Backup_QuỹCĐaHiếu',
  'SENDINFO':       'Backup_SENDINFO',
  'QT':             'Backup_QT',
  'nhấttín':        'Backup_nhấttín',
  'Hoa':            'Backup_Hoa',
  'MáyRung':        'Backup_MáyRung',
  'KhoViênChủ':     'Backup_KhoViênChủ',
  'KhoBụiVàngDuy':  'Backup_KhoBụiVàngDuy',
};

// ── JEWELRY SPECS ─────────────────────────────────────────────────────────
export const GOLD_TYPES = {
  '24K': { rate: 0.9999, code: '9999' },
  '18K': { rate: 0.7500, code: '750'  },
  '14K': { rate: 0.5850, code: '585'  },
  '10K': { rate: 0.4160, code: '416'  },
} as const;

/** Prefix mã sản phẩm Tâm Luxury */
export const PRODUCT_PREFIXES = [
  'NNA','NNU','NC','NK','VT','LT','BT','MD','PK','KC','VC',
];

// ── TRACKED STATUSES (tiếng Việt + Anh) ──────────────────────────────────
export const TRACKED_STATUSES = {
  COMPLETED:   ['Hoàn thành','Done','Xong','Completed','Đã giao','Đã thanh toán','Closed'],
  IN_PROGRESS: ['Đang xử lý','Processing','Đang làm','In Progress','Pending'],
  PAID:        ['Đã thanh toán','Paid','Đã thu tiền','Settled'],
  CANCELLED:   ['Hủy','Cancelled','Đã hủy','Failed'],
  PENDING:     ['Chờ','Waiting','Chờ xử lý','On Hold'],
} as const;

export type TrackedStatus = keyof typeof TRACKED_STATUSES;

/** Nhận diện status từ giá trị cell */
export function detectStatus(value: unknown): TrackedStatus | null {
  if (!value) return null;
  const v = String(value).trim();
  for (const [status, keywords] of Object.entries(TRACKED_STATUSES)) {
    if (keywords.some(k => v.toLowerCase().includes(k.toLowerCase()))) {
      return status as TrackedStatus;
    }
  }
  return null;
}

// ── KEY_COLUMNS MAP ───────────────────────────────────────────────────────
/** Từ khóa nhận diện cột quan trọng — port từ Doc 11 MONITOR_CONFIG */
export const KEY_COLUMNS = {
  ID:       ['Mã','ID','Mã ĐH','OrderID','Code','Ref','Số ĐH','Mã SP'],
  STATUS:   ['Trạng Thái','Status','Tình Trạng','State','Progress'],
  DATE:     ['Ngày','Date','Thời Gian','Time','Ngày tạo','Created'],
  CUSTOMER: ['Khách','Customer','Tên KH','Client','Người nhận'],
  AMOUNT:   ['Số Tiền','Amount','Giá','Price','Thành Tiền','Total'],
  PHONE:    ['SĐT','Phone','Điện Thoại','Mobile','Contact'],
} as const;

/**
 * extractKeyData — trích xuất thông tin quan trọng từ 1 row
 * Port từ Doc 11 Smart Monitor extractKeyData()
 */
export function extractKeyData(
  row: unknown[],
  headers: string[],
): Record<string, unknown> {
  const extracted: Record<string, unknown> = {};

  headers.forEach((header, i) => {
    if (!header || row[i] === null || row[i] === undefined || row[i] === '') return;
    const h = header.toLowerCase();
    const val = row[i];

    // Map theo KEY_COLUMNS
    for (const [keyType, keywords] of Object.entries(KEY_COLUMNS)) {
      if (keywords.some(kw => h.includes(kw.toLowerCase()))) {
        extracted[keyType.toLowerCase()] = val;
      }
    }

    // Detect status
    const status = detectStatus(val);
    if (status) {
      extracted['status']       = status;
      extracted['statusDetail'] = val;
    }
  });

  return extracted;
}

// ── NORMALIZE TEXT ────────────────────────────────────────────────────────
/**
 * Bỏ dấu tiếng Việt đầy đủ — port từ Doc 12 HR normalizeText()
 * Dùng cho: so sánh header, match key, search
 */
export function normalizeText(str: unknown): string {
  if (!str) return '';
  let s = String(str).toLowerCase().trim();
  s = s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  s = s.replace(/đ/g, 'd').replace(/Đ/g, 'd');
  return s;
}

export function normalizeHeader(str: unknown): string {
  return normalizeText(str).replace(/\s+/g, '');
}

// ── CLEAN MONEY ───────────────────────────────────────────────────────────
/**
 * Parse tiền tệ từ mọi định dạng — port từ Doc 6 parseMoney() + Doc 12 cleanMoney()
 * '1 tỷ 2' → 1200000000
 * '500k'   → 500000
 * '1.5tr'  → 1500000
 * '10.000.000 đ' → 10000000
 */
export function parseMoney(val: unknown): number {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  const s = String(val).toLowerCase().replace(/\s/g, '');

  // Tỷ
  if (s.includes('ty') || s.includes('tỷ')) {
    return parseFloat(s) * 1_000_000_000;
  }
  // Triệu
  if (s.includes('tr') || s.includes('m')) {
    const n = parseFloat(s.replace(/tr|triệu|m/g, '').replace(',', '.'));
    return isNaN(n) ? 0 : n * 1_000_000;
  }
  // Ngàn
  if (s.includes('k') || s.includes('ng')) {
    return parseFloat(s) * 1_000;
  }
  // Số thuần (có thể có dấu chấm/phẩy phân cách)
  const cleaned = s.replace(/[^0-9]/g, '');
  return cleaned ? parseInt(cleaned) : 0;
}

// ── ENCRYPT / DECRYPT SĐT ─────────────────────────────────────────────────
/**
 * Encrypt SĐT bằng base64 + salt — port từ Doc 13 normalizeAndEncrypt()
 * GAS dùng Utilities.base64Encode — browser dùng btoa
 */
export function encryptPhone(phone: unknown): string {
  if (!phone) return '';
  const clean = String(phone).replace(/[^0-9]/g, '');
  if (!clean) return '';
  try {
    return SALT + btoa(unescape(encodeURIComponent(clean)));
  } catch {
    return SALT + btoa(clean);
  }
}

export function decryptPhone(encrypted: string, password: string): string | null {
  if (password !== DECRYPT_PASSWORD) return null;
  if (!encrypted?.startsWith(SALT)) return encrypted;
  try {
    const encoded = encrypted.replace(SALT, '');
    return decodeURIComponent(escape(atob(encoded)));
  } catch {
    return null;
  }
}

export function isEncrypted(val: unknown): boolean {
  return String(val || '').startsWith(SALT);
}

// ── CLEAN FOR MATCH KEY ───────────────────────────────────────────────────
/**
 * Chuẩn hóa giá trị để so sánh — port từ Doc 13 cleanForMatch()
 * Bỏ salt, bỏ ký tự đặc biệt, lowercase
 */
export function cleanForMatch(val: unknown): string {
  if (!val) return '';
  let s = String(val).replace(SALT, '');
  if (val instanceof Date) {
    return `${val.getDate()}${val.getMonth()+1}${val.getFullYear()}`;
  }
  return s.replace(/[^0-9a-zA-Z]/g, '').toLowerCase().trim();
}

// ── BUILD MATCH KEY ───────────────────────────────────────────────────────
/**
 * Tạo composite key để match GCOC/GDB với LGT
 * Key = ngày + tên + SĐT + mã SP (join cleaned)
 */
export function buildMatchKey(
  row: unknown[],
  colIndexes: number[],
): string {
  return colIndexes.map(i => cleanForMatch(row[i])).join('|');
}

// ── DTHU RECORD ───────────────────────────────────────────────────────────
export interface DthuRecord {
  ngay:    unknown;
  ten:     string;
  sdt:     string;  // encrypted
  maSP:    string;
  amount:  number;
  loai:    string;  // COC / THANH_TOAN / HT_COC / HOAN_TIEN
  rawRow:  unknown[];
}

export function parseDthuRow(row: unknown[]): DthuRecord {
  return {
    ngay:   row[LUXURY_COLS.DTHU_NGAY - 1],
    ten:    String(row[LUXURY_COLS.DTHU_TEN  - 1] || '').trim(),
    sdt:    encryptPhone(row[LUXURY_COLS.DTHU_SDT  - 1]),
    maSP:   String(row[LUXURY_COLS.DTHU_MASP - 1] || '').toUpperCase().trim(),
    amount: parseMoney(row[5]),
    loai:   String(row[1] || '').trim(),
    rawRow: row,
  };
}

// ── MAP EXTERNAL SOURCE ───────────────────────────────────────────────────
/**
 * Core mapping engine — port trực tiếp từ Doc 13 mapExternalSource()
 *
 * Match GCOC/GDB rows vào LGT bằng composite key:
 *   srcKey = [ngày, tên, SĐT, mã] cleaned
 *   destKey = LGT row cùng columns cleaned
 * Khi match → ghi fetchCols của src vào targetCols của dest
 */
export interface MappingConfig {
  name:        string;        // 'GCOC' | 'GDB'
  matchCols:   number[];      // src cols dùng tạo match key (0-indexed)
  fetchCols:   number[];      // src cols cần lấy giá trị
  targetCols:  number[];      // dest cols cần điền (LGT columns)
  destMatchCols: number[];    // dest cols tạo match key (thường [3,4,5,6])
}

export const GCOC_CONFIG: MappingConfig = {
  name:         'GCOC',
  matchCols:    [0, 3, 4],                  // ngày, tên, SĐT
  fetchCols:    [1, 10],                    // giá cọc, kỳ hạn
  targetCols:   [LUXURY_COLS.GCOC_TARGET_B - 1, LUXURY_COLS.GCOC_TARGET_K - 1],
  destMatchCols:[3, 4, 5],                  // LGT ngày, tên, SĐT
};

export const GDB_CONFIG: MappingConfig = {
  name:         'GDB',                      // Giấy Đảm Bảo (warranty)
  matchCols:    [0, 3, 4, 5],              // ngày, tên, SĐT, mã SP
  fetchCols:    [1, 13],                   // ngày cấp GDB, nội dung bảo hành
  targetCols:   [LUXURY_COLS.GDB_TARGET_B - 1, LUXURY_COLS.GDB_TARGET_N - 1],
  destMatchCols:[3, 4, 5, 6],              // LGT ngày, tên, SĐT, mã SP
};

export function mapExternalSource(
  srcRows:    unknown[][],
  destRows:   unknown[][],
  config:     MappingConfig,
): {
  matched:   number;
  unmatched: number;
  updates:   Array<{ destRowIdx: number; cols: number[]; values: unknown[] }>;
  toDelete:  number[];  // src row indexes matched (xóa sau khi map)
} {
  const updates:  Array<{ destRowIdx: number; cols: number[]; values: unknown[] }> = [];
  const toDelete: number[] = [];
  let unmatched = 0;

  // Build dest lookup map: matchKey → destRowIdx
  const destMap = new Map<string, number>();
  destRows.slice(1).forEach((row, i) => {
    const key = buildMatchKey(row, config.destMatchCols);
    if (key && key.replace(/\|/g, '')) destMap.set(key, i + 1);
  });

  // Map từng src row
  srcRows.slice(1).forEach((srcRow, srcIdx) => {
    const srcKey = buildMatchKey(srcRow, config.matchCols);
    if (!srcKey || !srcKey.replace(/\|/g, '')) return;

    const destIdx = destMap.get(srcKey);
    if (destIdx !== undefined) {
      // Match found — chuẩn bị update
      const values = config.fetchCols.map(c => srcRow[c]);
      updates.push({ destRowIdx: destIdx, cols: config.targetCols, values });
      toDelete.push(srcIdx + 1); // 1-indexed
    } else {
      unmatched++;
    }
  });

  // Sort toDelete descending (xóa từ dưới lên tránh shift index)
  toDelete.sort((a, b) => b - a);

  return { matched: updates.length, unmatched, updates, toDelete };
}

// ── NORMALIZE AND ENCRYPT ROW ─────────────────────────────────────────────
/**
 * Chuẩn hóa 1 row trước khi ghi vào LGT
 * Port từ Doc 13 normalizeAndEncrypt()
 */
export function normalizeRow(row: unknown[]): unknown[] {
  const r = [...row];
  // Encrypt SĐT (col index 5, 0-indexed = 4)
  if (r[4]) r[4] = encryptPhone(r[4]);
  // Mã SP uppercase
  if (r[5]) r[5] = String(r[5]).toUpperCase().trim();
  // Parse tiền tệ cho các cột tiền (col 7, 11, 12)
  [6, 10, 11].forEach(idx => {
    if (r[idx]) r[idx] = parseMoney(r[idx]) || 0;
  });
  return r;
}

// ── COMMISSION CALCULATOR ─────────────────────────────────────────────────
/**
 * Tính hoa hồng seller — port từ Doc 6 calculateCommission()
 * BÁN: 1%, ONLINE: 2%
 */
export function calcCommission(amount: number, type: string): number {
  const t = String(type || '').toUpperCase();
  if (t === 'BÁN' || t === 'BAN')   return amount * 0.01;
  if (t === 'ONLINE')                return amount * 0.02;
  return 0;
}

// ── INVENTORY LIFECYCLE STAGES ────────────────────────────────────────────
/**
 * Giai đoạn tồn kho — port từ Doc 6 mergeInventoryLifecycle()
 * PHÔI → BTP → THÀNH PHẨM → KHO CỬA HÀNG → ĐÃ BÁN
 */
export const INVENTORY_STAGES = [
  'PHÔI',
  'BTP',        // Bán Thành Phẩm
  'THÀNH PHẨM',
  'KHO CỬA HÀNG',
  'ĐÃ BÁN',
] as const;

export type InventoryStage = typeof INVENTORY_STAGES[number];

export function detectInventoryStage(sheetName: string): InventoryStage {
  const low = sheetName.toLowerCase();
  if (low.includes('phôi') || low.includes('đúc'))          return 'PHÔI';
  if (low.includes('btp') || low.includes('bán thành'))      return 'BTP';
  if (low.includes('thành phẩm') || low.includes('tp'))      return 'THÀNH PHẨM';
  if (low.includes('cửa hàng') || low.includes('showroom'))  return 'KHO CỬA HÀNG';
  if (low.includes('đã bán') || low.includes('sold'))        return 'ĐÃ BÁN';
  return 'THÀNH PHẨM';
}

export default {
  LUXURY_COLS, SALT, DECRYPT_PASSWORD, PHONE_HEADERS, BACKUP_MAP,
  GOLD_TYPES, PRODUCT_PREFIXES, TRACKED_STATUSES, KEY_COLUMNS,
  GCOC_CONFIG, GDB_CONFIG, INVENTORY_STAGES,
  detectStatus, extractKeyData,
  normalizeText, normalizeHeader, parseMoney,
  encryptPhone, decryptPhone, isEncrypted, cleanForMatch, buildMatchKey,
  parseDthuRow, mapExternalSource, normalizeRow,
  calcCommission, detectInventoryStage,
};
